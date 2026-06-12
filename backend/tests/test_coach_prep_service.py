import pytest

from app.models.coach_prep import (
    AnticipatedTeacherResponse,
    CoachChallengeOptions,
    CoachPrepGenerateRequest,
    CoachPrepOutput,
    CoachPrepRefineRequest,
    DominantFrame,
    DoubleLoopQuestion,
    GroundedStrategy,
    GrowConversationGuide,
    LensShiftPrompt,
    ReframeSuggestion,
    SessionSynthesis,
    StudentImpactFocus,
)


def _required_new_sections() -> dict:
    return {
        "lens_shift_prompts": [
            LensShiftPrompt(
                anticipated_statement="I ran the activities as planned.",
                performative_pattern="Activity-listing without student evidence.",
                affirmation_trap="That sounds like a lot of hard work.",
                pivot_prompt=(
                    "What changed for students during those activities, and what do you "
                    "think drove that change?"
                ),
            )
        ],
        "student_impact_focus": StudentImpactFocus(
            what_is_working_for_students=["A quieter student gave an extended answer."],
            what_may_be_driving_it=["Protected thinking time."],
            evidence_gaps=["Reasoning quality across the class is unknown."],
        ),
    }
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
            **_required_new_sections(),
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


class CapturingLLMClient(BaseLLMClient):
    def __init__(self) -> None:
        self.user_prompt = ""

    async def generate_structured_output(self, *, system_prompt, user_prompt, output_schema):
        self.user_prompt = user_prompt
        return CoachPrepOutput(
            session_synthesis=SessionSynthesis(
                summary="A longitudinal synthesis.",
                evidence_notes=["History rows are included as session-only context."],
                uncertainties=[],
            ),
            dominant_frame=DominantFrame(
                frame="A cautious historical frame.",
                evidence=["A dated row is available."],
                confidence="medium",
            ),
            reframe_suggestion=ReframeSuggestion(
                suggested_reframe="A practical reframe.",
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
                    strategy_id="wait_time_everyone_rehearses",
                    rationale="This strategy exists in the bank.",
                    suggested_coach_bridge="Bridge.",
                )
            ],
            **_required_new_sections(),
            anticipated_teacher_responses=[
                AnticipatedTeacherResponse(
                    likely_teacher_response="There is not enough time.",
                    underlying_need_or_concern="Coverage pressure.",
                    coach_prompt="Where could we test one small routine?",
                ),
                AnticipatedTeacherResponse(
                    likely_teacher_response="Students need more support.",
                    underlying_need_or_concern="Access and scaffolding.",
                    coach_prompt="What scaffold would make thinking visible?",
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


@pytest.mark.asyncio
async def test_service_includes_session_history_in_prompt() -> None:
    llm_client = CapturingLLMClient()
    service = CoachPrepService(llm_client)

    await service.generate(
        CoachPrepGenerateRequest(
            session_history=[
                {
                    "source_date": "5/21/2026",
                    "teacher": "Anis",
                    "current_goal": "Use dialogic prompts with CPA subtraction tasks.",
                    "progress": "Progressing",
                    "teacher_reflection": (
                        "I want to incorporate CPA focusing on concrete stage in subtraction."
                    ),
                    "coach_reflection": (
                        "We need to streamline the focus back to dialogic strategies."
                    ),
                    "ai_coach_next_step": (
                        "Link concrete manipulatives to specific dialogic talk prompts."
                    ),
                }
            ]
        )
    )

    assert "Session history:" in llm_client.user_prompt
    assert "5/21/2026" in llm_client.user_prompt
    assert "Progressing" in llm_client.user_prompt
    assert "dialogic talk prompts" in llm_client.user_prompt


@pytest.mark.asyncio
async def test_service_includes_coach_prebrief_in_prompt() -> None:
    llm_client = CapturingLLMClient()
    service = CoachPrepService(llm_client)

    await service.generate(
        CoachPrepGenerateRequest(
            coach_prebrief=(
                "She will want to talk about the group work. I will be tempted to praise "
                "the effort rather than ask what the quieter students learned."
            ),
        )
    )

    assert "Coach pre-brief" in llm_client.user_prompt
    assert "tempted to praise" in llm_client.user_prompt


@pytest.mark.asyncio
async def test_refine_includes_previous_output_and_reaction_in_prompt() -> None:
    llm_client = CapturingLLMClient()
    service = CoachPrepService(llm_client)

    original_request = CoachPrepGenerateRequest(
        coach_notes="Teacher dominated the first 15 minutes despite the talk goal.",
    )
    previous_output = await service.generate(original_request)

    await service.refine(
        CoachPrepRefineRequest(
            original_request=original_request,
            previous_output=previous_output,
            coach_reaction=(
                "The values hypothesis is off; push deeper on the talk-balance contradiction."
            ),
        )
    )

    assert "Refinement task:" in llm_client.user_prompt
    assert "A longitudinal synthesis." in llm_client.user_prompt
    assert "push deeper on the talk-balance contradiction" in llm_client.user_prompt
    assert "Teacher dominated the first 15 minutes" in llm_client.user_prompt
