import { useState } from "react";
import type { CoachCalibration } from "../types/coachPrep";
import { Field } from "./Field";

type CalibrationOption = {
  value: string;
  label: string;
};

type CalibrationQuestion = {
  field: keyof CoachCalibration;
  label: string;
  hint: string;
  options: CalibrationOption[];
};

const questions: CalibrationQuestion[] = [
  {
    field: "implementation_pattern",
    label: "Recent implementation",
    hint: "What best describes what happened since the last coaching conversation?",
    options: [
      { value: "sustained_implementation", label: "Used repeatedly over time" },
      { value: "one_time_attempt", label: "Tried once or briefly" },
      { value: "planned_not_attempted", label: "Planned but not attempted" },
      { value: "reverted_to_old_habits", label: "Tried, then reverted" },
      { value: "unknown", label: "Not enough evidence" }
    ]
  },
  {
    field: "adaptation_pattern",
    label: "What happened after trying it?",
    hint: "Choose the closest evidence signal.",
    options: [
      { value: "adapted_based_on_evidence", label: "Adapted based on evidence" },
      { value: "repeated_without_adjustment", label: "Repeated without adjustment" },
      { value: "stopped_after_difficulty", label: "Stopped after difficulty" },
      { value: "waiting_for_more_direction", label: "Waiting for more direction" },
      { value: "unknown", label: "Not enough evidence" }
    ]
  },
  {
    field: "ownership_signal",
    label: "Ownership signal",
    hint: "How is the teacher talking about the work?",
    options: [
      { value: "owns_decisions_and_learning", label: "Owns decisions and learning" },
      { value: "partial_ownership", label: "Partial ownership" },
      { value: "externalizes_responsibility", label: "Mostly externalises responsibility" },
      { value: "defensive_or_dismissive", label: "Defensive or dismissive" },
      { value: "unknown", label: "Not enough evidence" }
    ]
  },
  {
    field: "risk_taking_signal",
    label: "Instructional risk",
    hint: "Did the teacher try a stretch move?",
    options: [
      { value: "meaningful_risk_taken", label: "Meaningful risk taken" },
      { value: "small_safe_adjustment", label: "Small safe adjustment" },
      { value: "avoided_risk", label: "Avoided a needed risk" },
      { value: "risk_not_relevant", label: "Not relevant this session" },
      { value: "unknown", label: "Not enough evidence" }
    ]
  },
  {
    field: "artifact_evidence",
    label: "Concrete evidence",
    hint: "What evidence is available?",
    options: [
      { value: "teacher_artifact", label: "Teacher artifact" },
      { value: "student_artifact", label: "Student artifact" },
      { value: "observation_evidence", label: "Observed implementation" },
      { value: "anecdotal_only", label: "Anecdotal only" },
      { value: "none_or_unknown", label: "None or unknown" }
    ]
  },
  {
    field: "student_outcome_signal",
    label: "Student-facing evidence",
    hint: "What student shift is visible?",
    options: [
      { value: "positive_student_shift", label: "Positive student shift" },
      { value: "mixed_or_unclear_shift", label: "Mixed or unclear" },
      { value: "no_observed_shift", label: "No observed shift yet" },
      { value: "negative_or_resistant_shift", label: "Negative or resistant shift" },
      { value: "not_observed", label: "Not observed" }
    ]
  },
  {
    field: "engagement_stance",
    label: "Coaching engagement",
    hint: "During coaching, the teacher was mostly...",
    options: [
      { value: "active_problem_solver", label: "Active problem-solver" },
      { value: "compliant_participant", label: "Compliant participant" },
      { value: "passive_observer", label: "Passive observer" },
      { value: "defensive_participant", label: "Defensive participant" },
      { value: "unknown", label: "Not enough evidence" }
    ]
  },
  {
    field: "resistance_context",
    label: "Resistance context",
    hint: "If resistance appeared, what best explains it?",
    options: [
      { value: "productive_discomfort", label: "Productive discomfort" },
      { value: "coach_induced_resistance", label: "Possible coach-induced resistance" },
      { value: "change_avoidance", label: "Change avoidance" },
      { value: "system_constraint", label: "System constraint" },
      { value: "no_resistance_observed", label: "No resistance observed" },
      { value: "unknown", label: "Not enough evidence" }
    ]
  },
  {
    field: "dialogic_participation_pattern",
    label: "Dialogic participation pattern",
    hint: "Which classroom talk pattern is most visible?",
    options: [
      { value: "group_shouting_few_students", label: "Group shouting / few students" },
      { value: "early_individual_volunteers", label: "Early individual volunteers" },
      { value: "targeted_questioning_pauses", label: "Targeted questions and pauses" },
      { value: "multiple_participation_modes", label: "Multiple participation modes" },
      {
        value: "purposeful_movement_between_talk_modes",
        label: "Purposeful movement between talk modes"
      },
      { value: "unknown", label: "Not enough evidence" }
    ]
  },
  {
    field: "reflective_depth_signal",
    label: "Reflective depth",
    hint: "Which reflection pattern best fits?",
    options: [
      { value: "action_focused", label: "Action-focused" },
      { value: "surface_cause_single_loop", label: "Surface cause / single-loop" },
      { value: "assumption_aware", label: "Assumption-aware" },
      { value: "reframing_and_transfer", label: "Reframing and transfer" },
      { value: "unknown", label: "Not enough evidence" }
    ]
  }
];

type CalibrationSectionProps = {
  value: CoachCalibration;
  onChange: (value: CoachCalibration) => void;
};

export function CalibrationSection({ value, onChange }: CalibrationSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  function updateField(field: keyof CoachCalibration, fieldValue: string) {
    onChange({
      ...value,
      [field]: fieldValue || undefined
    });
  }

  // Count active signals (excluding notes field)
  const activeSignalsCount = Object.entries(value).filter(
    ([key, val]) => key !== "calibration_notes" && val !== undefined && val !== ""
  ).length;

  return (
    <article className={`accordion ${isOpen ? "accordion--open" : ""}`}>
      <header
        className="accordion__trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle coach calibration parameters"
      >
        <div className="accordion__title-group">
          <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            🔧 Advanced Calibration Signals {activeSignalsCount > 0 ? `(${activeSignalsCount} active)` : "(Optional)"}
          </span>
          <span className="accordion__subtitle">
            Tailor the coaching challenge level, frame reframing, and GROW advice based on specific evidence.
          </span>
        </div>
        <svg
          className="accordion__chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </header>

      <div className="accordion__content">
        <p style={{ margin: "0 0 1.25rem", fontSize: "0.92rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Adjust these options to provide targeted context. These indicators represent observation evidence cues, 
          not appraisal ratings, and are kept strictly private to the coach surface.
        </p>

        <div className="calibration-grid">
          {questions.map((question) => (
            <Field key={question.field} label={question.label} hint={question.hint}>
              <select
                value={(value[question.field] as string | undefined) ?? ""}
                onChange={(event) => updateField(question.field, event.target.value)}
              >
                <option value="">Not selected</option>
                {question.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          ))}
        </div>

        <Field
          label="Calibration notes"
          hint="Optional private coach note about uncertainty, context, or relationship dynamics."
        >
          <textarea
            value={value.calibration_notes ?? ""}
            onChange={(event) => updateField("calibration_notes", event.target.value)}
            rows={3}
            placeholder="e.g. Note any specific dialogic evidence gaps or concerns about teacher defensive postures..."
          />
        </Field>
      </div>
    </article>
  );
}
