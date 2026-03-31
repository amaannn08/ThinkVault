from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.models.mindmap import ChatMessage
from app.schemas.chat import ChatRequest, ChatResponse, ChatHistoryItem
from app.services.auth_service import get_current_user
from app.services.rag_service import rag_answer

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await rag_answer(
        query=req.query,
        user_id=current_user.id,
        session_id=req.session_id,
        db=db,
        document_id=req.document_id,
    )
    return ChatResponse(**result)


@router.get("/history", response_model=list[ChatHistoryItem])
async def get_history(
    session_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == current_user.id, ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .limit(50)
    )
    return result.scalars().all()
