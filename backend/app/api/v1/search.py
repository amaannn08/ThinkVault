from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.schemas.search import SearchRequest, SearchResponse, SuggestionResponse
from app.services.auth_service import get_current_user
from app.services.embedding_service import generate_embedding
from app.services.vector_search_service import vector_search
from app.services.suggestion_service import get_suggestions

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResponse)
async def semantic_search(
    req: SearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query_vec = await generate_embedding(req.query)
    results = await vector_search(query_vec, current_user.id, db, top_k=req.top_k)
    return SearchResponse(query=req.query, results=results)


@router.get("/suggestions", response_model=SuggestionResponse)
async def search_suggestions(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suggestions = await get_suggestions(q, current_user.id, db)
    return SuggestionResponse(suggestions=suggestions)
