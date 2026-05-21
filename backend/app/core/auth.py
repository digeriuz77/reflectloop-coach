from typing import Annotated

from fastapi import Header, HTTPException, status

from app.core.config import get_settings


async def require_coach_access(
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    settings = get_settings()

    if settings.is_local and settings.coach_access_token is None:
        return

    if settings.coach_access_token is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Coach access token is not configured.",
        )

    expected_token = settings.coach_access_token.get_secret_value()
    expected_header = f"Bearer {expected_token}"
    if authorization != expected_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Coach access token is required.",
        )
