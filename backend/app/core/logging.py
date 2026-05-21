import logging

from app.core.config import Settings


def configure_logging(settings: Settings) -> None:
    """Configure application logging without request or prompt payload logging."""

    logging.basicConfig(
        level=settings.log_level.upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
