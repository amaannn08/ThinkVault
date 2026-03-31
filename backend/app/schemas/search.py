from pydantic import BaseModel
import uuid


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class ChunkResult(BaseModel):
    chunk_id: uuid.UUID
    document_id: uuid.UUID
    document_title: str
    content: str
    similarity: float


class SearchResponse(BaseModel):
    query: str
    results: list[ChunkResult]


class SuggestionResponse(BaseModel):
    suggestions: list[str]
