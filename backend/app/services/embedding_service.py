import httpx
from loguru import logger
from app.core.config import settings

_EMBED_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
_MODELS = ["text-embedding-004", "embedding-001"]  # fallback order


async def generate_embedding(text: str) -> list[float]:
    """
    Generate a vector embedding via Gemini.
    Tries text-embedding-004 first, falls back to embedding-001.
    """
    payload = {
        "content": {"parts": [{"text": text[:8000]}]},
        "taskType": "RETRIEVAL_DOCUMENT",
    }
    last_err = None
    async with httpx.AsyncClient(timeout=30) as client:
        for model in _MODELS:
            payload["model"] = f"models/{model}"
            url = f"{_EMBED_BASE}/{model}:embedContent?key={settings.GEMINI_API_KEY}"
            resp = await client.post(url, json=payload)
            if resp.status_code == 404:
                logger.warning(f"Gemini model {model} not available (404), trying next...")
                last_err = resp
                continue
            resp.raise_for_status()
            data = resp.json()
            return data["embedding"]["values"]
    last_err.raise_for_status()  # raise the last error if all models failed
