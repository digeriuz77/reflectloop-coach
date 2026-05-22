import { useState } from "react";

import type { CoachCalibration, CoachPrepRequest } from "../types/coachPrep";
import { CalibrationSection } from "./CalibrationSection";
import { Field } from "./Field";

type CoachPrepFormProps = {
  isLoading: boolean;
  onSubmit: (request: CoachPrepRequest) => Promise<void>;
};

const initialCalibration: CoachCalibration = {};

export function CoachPrepForm({ isLoading, onSubmit }: CoachPrepFormProps) {
  const [teacherReflection, setTeacherReflection] = useState("");
  const [lessonOrContextNotes, setLessonOrContextNotes] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [programmePhase, setProgrammePhase] = useState("");
  const [impactCycle, setImpactCycle] = useState("");
  const [currentGoal, setCurrentGoal] = useState("");
  const [coachCalibration, setCoachCalibration] =
    useState<CoachCalibration>(initialCalibration);

  const hasTextInput =
    teacherReflection.trim() || lessonOrContextNotes.trim() || coachNotes.trim();

  // Load realistic pilot-aligned sample session data for the coach
  function handleLoadSampleData() {
    setTeacherReflection(
      "I tried giving students 5 seconds of wait time after asking open questions in science today, rather than calling on the first hand that went up. It felt incredibly quiet and a bit awkward at first, but then two students who usually never speak raised their hands and gave really thorough, multi-sentence answers. However, I struggled to keep this up when the lesson pace felt rushed in the middle, and I reverted to calling on early volunteers."
    );
    setLessonOrContextNotes(
      "Observation of Year 8 Science. The teacher focused on wait-time strategies. In the first 15 minutes, the teacher successfully held a 5-second pause after 3 main questions. Student uptake improved noticeably, with a quiet student sharing an insightful hypothesis. By minute 25 (textbook adapter page), the pace increased and wait time dropped to <1 second. Early individual volunteers dominated the remaining discussion."
    );
    setCoachNotes(
      "The teacher is highly motivated but feels pressure to 'cover' all textbook exercises, which drives a fast, non-dialogic pace. There is an underlying assumption that finishing the worksheet equals student learning. Need to challenge this single-loop focus on completion and help the teacher reframe classroom talk as the primary vehicle for understanding."
    );
    setProgrammePhase("First Cycles");
    setImpactCycle("Cycle 1");
    setCurrentGoal("Increase student reasoning after questions using wait time");
    setCoachCalibration({
      implementation_pattern: "one_time_attempt",
      adaptation_pattern: "stopped_after_difficulty",
      ownership_signal: "owns_decisions_and_learning",
      risk_taking_signal: "meaningful_risk_taken",
      artifact_evidence: "observation_evidence",
      student_outcome_signal: "positive_student_shift",
      engagement_stance: "active_problem_solver",
      resistance_context: "productive_discomfort",
      dialogic_participation_pattern: "early_individual_volunteers",
      reflective_depth_signal: "surface_cause_single_loop",
      calibration_notes: "Teacher is open but anxious about curriculum coverage. Relationship is highly supportive."
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      teacher_reflection: teacherReflection,
      lesson_or_context_notes: lessonOrContextNotes,
      coach_notes: coachNotes,
      session_context: {
        programme_phase: programmePhase,
        impact_cycle: impactCycle,
        current_goal: currentGoal,
        coach_calibration: coachCalibration
      }
    });
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <section className="panel">
        <div className="panel__header">
          <div className="form-actions-header">
            <h2>Session inputs</h2>
            <button
              type="button"
              className="demo-btn"
              onClick={handleLoadSampleData}
              title="Click to load a high-fidelity science classroom wait-time coaching scenario"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              Load Demo Session
            </button>
          </div>
          <p>Paste the coach-only preparation material. At least one note field is required.</p>
        </div>

        <Field label="Teacher reflection" hint="Optional. Use teacher-originated wording if available.">
          <textarea
            value={teacherReflection}
            onChange={(event) => setTeacherReflection(event.target.value)}
            rows={6}
            placeholder="e.g. What did the teacher think went well? What did they notice about student response?"
          />
        </Field>

        <Field
          label="Lesson or context notes"
          hint="Optional. This can include informal observation details; no source metadata required for P0."
        >
          <textarea
            value={lessonOrContextNotes}
            onChange={(event) => setLessonOrContextNotes(event.target.value)}
            rows={6}
            placeholder="e.g. Classroom observation details, timeline of wait-time execution, student engagement levels..."
          />
        </Field>

        <Field label="Coach notes" hint="Optional. Private coach-facing notes only.">
          <textarea
            value={coachNotes}
            onChange={(event) => setCoachNotes(event.target.value)}
            rows={6}
            placeholder="e.g. Private notes on teacher assumptions, coaching strategy hypotheses, relationship barriers..."
          />
        </Field>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Session context</h2>
          <p>Optional context to help calibrate the coaching conversation.</p>
        </div>

        <div className="context-grid">
          <Field label="Programme phase">
            <input
              value={programmePhase}
              onChange={(event) => setProgrammePhase(event.target.value)}
              placeholder="e.g. First Cycles"
            />
          </Field>

          <Field label="Impact cycle">
            <input
              value={impactCycle}
              onChange={(event) => setImpactCycle(event.target.value)}
              placeholder="e.g. Cycle 1"
            />
          </Field>

          <Field label="Current goal">
            <input
              value={currentGoal}
              onChange={(event) => setCurrentGoal(event.target.value)}
              placeholder="e.g. Increase student reasoning after questions"
            />
          </Field>
        </div>
      </section>

      <CalibrationSection value={coachCalibration} onChange={setCoachCalibration} />

      <div className="sticky-actions">
        <button type="submit" disabled={isLoading || !hasTextInput}>
          {isLoading ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: "spin 1.5s linear infinite" }}
              >
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              </svg>
              Generating Prep...
            </>
          ) : (
            "Generate coach prep"
          )}
        </button>
        {!hasTextInput ? <span>Add at least one note field to continue.</span> : null}
      </div>
    </form>
  );
}
