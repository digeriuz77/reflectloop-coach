import pytest

from app.models.coach_prep import (
    AnticipatedTeacherResponse,
    CoachChallengeOptions,
    CoachPrepGenerateRequest,
    CoachPrepOutput,
    DominantFrame,
    DoubleLoopQuestion,
    GroundedStrategy,
    GrowConversationGuide,
    ReframeSuggestion,
    SessionSynthesis,
)
from app.services.coach_prep_service import CoachPrepService, LLMOutputValidationError
from app.services.llm.base import BaseLLMClient


class InvalidStrategyLLMClient(BaseLLMClient):
    async def generate_structured_output(self, *, system_prompt, user_prompt, output_schema):
        return CoachPrepOutput(
            session_synthesis=SessionSynthesis(
                summary="A source-separated synthesis.",
                evidence_notes=["Evidence is separated from interpretation."],
                uncertainties=[],
            ),
            dominant_frame=DominantFrame(
                frame="A tentative frame.",
                evidence=["A bounded evidence note."],
                confidence="low",
            ),
            reframe_suggestion=ReframeSuggestion(
                suggested_reframe="A tentative reframe.",
                coach_challenge_options=CoachChallengeOptions(
                    gentle="A gentle option.",
                    moderate="A moderate option.",
                    direct="A direct option.",
                ),
            ),
            double_loop_questions=[
                DoubleLoopQuestion(
                    question="Question one?",
                    purpose="Purpose one.",
                    challenge_level="gentle",
                ),
                DoubleLoopQuestion(
                    question="Question two?",
                    purpose="Purpose two.",
                    challenge_level="moderate",
                ),
                DoubleLoopQuestion(
                    question="Question three?",
                    purpose="Purpose three.",
                    challenge_level="direct",
                ),
            ],
            grounded_strategies=[
                GroundedStrategy(
                    strategy_id="invented_strategy_id",
                    rationale="This should be rejected.",
                    suggested_coach_bridge="Do not use this.",
                )
            ],
            anticipated_teacher_responses=[
                AnticipatedTeacherResponse(
                    likely_teacher_response="There is not enough time.",
                    underlying_need_or_concern="The teacher may be protecting lesson coverage.",
                    coach_prompt=(
                        "Which small part of the lesson could test whether slower talk improves "
                        "learning evidence?"
                    ),
                ),
                AnticipatedTeacherResponse(
                    likely_teacher_response="The children are too slow.",
                    underlying_need_or_concern=(
                        "The teacher may need stronger scaffolds for thinking time."
                    ),
                    coach_prompt=(
                        "What would help students rehearse an answer before you decide they are "
                        "not ready?"
                    ),
                ),
            ],
            grow_conversation_guide=GrowConversationGuide(
                goal=["Goal"],
                reality=["Reality"],
                options=["Options"],
                will=["Will"],
            ),
        )


@pytest.mark.asyncio
async def test_service_rejects_hallucinated_strategy_ids() -> None:
    service = CoachPrepService(InvalidStrategyLLMClient())

    with pytest.raises(LLMOutputValidationError):
        await service.generate(
            CoachPrepGenerateRequest(
                teacher_reflection="The teacher reflected on wait time.",
                lesson_or_context_notes="Students mainly answered in chorus.",
                coach_notes="The coach noticed discomfort with silence.",
            )
        )
