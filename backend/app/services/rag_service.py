import httpx
import json
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.mindmap import ChatMessage
from app.services.embedding_service import generate_embedding
from app.services.vector_search_service import vector_search
import uuid


DEEPSEEK_CHAT_URL = f"{settings.DEEPSEEK_BASE_URL}/chat/completions"


def _build_rag_prompt(query: str, chunks: list, history: list[ChatMessage]) -> list[dict]:
    """Build DeepSeek messages array with context chunks and chat history."""
    context = "\n\n---\n\n".join(
        f"[Source: {c.document_title}]\n{c.content}" for c in chunks
    )

    system_msg = {
        "role": "system",
        "content": (
            "You are ThinkVault AI — a knowledgeable assistant that answers questions "
            "based on the user's personal knowledge base. Use the context below to answer. "
            "If the context doesn't contain the answer, say so clearly but try to help.\n\n"
            f"CONTEXT FROM KNOWLEDGE BASE:\n{context}"
        ),
    }

    messages = [system_msg]
    # Include last 6 messages of history
    for msg in history[-6:]:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": query})
    return messages


async def rag_answer(
    query: str,
    user_id: uuid.UUID,
    session_id: str,
    db: AsyncSession,
    document_id: uuid.UUID | None = None,
) -> dict:
    """
    Full RAG pipeline:
    1. Embed the query using Gemini
    2. Vector search in pgvector
    3. Build prompt with context
    4. Send to DeepSeek
    5. Persist messages to DB
    6. Return answer + sources
    """
    # 1. Embed query
    query_vec = await generate_embedding(query)

    # 2. Retrieve top-k relevant chunks
    chunks = await vector_search(query_vec, user_id, db, top_k=settings.VECTOR_SEARCH_TOP_K, document_id=document_id)

    # 3. Load chat history
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user_id, ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .limit(12)
    )
    history = result.scalars().all()

    # 4. Build prompt and call DeepSeek
    messages = _build_rag_prompt(query, chunks, history)

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            DEEPSEEK_CHAT_URL,
            headers={
                "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "deepseek-chat",
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 1500,
            },
        )
        resp.raise_for_status()

    answer = resp.json()["choices"][0]["message"]["content"]

    # 5. Persist to DB
    user_msg = ChatMessage(user_id=user_id, role="user", content=query, session_id=session_id)
    assistant_msg = ChatMessage(user_id=user_id, role="assistant", content=answer, session_id=session_id)
    db.add(user_msg)
    db.add(assistant_msg)
    await db.commit()

    sources = [
        {"document_id": str(c.document_id), "document_title": c.document_title, "excerpt": c.content[:200], "similarity": c.similarity}
        for c in chunks
    ]
    return {"answer": answer, "session_id": session_id, "sources": sources}
