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
          <h2>Session inputs</h2>
          <p>Paste the coach-only preparation material. At least one note field is required.</p>
        </div>

        <Field label="Teacher reflection" hint="Optional. Use teacher-originated wording if available.">
          <textarea
            value={teacherReflection}
            onChange={(event) => setTeacherReflection(event.target.value)}
            rows={6}
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
          />
        </Field>

        <Field label="Coach notes" hint="Optional. Private coach-facing notes only.">
          <textarea
            value={coachNotes}
            onChange={(event) => setCoachNotes(event.target.value)}
            rows={6}
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
          {isLoading ? "Generating..." : "Generate coach prep"}
        </button>
        {!hasTextInput ? <span>Add at least one note field to continue.</span> : null}
      </div>
    </form>
  );
}
