import { useState } from "react";

import type {
  CoachCalibration,
  CoachPrepRequest,
  SessionHistoryEntry
} from "../types/coachPrep";
import { CalibrationSection } from "./CalibrationSection";
import { Field } from "./Field";

type CoachPrepFormProps = {
  isLoading: boolean;
  onSubmit: (request: CoachPrepRequest) => Promise<void>;
};

type SessionHistoryTextField = Exclude<keyof SessionHistoryEntry, "raw_fields">;

const initialCalibration: CoachCalibration = {};
const MAX_SESSION_HISTORY_ROWS = 50;

const historyHeaderMap: Record<string, SessionHistoryTextField> = {
  source_date: "source_date",
  sourcedate: "source_date",
  date: "source_date",
  teacher: "teacher",
  school: "school",
  coach: "coach",
  current_goal: "current_goal",
  currentgoal: "current_goal",
  goal: "current_goal",
  progress: "progress",
  teacher_reflection: "teacher_reflection",
  teacherreflection: "teacher_reflection",
  coach_reflection: "coach_reflection",
  coachreflection: "coach_reflection",
  coach_notes: "coach_reflection",
  coachnotes: "coach_reflection",
  rag: "rag",
  ai_teacher_summary: "ai_teacher_summary",
  aiteachersummary: "ai_teacher_summary",
  teacher_summary: "ai_teacher_summary",
  ai_coach_next_step: "ai_coach_next_step",
  aicoachnextstep: "ai_coach_next_step",
  coach_next_step: "ai_coach_next_step",
  next_step: "ai_coach_next_step"
};

const prebriefGuidingPrompts = [
  "What do you expect the teacher will want to talk about?",
  "What will you be tempted to affirm or praise?",
  "What change in students do you think is (or is not) happening, and what is your evidence?",
  "What might you be avoiding raising, and why?"
];

