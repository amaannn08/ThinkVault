import httpx
from loguru import logger
from app.core.config import settings


GEMINI_EMBED_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"text-embedding-004:embedContent?key={settings.GEMINI_API_KEY}"
)


async def generate_embedding(text: str) -> list[float]:
    """
    Call Gemini text-embedding-004 to generate a vector embedding.
    Returns a list of floats of dimension 768.
    """
    payload = {
        "model": "models/text-embedding-004",
        "content": {"parts": [{"text": text[:8000]}]},  # Gemini token limit guard
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(GEMINI_EMBED_URL, json=payload)
        resp.raise_for_status()
    data = resp.json()
    return data["embedding"]["values"]
