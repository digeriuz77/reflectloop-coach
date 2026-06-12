from pathlib import Path

from app.models.coach_prep import (
    CoachPrepGenerateRequest,
    CoachPrepOutput,
    CoachPrepRefineRequest,
)
from app.services.coaching_rubrics import render_coaching_rubrics_summary
from app.services.llm.base import BaseLLMClient
from app.services.strategy_bank import get_strategy_ids, render_strategy_bank_summary

PROMPT_PATH = Path(__file__).parents[1] / "prompts" / "coach_prep.md"
REFINE_PROMPT_PATH = Path(__file__).parents[1] / "prompts" / "coach_prep_refine.md"


class LLMOutputValidationError(RuntimeError):
    pass


class CoachPrepService:
    def __init__(self, llm_client: BaseLLMClient) -> None:
        self._llm_client = llm_client

    async def generate(self, request: CoachPrepGenerateRequest) -> CoachPrepOutput:
        prompt = _load_prompt_template()
        user_prompt = _render_prompt(prompt, request)
        output = await self._llm_client.generate_structured_output(
            system_prompt=prompt,
            user_prompt=user_prompt,
            output_schema=CoachPrepOutput,
        )
        _validate_strategy_references(output)
        return output

    async def refine(self, request: CoachPrepRefineRequest) -> CoachPrepOutput:
        prompt = _load_prompt_template()
        base_user_prompt = _render_prompt(prompt, request.original_request)
        refine_block = _render_refine_block(request)
        output = await self._llm_client.generate_structured_output(
            system_prompt=prompt,
            user_prompt=f"{base_user_prompt}\n\n{refine_block}",
            output_schema=CoachPrepOutput,
        )
        _validate_strategy_references(output)
        return output


def _load_prompt_template() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def _render_refine_block(request: CoachPrepRefineRequest) -> str:
    template = REFINE_PROMPT_PATH.read_text(encoding="utf-8")
    return template.replace(
        "{{ previous_output }}", request.previous_output.model_dump_json(indent=2)
    ).replace("{{ coach_reaction }}", request.coach_reaction)


def _render_prompt(template: str, request: CoachPrepGenerateRequest) -> str:
    replacements = {
        "{{ coach_prebrief }}": request.coach_prebrief or "Not provided.",
        "{{ session_context }}": request.session_context.model_dump_json(indent=2),
        "{{ session_history }}": _render_session_history(request),
        "{{ teacher_reflection }}": request.teacher_reflection or "Not provided.",
        "{{ lesson_or_context_notes }}": request.lesson_or_context_notes or "Not provided.",
        "{{ coach_notes }}": request.coach_notes or "Not provided.",
        "{{ strategy_bank_summary }}": render_strategy_bank_summary(),
        "{{ coaching_rubrics_summary }}": render_coaching_rubrics_summary(),
    }

    rendered = template
    for placeholder, value in replacements.items():
        rendered = rendered.replace(placeholder, value)
    return rendered


def _render_session_history(request: CoachPrepGenerateRequest) -> str:
    if not request.session_history:
        return "Not provided."

    return "\n".join(
        f"Row {index + 1}: {entry.model_dump_json(exclude_none=True)}"
        for index, entry in enumerate(request.session_history)
    )


def _validate_strategy_references(output: CoachPrepOutput) -> None:
    valid_strategy_ids = get_strategy_ids()
    invalid_ids = [
        strategy.strategy_id
        for strategy in output.grounded_strategies
        if strategy.strategy_id not in valid_strategy_ids
    ]
    if invalid_ids:
        raise LLMOutputValidationError("LLM output referenced unknown strategy IDs.")