export function CoachPrepForm({ isLoading, onSubmit }: CoachPrepFormProps) {
  const [coachPrebrief, setCoachPrebrief] = useState("");
  const [teacherReflection, setTeacherReflection] = useState("");
  const [lessonOrContextNotes, setLessonOrContextNotes] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [programmePhase, setProgrammePhase] = useState("");
  const [impactCycle, setImpactCycle] = useState("");
  const [currentGoal, setCurrentGoal] = useState("");
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryEntry[]>([]);
  const [historyUploadMessage, setHistoryUploadMessage] = useState<string | null>(null);
  const [coachCalibration, setCoachCalibration] =
    useState<CoachCalibration>(initialCalibration);

  const hasGenerationInput =
    coachPrebrief.trim() ||
    teacherReflection.trim() ||
    lessonOrContextNotes.trim() ||
    coachNotes.trim() ||
    sessionHistory.length > 0;

  // Load realistic pilot-aligned sample session data for the coach
  function handleLoadSampleData() {
    setCoachPrebrief(
      "I expect she will walk me through everything she did this week: the wait-time attempts, the group work, the worksheet completion. I will be tempted to praise how hard she is working because she genuinely is. My honest hypothesis: two quieter students are starting to reason aloud when given time, but I have no evidence the rest of the class is thinking more deeply. I have been avoiding raising how much she talks in the first 15 minutes because she is anxious and the relationship is still building."
    );
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
    setSessionHistory([]);
    setHistoryUploadMessage(null);
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

  async function handleHistoryUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsedRows = parseSessionHistory(text);
      setSessionHistory(parsedRows.slice(0, MAX_SESSION_HISTORY_ROWS));
      setHistoryUploadMessage(
        parsedRows.length > MAX_SESSION_HISTORY_ROWS
          ? `Loaded the first ${MAX_SESSION_HISTORY_ROWS} rows from ${file.name}.`
          : `Loaded ${parsedRows.length} row${parsedRows.length === 1 ? "" : "s"} from ${file.name}.`
      );
    } catch (error) {
      setSessionHistory([]);
      setHistoryUploadMessage(error instanceof Error ? error.message : "Could not parse this file.");
    } finally {
      event.target.value = "";
    }
  }

  function handleClearSessionHistory() {
    setSessionHistory([]);
    setHistoryUploadMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      coach_prebrief: coachPrebrief,
      teacher_reflection: teacherReflection,
      lesson_or_context_notes: lessonOrContextNotes,
      coach_notes: coachNotes,
      session_history: sessionHistory.length ? sessionHistory : undefined,
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

        <div className="field">
          <span className="field__label">Coach pre-brief</span>
          <span className="field__hint">
            Optional but powerful. Think aloud before the meeting; the AI uses this to spot
            affirmation traps and build lens-shift prompts. Useful things to cover:
          </span>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.2rem",
              fontSize: "0.88rem",
              color: "var(--text-muted)",
              lineHeight: 1.55
            }}
          >
            {prebriefGuidingPrompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
          <textarea
            value={coachPrebrief}
            onChange={(event) => setCoachPrebrief(event.target.value)}
            rows={6}
            placeholder="e.g. She'll want to tell me about the group work. I'll be tempted to praise the effort. I think two quieter students are changing, but I have no whole-class evidence. I've been avoiding raising how much she talks early in the lesson..."
          />
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
          <h2>Session history CSV</h2>
          <p>
            Optional. Upload a CSV or tab-separated export with dated rows so the AI can look for
            growth, changes, goal drift, and recurring coaching patterns during this session only.
          </p>
        </div>

        <Field
          label="Upload session history"
          hint="Recognised headers include Source Date, Teacher, School, Coach, Current Goal, Progress, Teacher Reflection, Coach Reflection, RAG, AI Teacher Summary, and AI Coach Next Step."
        >
          <input
            type="file"
            accept=".csv,.tsv,text/csv,text/tab-separated-values"
            onChange={handleHistoryUpload}
          />
        </Field>

        {historyUploadMessage ? (
          <p className={sessionHistory.length ? "upload-status" : "upload-status upload-status--error"}>
            {historyUploadMessage}
          </p>
        ) : null}

        {sessionHistory.length ? (
          <div className="history-preview">
            <div className="history-preview__header">
              <strong>Parsed session history</strong>
              <button type="button" className="copy-btn" onClick={handleClearSessionHistory}>
                Clear
              </button>
            </div>
            <div className="history-preview__table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Teacher</th>
                    <th>Goal</th>
                    <th>Progress</th>
                    <th>Teacher reflection</th>
                    <th>Coach reflection</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionHistory.slice(0, 5).map((row, index) => (
                    <tr key={`${row.source_date ?? "row"}-${index}`}>
                      <td>{row.source_date ?? "—"}</td>
                      <td>{row.teacher ?? "—"}</td>
                      <td>{row.current_goal ?? "—"}</td>
                      <td>{row.progress ?? "—"}</td>
                      <td>{row.teacher_reflection ?? "—"}</td>
                      <td>{row.coach_reflection ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sessionHistory.length > 5 ? (
              <p className="history-preview__note">
                Showing 5 of {sessionHistory.length} parsed rows. All loaded rows will be sent for
                this generation request.
              </p>
            ) : null}
          </div>
        ) : null}
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
        <button type="submit" disabled={isLoading || !hasGenerationInput}>
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
        {!hasGenerationInput ? <span>Add notes or upload session history to continue.</span> : null}
      </div>
    </form>
  );
}

function parseSessionHistory(text: string): SessionHistoryEntry[] {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("The uploaded file is empty.");
  }

  const delimiter = detectDelimiter(trimmed);
  const rows = parseDelimitedRows(trimmed, delimiter).filter((row) =>
    row.some((cell) => cell.trim())
  );
  if (rows.length < 2) {
    throw new Error("The uploaded file needs a header row and at least one data row.");
  }

  const headers = rows[0].map((header) => header.trim());
  const parsedRows = rows
    .slice(1)
    .map((row) => mapHistoryRow(headers, row))
    .filter((row): row is SessionHistoryEntry => row !== null);
  if (!parsedRows.length) {
    throw new Error("No usable session history rows were found.");
  }

  return parsedRows;
}

function detectDelimiter(text: string): "," | "\t" {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  return (firstLine.match(/\t/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0)
    ? "\t"
    : ",";
}

function parseDelimitedRows(text: string, delimiter: "," | "\t"): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(field.trim());
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field.trim());
  rows.push(row);
  return rows;
}

function mapHistoryRow(headers: string[], row: string[]): SessionHistoryEntry | null {
  const entry: SessionHistoryEntry = {};
  const rawFields: Record<string, string> = {};

  headers.forEach((header, index) => {
    const value = row[index]?.trim();
    if (!value) {
      return;
    }

    const mappedField = historyHeaderMap[normalizeHeader(header)];
    if (mappedField) {
      entry[mappedField] = value;
    } else {
      rawFields[header] = value;
    }
  });

  if (Object.keys(rawFields).length) {
    entry.raw_fields = rawFields;
  }

  return Object.keys(entry).length ? entry : null;
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
