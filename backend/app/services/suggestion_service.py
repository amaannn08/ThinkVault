from sqlalchemy.ext.asyncio import AsyncSession
from app.services.embedding_service import generate_embedding
from app.services.vector_search_service import vector_search
import uuid


async def get_suggestions(
    query_partial: str,
    user_id: uuid.UUID,
    db: AsyncSession,
    top_k: int = 4,
) -> list[str]:
    """
    Real-time search suggestions using fast vector lookup.
    Embeds partial query and returns top semantic matches
    from the user's knowledge base.
    """
    if len(query_partial.strip()) < 2:
        return []

    query_vec = await generate_embedding(query_partial)
    chunks = await vector_search(query_vec, user_id, db, top_k=top_k)

    # Extract the most relevant short excerpt per result as suggestion
    suggestions = []
    seen = set()
    for chunk in chunks:
        # Take first sentence from chunk as suggestion
        excerpt = chunk.content.split(".")[0].strip()
        if excerpt and excerpt not in seen and len(excerpt) > 20:
            suggestions.append(excerpt[:120])
            seen.add(excerpt)

    return suggestions[:top_k]
