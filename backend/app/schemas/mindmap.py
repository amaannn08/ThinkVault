from pydantic import BaseModel
from datetime import datetime
from typing import Any
import uuid


class MindMapNode(BaseModel):
    id: str
    label: str
    type: str = "default"
    position: dict = {"x": 0, "y": 0}
    data: dict = {}


class MindMapEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str = ""


class MindMapOut(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    title: str
    graph_json: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MindMapUpdate(BaseModel):
    graph_json: dict[str, Any]
    title: str | None = None
