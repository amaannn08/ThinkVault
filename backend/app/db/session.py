from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


def _make_async_url(url: str) -> tuple[str, dict]:
    """
    Normalize any postgres URL for asyncpg:
    - Convert scheme to postgresql+asyncpg://
    - Strip ALL query params (NeonDB uses sslmode, channel_binding, etc.
      which are libpq-only and not accepted by asyncpg)
    - Return connect_args with ssl=True if any SSL param was present
    """
    from urllib.parse import urlparse, parse_qs, urlunparse

    for old, new in [
        ("postgresql+psycopg2://", "postgresql+asyncpg://"),
        ("postgresql://", "postgresql+asyncpg://"),
        ("postgres://", "postgresql+asyncpg://"),
    ]:
        if url.startswith(old):
            url = url.replace(old, new, 1)
            break

    parsed = urlparse(url)
    params = parse_qs(parsed.query, keep_blank_values=True)

    # Detect if SSL is needed (sslmode=require/verify-*)
    ssl_mode = params.get("sslmode", [None])[0]
    needs_ssl = ssl_mode not in (None, "disable", "allow", "prefer")

    # Strip ALL query params — asyncpg does not accept libpq connection params
    clean_url = urlunparse(parsed._replace(query=""))

    connect_args: dict = {}
    if needs_ssl:
        connect_args["ssl"] = True

    return clean_url, connect_args


_async_url, _connect_args = _make_async_url(settings.DATABASE_URL)

engine = create_async_engine(
    _async_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args=_connect_args,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
