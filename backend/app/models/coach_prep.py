from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class CoachCalibration(BaseModel):
    model_config = ConfigDict(extra="forbid")

    implementation_pattern: Literal[
        "sustained_implementation",
        "one_time_attempt",
        "planned_not_attempted",
        "reverted_to_old_habits",
        "unknown",
    ] | None = None
    adaptation_pattern: Literal[
        "adapted_based_on_evidence",
        "repeated_without_adjustment",
        "stopped_after_difficulty",
        "waiting_for_more_direction",
        "unknown",
    ] | None = None
    ownership_signal: Literal[
        "owns_decisions_and_learning",
        "partial_ownership",
        "externalizes_responsibility",
        "defensive_or_dismissive",
        "unknown",
    ] | None = None
    risk_taking_signal: Literal[
        "meaningful_risk_taken",
        "small_safe_adjustment",
        "avoided_risk",
        "risk_not_relevant",
        "unknown",
    ] | None = None
    artifact_evidence: Literal[
        "teacher_artifact",
        "student_artifact",
        "observation_evidence",
        "anecdotal_only",
        "none_or_unknown",
    ] | None = None
    student_outcome_signal: Literal[
        "positive_student_shift",
        "mixed_or_unclear_shift",
        "no_observed_shift",
        "negative_or_resistant_shift",
        "not_observed",
    ] | None = None
    engagement_stance: Literal[
        "active_problem_solver",
        "compliant_participant",
        "passive_observer",
        "defensive_participant",
        "unknown",
    ] | None = None
    resistance_context: Literal[
        "productive_discomfort",
        "coach_induced_resistance",
        "change_avoidance",
        "system_constraint",
        "no_resistance_observed",
        "unknown",
    ] | None = None
    dialogic_participation_pattern: Literal[
        "group_shouting_few_students",
        "early_individual_volunteers",
        "targeted_questioning_pauses",
        "multiple_participation_modes",
        "purposeful_movement_between_talk_modes",
        "unknown",
    ] | None = None
    reflective_depth_signal: Literal[
        "action_focused",
        "surface_cause_single_loop",
        "assumption_aware",
        "reframing_and_transfer",
        "unknown",
    ] | None = None
    calibration_notes: str | None = Field(default=None, max_length=1000)


class SessionContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    programme_phase: str | None = Field(default=None, max_length=120)
    impact_cycle: str | None = Field(default=None, max_length=120)
    current_goal: str | None = Field(default=None, max_length=500)
    coach_calibration: CoachCalibration = Field(default_factory=CoachCalibration)


class CoachPrepGenerateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    teacher_reflection: str | None = Field(default=None, max_length=20000)
    lesson_or_context_notes: str | None = Field(default=None, max_length=20000)
    coach_notes: str | None = Field(default=None, max_length=20000)
    session_context: SessionContext = Field(default_factory=SessionContext)

    @field_validator("teacher_reflection", "lesson_or_context_notes", "coach_notes")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        if not stripped:
            raise ValueError("Text must not be blank.")
        return stripped

    @model_validator(mode="after")
    def require_at_least_one_text_input(self) -> "CoachPrepGenerateRequest":
        if not any([self.teacher_reflection, self.lesson_or_context_notes, self.coach_notes]):
            raise ValueError(
                "At least one of teacher_reflection, lesson_or_context_notes, or coach_notes "
                "must be provided."
            )
        return self


class SessionSynthesis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str = Field(..., min_length=1)
    evidence_notes: list[str] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)


class DominantFrame(BaseModel):
    model_config = ConfigDict(extra="forbid")

    frame: str = Field(..., min_length=1)
    evidence: list[str] = Field(default_factory=list)
    confidence: Literal["low", "medium", "high"]


class CoachChallengeOptions(BaseModel):
    model_config = ConfigDict(extra="forbid")

    gentle: str = Field(..., min_length=1)
    moderate: str = Field(..., min_length=1)
    direct: str = Field(..., min_length=1)


class ReframeSuggestion(BaseModel):
    model_config = ConfigDict(extra="forbid")

    suggested_reframe: str = Field(..., min_length=1)
    coach_challenge_options: CoachChallengeOptions


class DoubleLoopQuestion(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question: str = Field(..., min_length=1)
    purpose: str = Field(..., min_length=1)
    challenge_level: Literal["gentle", "moderate", "direct"]


class GroundedStrategy(BaseModel):
    model_config = ConfigDict(extra="forbid")

    strategy_id: str = Field(..., min_length=1)
    rationale: str = Field(..., min_length=1)
    suggested_coach_bridge: str = Field(..., min_length=1)


class GrowConversationGuide(BaseModel):
    model_config = ConfigDict(extra="forbid")

    goal: list[str] = Field(..., min_length=1)
    reality: list[str] = Field(..., min_length=1)
    options: list[str] = Field(..., min_length=1)
    will: list[str] = Field(..., min_length=1)


class CoachPrepOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session_synthesis: SessionSynthesis
    dominant_frame: DominantFrame
    reframe_suggestion: ReframeSuggestion
    double_loop_questions: list[DoubleLoopQuestion] = Field(..., min_length=3, max_length=5)
    grounded_strategies: list[GroundedStrategy] = Field(default_factory=list, max_length=3)
    grow_conversation_guide: GrowConversationGuide
    coach_confidence_flags: list[str] = Field(default_factory=list)
