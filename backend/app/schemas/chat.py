from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid


class ChatRequest(BaseModel):
    query: str
    session_id: str
    document_id: Optional[uuid.UUID] = None  # scope to a specific doc (optional)


class ChatResponse(BaseModel):
    answer: str
    session_id: str
    sources: list[dict]


class ChatHistoryItem(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
