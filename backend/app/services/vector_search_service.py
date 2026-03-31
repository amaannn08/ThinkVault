from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.models.embedding import Embedding
from app.models.document import Document, ContentChunk
from app.schemas.search import ChunkResult
import uuid
from loguru import logger


async def vector_search(
    query_vector: list[float],
    user_id: uuid.UUID,
    db: AsyncSession,
    top_k: int = 5,
    document_id: uuid.UUID | None = None,
) -> list[ChunkResult]:
    """
    Perform cosine similarity search using pgvector's <=> operator.
    Filters by user_id to scope results. Optionally filter by document_id.
    Returns top-k most similar chunks ranked by similarity.
    """
    vector_str = "[" + ",".join(str(v) for v in query_vector) + "]"

    # Build the SQL with pgvector cosine distance operator
    if document_id:
        sql = text("""
            SELECT
                e.id AS embedding_id,
                e.chunk_id,
                e.document_id,
                d.title AS document_title,
                c.content,
                1 - (e.vector <=> CAST(:query_vec AS vector)) AS similarity
            FROM embeddings e
            JOIN content_chunks c ON c.id = e.chunk_id
            JOIN documents d ON d.id = e.document_id
            WHERE e.user_id = :user_id AND e.document_id = :document_id
            ORDER BY e.vector <=> CAST(:query_vec AS vector)
            LIMIT :top_k
        """)
        result = await db.execute(
            sql,
            {"query_vec": vector_str, "user_id": str(user_id), "document_id": str(document_id), "top_k": top_k},
        )
    else:
        sql = text("""
            SELECT
                e.id AS embedding_id,
                e.chunk_id,
                e.document_id,
                d.title AS document_title,
                c.content,
                1 - (e.vector <=> CAST(:query_vec AS vector)) AS similarity
            FROM embeddings e
            JOIN content_chunks c ON c.id = e.chunk_id
            JOIN documents d ON d.id = e.document_id
            WHERE e.user_id = :user_id
            ORDER BY e.vector <=> CAST(:query_vec AS vector)
            LIMIT :top_k
        """)
        result = await db.execute(
            sql,
            {"query_vec": vector_str, "user_id": str(user_id), "top_k": top_k},
        )

    rows = result.fetchall()
    return [
        ChunkResult(
            chunk_id=row.chunk_id,
            document_id=row.document_id,
            document_title=row.document_title,
            content=row.content,
            similarity=float(row.similarity),
        )
        for row in rows
    ]
