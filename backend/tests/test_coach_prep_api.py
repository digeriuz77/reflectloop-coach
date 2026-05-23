from fastapi.testclient import TestClient

from app.api.coach_prep import get_coach_prep_service
from app.main import app
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


class FakeCoachPrepService:
    async def generate(self, request: CoachPrepGenerateRequest) -> CoachPrepOutput:
        return CoachPrepOutput(
            session_synthesis=SessionSynthesis(
                summary="Teacher is experimenting with wait time and uptake.",
                evidence_notes=[
                    "Teacher reflection mentions discomfort with silence.",
                    "Lesson notes suggest participation is concentrated among a few students.",
                ],
                uncertainties=["The current goal ownership should be explored by the coach."],
            ),
            dominant_frame=DominantFrame(
                frame="Silence may be framed as loss of instructional control.",
                evidence=["Reflection describes silence as awkward."],
                confidence="medium",
            ),
            reframe_suggestion=ReframeSuggestion(
                suggested_reframe="Silence can be treated as protected student thinking time.",
                coach_challenge_options=CoachChallengeOptions(
                    gentle="What did the silence make possible for students?",
                    moderate="What assumption about silence might be worth testing?",
                    direct=(
                        "What changes if silence is evidence of thinking rather than loss of "
                        "control?"
                    ),
                ),
            ),
            double_loop_questions=[
                DoubleLoopQuestion(
                    question="What did you believe was at risk during the silence?",
                    purpose="Surface the assumption connecting silence and control.",
                    challenge_level="gentle",
                ),
                DoubleLoopQuestion(
                    question="How might you name the moment differently if students were thinking?",
                    purpose="Invite a reframe from performance to facilitation.",
                    challenge_level="moderate",
                ),
                DoubleLoopQuestion(
                    question="What classroom conditions would make wait time feel safe to sustain?",
                    purpose="Connect belief change to implementable design choices.",
                    challenge_level="gentle",
                ),
            ],
            grounded_strategies=[
                GroundedStrategy(
                    strategy_id="wait_time_everyone_rehearses",
                    rationale="The teacher can make wait time explicit and structured.",
                    suggested_coach_bridge="Could we try this as a one-lesson experiment?",
                )
            ],
            anticipated_teacher_responses=[
                AnticipatedTeacherResponse(
                    likely_teacher_response=(
                        "There is not enough time to wait after every question."
                    ),
                    underlying_need_or_concern=(
                        "The teacher is balancing pace and curriculum coverage."
                    ),
                    coach_prompt=(
                        "Could we choose one hinge question where wait time is worth protecting "
                        "and compare the quality of student thinking?"
                    ),
                ),
                AnticipatedTeacherResponse(
                    likely_teacher_response="Some pupils are too slow to answer.",
                    underlying_need_or_concern=(
                        "The teacher may need a scaffold that makes thinking visible before "
                        "whole-class response."
                    ),
                    coach_prompt=(
                        "What rehearsal or vocabulary support might help more pupils prepare an "
                        "answer before you judge readiness?"
                    ),
                ),
            ],
            grow_conversation_guide=GrowConversationGuide(
                goal=["Clarify whether the goal is more wait time or more student thinking."],
                reality=["Use source-separated observation notes to discuss what was seen."],
                options=["Try Wait Time with Everyone Rehearses."],
                will=["Agree one moment in the next lesson to rehearse the move."],
            ),
            coach_confidence_flags=[
                "Keep the conversation exploratory rather than evaluative."
            ],
        )


def override_service() -> FakeCoachPrepService:
    return FakeCoachPrepService()


def test_generate_coach_prep_returns_structured_output() -> None:
    app.dependency_overrides[get_coach_prep_service] = override_service
    client = TestClient(app)

    response = client.post(
        "/api/coach-prep/generate",
        json={
            "teacher_reflection": "I tried waiting longer, but the silence felt awkward.",
            "lesson_or_context_notes": "Wait time was usually under two seconds.",
            "coach_notes": "Teacher is concerned that silence means students are stuck.",
            "session_context": {
                "programme_phase": "First Cycles",
                "impact_cycle": "1",
                "current_goal": "Increase student reasoning after questions.",
                "coach_calibration": {
                    "implementation_pattern": "one_time_attempt",
                    "adaptation_pattern": "stopped_after_difficulty",
                    "ownership_signal": "partial_ownership",
                    "artifact_evidence": "anecdotal_only",
                    "engagement_stance": "compliant_participant",
                    "dialogic_participation_pattern": "early_individual_volunteers",
                    "reflective_depth_signal": "surface_cause_single_loop",
                },
            },
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["grounded_strategies"][0]["strategy_id"] == "wait_time_everyone_rehearses"
    assert len(body["double_loop_questions"]) == 3


def test_notes_can_be_entered_without_observation_metadata() -> None:
    app.dependency_overrides[get_coach_prep_service] = override_service
    client = TestClient(app)

    response = client.post(
        "/api/coach-prep/generate",
        json={
            "teacher_reflection": "I tried a discussion routine.",
            "lesson_or_context_notes": "Students responded mostly to the teacher.",
            "coach_notes": "Coach noticed limited peer-to-peer talk.",
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200


def test_session_history_can_be_entered_without_note_text() -> None:
    app.dependency_overrides[get_coach_prep_service] = override_service
    client = TestClient(app)

    response = client.post(
        "/api/coach-prep/generate",
        json={
            "session_history": [
                {
                    "source_date": "5/21/2026",
                    "teacher": "Anis",
                    "school": "St. Bartholomew",
                    "coach": "Shamim",
                    "current_goal": "Use dialogic prompts with CPA subtraction tasks.",
                    "progress": "Progressing",
                    "teacher_reflection": (
                        "I want to incorporate CPA focusing on concrete stage in subtraction."
                    ),
                    "coach_reflection": (
                        "We need to streamline the focus back to dialogic strategies."
                    ),
                    "rag": "Green",
                    "ai_teacher_summary": (
                        "Anis is showing dedication to integrating CPA strategies."
                    ),
                    "ai_coach_next_step": (
                        "Link concrete manipulatives to specific dialogic talk prompts."
                    ),
                }
            ],
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200


def test_session_history_rejects_unknown_top_level_row_fields() -> None:
    app.dependency_overrides[get_coach_prep_service] = override_service
    client = TestClient(app)

    response = client.post(
        "/api/coach-prep/generate",
        json={
            "session_history": [
                {
                    "source_date": "5/21/2026",
                    "teacher": "Anis",
                    "unmapped_upload_column": "This should be sent through raw_fields instead.",
                }
            ],
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 422


def test_direct_numeric_calibration_ratings_are_rejected() -> None:
    app.dependency_overrides[get_coach_prep_service] = override_service
    client = TestClient(app)

    response = client.post(
        "/api/coach-prep/generate",
        json={
            "coach_notes": "Coach noticed that the teacher feels stuck.",
            "session_context": {
                "coach_calibration": {
                    "progress_rating": 6,
                    "stuckness_rating": 4,
                }
            },
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 422


def test_invalid_calibration_signal_is_rejected() -> None:
    app.dependency_overrides[get_coach_prep_service] = override_service
    client = TestClient(app)

    response = client.post(
        "/api/coach-prep/generate",
        json={
            "coach_notes": "Coach noticed that the teacher feels stuck.",
            "session_context": {
                "coach_calibration": {
                    "implementation_pattern": "subjective_rating_4",
                }
            },
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 422


def test_p0_exposes_no_teacher_routes() -> None:
    route_paths = {route.path for route in app.routes}
    assert all("teacher" not in route_path for route_path in route_paths)
