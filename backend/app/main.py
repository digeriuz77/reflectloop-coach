from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.coach_prep import router as coach_prep_router
from app.core.config import get_settings
from app.core.logging import configure_logging

settings = get_settings()
configure_logging(settings)

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Coach-only P0 API for ReflectLoop Coach.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

app.include_router(coach_prep_router)


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok", "scope": "coach-only-p0"}


@app.get("/debug/cors", tags=["debug"])
async def debug_cors() -> dict[str, list[str]]:
    """Debug endpoint to check CORS configuration."""
    return {"allowed_origins": settings.allowed_cors_origins}
