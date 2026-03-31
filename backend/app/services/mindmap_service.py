import httpx
import json
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.document import Document
from app.models.mindmap import MindMap
import uuid

DEEPSEEK_CHAT_URL = f"{settings.DEEPSEEK_BASE_URL}/chat/completions"


MINDMAP_SYSTEM_PROMPT = """You are an expert knowledge cartographer. Given content, you generate a rich, 
hierarchical mind map in JSON format. Each node represents a key concept, and edges connect related concepts.

STRICT OUTPUT FORMAT (valid JSON only, no markdown):
{
  "title": "Short title for the mind map",
  "nodes": [
    {"id": "1", "label": "Central Concept", "type": "root", "data": {"description": "Brief description"}},
    {"id": "2", "label": "Sub Topic", "type": "topic", "data": {"description": "Brief description"}},
    {"id": "3", "label": "Detail", "type": "detail", "data": {"description": "Brief description"}}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2", "label": "relates to"},
    {"id": "e1-3", "source": "2", "target": "3", "label": "includes"}
  ]
}

Generate 8-15 nodes with meaningful connections. Make it visually rich and informative."""


async def generate_mindmap(document_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> MindMap:
    """
    Generate a mind map for a document using DeepSeek.
    1. Load document text from DB
    2. Send to DeepSeek with structured JSON prompt
    3. Parse response into nodes/edges
    4. Store in mindmaps table
    """
    result = await db.execute(select(Document).where(Document.id == document_id, Document.user_id == user_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise ValueError("Document not found")

    content_preview = (doc.raw_text or "")[:6000]

    async with httpx.AsyncClient(timeout=90) as client:
        resp = await client.post(
            DEEPSEEK_CHAT_URL,
            headers={
                "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": MINDMAP_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": f"Generate a mind map for this content:\n\n{content_preview}",
                    },
                ],
                "temperature": 0.4,
                "max_tokens": 2000,
                "response_format": {"type": "json_object"},
            },
        )
        resp.raise_for_status()

    raw = resp.json()["choices"][0]["message"]["content"]
    try:
        graph_json = json.loads(raw)
    except json.JSONDecodeError:
        # Fallback: extract JSON block from response
        import re
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        graph_json = json.loads(match.group()) if match else {"nodes": [], "edges": [], "title": doc.title}

    # Add x/y positions using a simple radial layout
    nodes = graph_json.get("nodes", [])
    edges = graph_json.get("edges", [])
    import math
    for i, node in enumerate(nodes):
        if i == 0:
            node["position"] = {"x": 500, "y": 300}
        else:
            angle = (2 * math.pi * i) / (len(nodes) - 1)
            node["position"] = {
                "x": 500 + 280 * math.cos(angle),
                "y": 300 + 200 * math.sin(angle),
            }

    graph_json["nodes"] = nodes
    graph_json["edges"] = edges

    # Check if mindmap already exists for this document
    existing = await db.execute(select(MindMap).where(MindMap.document_id == document_id))
    existing_map = existing.scalar_one_or_none()

    if existing_map:
        existing_map.graph_json = graph_json
        existing_map.title = graph_json.get("title", doc.title)
        await db.commit()
        await db.refresh(existing_map)
        return existing_map

    mindmap = MindMap(
        document_id=document_id,
        user_id=user_id,
        title=graph_json.get("title", doc.title),
        graph_json=graph_json,
    )
    db.add(mindmap)
    await db.commit()
    await db.refresh(mindmap)
    return mindmap
