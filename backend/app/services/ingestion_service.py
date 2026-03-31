import re
import httpx
from loguru import logger
from app.core.config import settings


def clean_text(text: str) -> str:
    """Remove excessive whitespace, special chars, normalize newlines."""
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\x00-\x7F]+", " ", text)  # strip non-ASCII
    return text.strip()


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 80) -> list[str]:
    """
    Split text into overlapping chunks of ~chunk_size characters.
    Uses word boundaries to avoid mid-word splits.
    """
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i : i + chunk_size]
        chunks.append(" ".join(chunk_words))
        i += chunk_size - overlap
    return [c for c in chunks if len(c.strip()) > 50]


async def parse_url(url: str) -> str:
    """Fetch a URL and extract its text content."""
    from bs4 import BeautifulSoup
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(url, follow_redirects=True)
        resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    # Remove scripts and styles
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    return clean_text(soup.get_text(separator=" "))


async def parse_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes using pdfplumber."""
    import pdfplumber
    import io
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
    return clean_text("\n".join(text_parts))
