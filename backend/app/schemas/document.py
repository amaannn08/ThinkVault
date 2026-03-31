from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid


class DocumentCreate(BaseModel):
    title: str
    source_type: str  # text | pdf | url
    source_url: Optional[str] = None
    raw_text: Optional[str] = None


class DocumentOut(BaseModel):
    id: uuid.UUID
    title: str
    source_type: str
    source_url: Optional[str]
    status: str
    chunk_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    items: list[DocumentOut]
    total: int
    page: int
    page_size: int
