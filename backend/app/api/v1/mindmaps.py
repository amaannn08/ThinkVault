from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.models.mindmap import MindMap
from app.schemas.mindmap import MindMapOut, MindMapUpdate
from app.services.auth_service import get_current_user
from app.services.mindmap_service import generate_mindmap
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/mindmaps", tags=["mindmaps"])


@router.post("/generate/{document_id}", response_model=MindMapOut, status_code=201)
async def generate(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mindmap = await generate_mindmap(document_id, current_user.id, db)
    return mindmap


@router.get("", response_model=list[MindMapOut])
async def list_mindmaps(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(MindMap)
        .where(MindMap.user_id == current_user.id)
        .order_by(MindMap.updated_at.desc())
    )
    return result.scalars().all()


@router.get("/{mindmap_id}", response_model=MindMapOut)
async def get_mindmap(
    mindmap_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(MindMap).where(MindMap.id == mindmap_id, MindMap.user_id == current_user.id)
    )
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(404, "Mind map not found")
    return m


@router.put("/{mindmap_id}", response_model=MindMapOut)
async def update_mindmap(
    mindmap_id: uuid.UUID,
    data: MindMapUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(MindMap).where(MindMap.id == mindmap_id, MindMap.user_id == current_user.id)
    )
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(404, "Mind map not found")

    m.graph_json = data.graph_json
    if data.title:
        m.title = data.title
    m.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(m)
    return m
