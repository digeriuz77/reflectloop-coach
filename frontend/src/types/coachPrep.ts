export type CalibrationValue = string | undefined;

export type CoachCalibration = {
  implementation_pattern?: CalibrationValue;
  adaptation_pattern?: CalibrationValue;
  ownership_signal?: CalibrationValue;
  risk_taking_signal?: CalibrationValue;
  artifact_evidence?: CalibrationValue;
  student_outcome_signal?: CalibrationValue;
  engagement_stance?: CalibrationValue;
  resistance_context?: CalibrationValue;
  dialogic_participation_pattern?: CalibrationValue;
  reflective_depth_signal?: CalibrationValue;
  calibration_notes?: string;
};

export type CoachPrepRequest = {
  teacher_reflection?: string;
  lesson_or_context_notes?: string;
  coach_notes?: string;
  session_context: {
    programme_phase?: string;
    impact_cycle?: string;
    current_goal?: string;
    coach_calibration: CoachCalibration;
  };
};

export type CoachPrepOutput = {
  session_synthesis: {
    summary: string;
    evidence_notes: string[];
    uncertainties: string[];
  };
  dominant_frame: {
    frame: string;
    evidence: string[];
    confidence: "low" | "medium" | "high";
  };
  reframe_suggestion: {
    suggested_reframe: string;
    coach_challenge_options: {
      gentle: string;
      moderate: string;
      direct: string;
    };
  };
  double_loop_questions: Array<{
    question: string;
    purpose: string;
    challenge_level: "gentle" | "moderate" | "direct";
  }>;
  grounded_strategies: Array<{
    strategy_id: string;
    rationale: string;
    suggested_coach_bridge: string;
  }>;
  grow_conversation_guide: {
    goal: string[];
    reality: string[];
    options: string[];
    will: string[];
  };
  coach_confidence_flags: string[];
};
