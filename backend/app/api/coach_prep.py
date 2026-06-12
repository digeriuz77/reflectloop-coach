from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import require_coach_access
from app.core.config import Settings, get_settings
from app.models.coach_prep import (
    CoachPrepGenerateRequest,
    CoachPrepOutput,
    CoachPrepRefineRequest,
)
from app.services.coach_prep_service import CoachPrepService, LLMOutputValidationError
from app.services.llm.base import LLMClientError
from app.services.llm.factory import build_llm_client

router = APIRouter(prefix="/api/coach-prep", tags=["coach-prep"])


@lru_cache
def get_coach_prep_service() -> CoachPrepService:
    settings: Settings = get_settings()
    llm_client = build_llm_client(settings)
    return CoachPrepService(llm_client)


COACH_PREP_SERVICE_DEPENDENCY = Depends(get_coach_prep_service)
COACH_ACCESS_DEPENDENCY = Depends(require_coach_access)


@router.post("/generate", response_model=CoachPrepOutput, status_code=status.HTTP_200_OK)
async def generate_coach_prep(
    request: CoachPrepGenerateRequest,
    service: CoachPrepService = COACH_PREP_SERVICE_DEPENDENCY,
    _: None = COACH_ACCESS_DEPENDENCY,
) -> CoachPrepOutput:
    try:
        return await service.generate(request)
    except LLMOutputValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="LLM output failed structured validation.",
        ) from exc
    except LLMClientError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="LLM provider failed to generate structured output.",
        ) from exc


@router.post("/refine", response_model=CoachPrepOutput, status_code=status.HTTP_200_OK)
async def refine_coach_prep(
    request: CoachPrepRefineRequest,
    service: CoachPrepService = COACH_PREP_SERVICE_DEPENDENCY,
    _: None = COACH_ACCESS_DEPENDENCY,
) -> CoachPrepOutput:
    try:
        return await service.refine(request)
    except LLMOutputValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="LLM output failed structured validation.",
        ) from exc
    except LLMClientError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="LLM provider failed to refine structured output.",
        ) from exc
