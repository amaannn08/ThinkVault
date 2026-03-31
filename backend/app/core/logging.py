import sys
from loguru import logger


def setup_logging():
    """Configure loguru for structured JSON output."""
    logger.remove()  # Remove default handler

    # Console output (human-readable in dev, JSON in prod)
    logger.add(
        sys.stdout,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
            "<level>{message}</level>"
        ),
        level="DEBUG",
        colorize=True,
    )

    # File output (JSON)
    logger.add(
        "logs/thinkvault_{time:YYYY-MM-DD}.log",
        rotation="00:00",
        retention="30 days",
        format="{time} {level} {name} {function} {line} {message}",
        level="INFO",
        serialize=True,  # JSON output
    )

    return logger
