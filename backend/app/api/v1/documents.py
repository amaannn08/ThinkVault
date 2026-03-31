from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.user import User
from app.models.document import Document, ContentChunk
from app.models.embedding import Embedding
from app.schemas.document import DocumentOut, DocumentListResponse
from app.services.auth_service import get_current_user
from app.services.ingestion_service import clean_text, chunk_text, parse_pdf, parse_url
from app.services.embedding_service import generate_embedding
from loguru import logger
import uuid

router = APIRouter(prefix="/documents", tags=["documents"])


async def _process_document(doc: Document, db: AsyncSession):
    """Parse, chunk, embed, and store a document. Run synchronously after upload."""
    try:
        doc.status = "processing"
        await db.commit()

        # Chunk the raw text
        chunks = chunk_text(doc.raw_text or "")
        if not chunks:
            doc.status = "failed"
            await db.commit()
            return

        chunk_objects = []
        for i, chunk_text_content in enumerate(chunks):
            chunk = ContentChunk(
                document_id=doc.id,
                chunk_index=i,
                content=chunk_text_content,
                token_count=len(chunk_text_content.split()),
            )
            db.add(chunk)
            chunk_objects.append((i, chunk_text_content, chunk))

        await db.commit()
        # Refresh to get IDs
        for _, _, chunk in chunk_objects:
            await db.refresh(chunk)

        # Generate embeddings for each chunk
        for _, chunk_text_content, chunk in chunk_objects:
            vector = await generate_embedding(chunk_text_content)
            embedding = Embedding(
                chunk_id=chunk.id,
                document_id=doc.id,
                user_id=doc.user_id,
                vector=vector,
            )
            db.add(embedding)

        doc.status = "ready"
        doc.chunk_count = len(chunks)
        await db.commit()
        logger.info(f"Document {doc.id} processed: {len(chunks)} chunks embedded")

    except Exception as e:
        logger.error(f"Failed to process document {doc.id}: {e}")
        doc.status = "failed"
        await db.commit()


@router.post("/upload", response_model=DocumentOut, status_code=202)
async def upload_document(
    source_type: str = Form(...),  # text | pdf | url
    title: str = Form(...),
    content: str = Form(None),        # for text type
    source_url: str = Form(None),     # for url type
    file: UploadFile = File(None),    # for pdf type
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    raw_text = ""

    if source_type == "text":
        if not content:
            raise HTTPException(400, "Text content required")
        raw_text = clean_text(content)

    elif source_type == "pdf":
        if not file:
            raise HTTPException(400, "PDF file required")
        file_bytes = await file.read()
        raw_text = await parse_pdf(file_bytes)

    elif source_type == "url":
        if not source_url:
            raise HTTPException(400, "URL required")
        raw_text = await parse_url(source_url)
        if not title:
            title = source_url[:80]
    else:
        raise HTTPException(400, "source_type must be text, pdf, or url")

    if not raw_text.strip():
        raise HTTPException(422, "No content could be extracted")

    doc = Document(
        user_id=current_user.id,
        title=title,
        source_type=source_type,
        source_url=source_url,
        raw_text=raw_text,
        status="pending",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Process synchronously (embed + store)
    await _process_document(doc, db)
    await db.refresh(doc)

    return doc


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = await db.execute(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    docs = result.scalars().all()

    count_result = await db.execute(
        select(func.count()).select_from(Document).where(Document.user_id == current_user.id)
    )
    total = count_result.scalar()

    return DocumentListResponse(items=docs, total=total, page=page, page_size=page_size)


@router.get("/{document_id}", response_model=DocumentOut)
async def get_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    await db.delete(doc)
    await db.commit()
