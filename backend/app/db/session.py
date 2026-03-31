from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


def _make_async_url(url: str) -> tuple[str, dict]:
    """
    Normalize any postgres URL for asyncpg:
    - Convert scheme to postgresql+asyncpg://
    - Strip ?sslmode= (asyncpg doesn't support it as a URL param)
    - Return connect_args with ssl=True if sslmode was require/verify-*
    """
    from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

    for old, new in [
        ("postgresql+psycopg2://", "postgresql+asyncpg://"),
        ("postgresql://", "postgresql+asyncpg://"),
        ("postgres://", "postgresql+asyncpg://"),
    ]:
        if url.startswith(old):
            url = url.replace(old, new, 1)
            break

    connect_args: dict = {}
    if "sslmode=" in url:
        parsed = urlparse(url)
        params = parse_qs(parsed.query, keep_blank_values=True)
        ssl_mode = params.pop("sslmode", [None])[0]
        if ssl_mode and ssl_mode not in ("disable", "allow"):
            connect_args["ssl"] = True
        new_query = urlencode({k: v[0] for k, v in params.items()})
        url = urlunparse(parsed._replace(query=new_query))

    return url, connect_args


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
