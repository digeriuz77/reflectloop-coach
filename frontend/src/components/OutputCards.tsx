import { useState } from "react";
import type { CoachPrepOutput } from "../types/coachPrep";

type OutputCardsProps = {
  output: CoachPrepOutput;
};

export function OutputCards({ output }: OutputCardsProps) {
  const [activeTab, setActiveTab] = useState<"grow" | "analysis">("grow");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy helper to write text to clipboard and show feedback
  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      // Fallback if permission is denied
    });
  }

  function handlePrint() {
    window.print();
  }

  // Formatting helpers for copying structured segments
  function formatGrowGuideText() {
    const { goal, reality, options, will } = output.grow_conversation_guide;
    return [
      "=== GROW CONVERSATION GUIDE ===",
      "\n[G] GOAL:",
      ...goal.map(item => `• ${item}`),
      "\n[R] REALITY:",
      ...reality.map(item => `• ${item}`),
      "\n[O] OPTIONS:",
      ...options.map(item => `• ${item}`),
      "\n[W] WILL (COMMITMENT):",
      ...will.map(item => `• ${item}`)
    ].join("\n");
  }

  function formatQuestionsText() {
    return [
      "=== DOUBLE-LOOP QUESTIONS ===",
      ...output.double_loop_questions.map(
        (q, i) => `${i + 1}. [${q.challenge_level.toUpperCase()}] Question: ${q.question}\n   Purpose: ${q.purpose}`
      )
    ].join("\n\n");
  }

  function formatStrategiesText() {
    if (!output.grounded_strategies.length) return "No grounded strategies available.";
    return [
      "=== GROUNDED CLASSROOM STRATEGIES ===",
      ...output.grounded_strategies.map(
        (s, i) => `${i + 1}. [${s.strategy_id}] Rationale: ${s.rationale}\n   Coach Bridge: ${s.suggested_coach_bridge}`
      )
    ].join("\n\n");
  }

  function formatAnticipatedResponsesText() {
    return [
      "=== ANTICIPATED TEACHER RESPONSES ===",
      ...output.anticipated_teacher_responses.map(
        (response, i) => `${i + 1}. Likely response: ${response.likely_teacher_response}\n   Underlying need or concern: ${response.underlying_need_or_concern}\n   Coach prompt: ${response.coach_prompt}`
      )
    ].join("\n\n");
  }

  function formatSynthesisText() {
    return [
      `=== SESSION SYNTHESIS ===`,
      output.session_synthesis.summary,
      "\nEvidence Notes:",
      ...output.session_synthesis.evidence_notes.map(n => `• ${n}`),
      "\nUncertainties:",
      ...output.session_synthesis.uncertainties.map(u => `• ${u}`)
    ].join("\n");
  }

  return (
    <div className="output-stack" aria-live="polite">
      <div className="output-toolbar">
        {/* Segmented Control Tabs */}
        <nav className="tabs-control" aria-label="Output sections">
          <button
            type="button"
            className={`tab-btn ${activeTab === "grow" ? "tab-btn--active" : ""}`}
            onClick={() => setActiveTab("grow")}
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            💬 GROW Coaching Plan
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "analysis" ? "tab-btn--active" : ""}`}
            onClick={() => setActiveTab("analysis")}
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            📋 Background Analysis
          </button>
        </nav>
        <button
          type="button"
          className="print-btn"
          onClick={handlePrint}
          title="Open the browser print dialog and save all outputs as a PDF"
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
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print / save PDF
        </button>
      </div>

      <div className="screen-output">
        {/* TAB 1: GROW COACHING PLAN */}
        {activeTab === "grow" && (
          <>
          {/* GROW Conversation Guide Card */}
          <section className="panel panel--accent">
            <div className="panel__header">
              <div className="card-header-actions">
                <div>
                  <h2>GROW conversation guide</h2>
                  <p>Actionable scaffolding tailored to the teacher's current goal.</p>
                </div>
                <button
                  type="button"
                  className={`copy-btn ${copiedId === "grow-guide" ? "copy-btn--copied" : ""}`}
                  onClick={() => handleCopy(formatGrowGuideText(), "grow-guide")}
                  title="Copy full GROW Guide to Clipboard"
                >
                  {copiedId === "grow-guide" ? "Copied!" : "Copy Guide"}
                </button>
              </div>
            </div>

            <div className="grow-card-stack">
              {/* GOAL */}
              <article className="grow-step-card grow-step-card--g">
                <div className="grow-letter">G</div>
                <div className="grow-content">
                  <h3>
                    <span>Goal</span>
                    <span className="badge badge--emerald" style={{ marginBottom: 0 }}>Establish target</span>
                  </h3>
                  <ListItems items={output.grow_conversation_guide.goal} />
                </div>
              </article>

              {/* REALITY */}
              <article className="grow-step-card grow-step-card--r">
                <div className="grow-letter">R</div>
                <div className="grow-content">
                  <h3>
                    <span>Reality</span>
                    <span className="badge badge--amber" style={{ marginBottom: 0 }}>Examine situation</span>
                  </h3>
                  <ListItems items={output.grow_conversation_guide.reality} />
                </div>
              </article>

              {/* OPTIONS */}
              <article className="grow-step-card grow-step-card--o">
                <div className="grow-letter">O</div>
                <div className="grow-content">
                  <h3>
                    <span>Options</span>
                    <span className="badge" style={{ marginBottom: 0, background: "var(--grow-o-bg)", color: "var(--grow-o)", borderColor: "hsl(200, 85%, 85%)" }}>Explore pathways</span>
                  </h3>
                  <ListItems items={output.grow_conversation_guide.options} />
                </div>
              </article>

              {/* WILL */}
              <article className="grow-step-card grow-step-card--w">
                <div className="grow-letter">W</div>
                <div className="grow-content">
                  <h3>
                    <span>Will</span>
                    <span className="badge badge--purple" style={{ marginBottom: 0 }}>Secure commitment</span>
                  </h3>
                  <ListItems items={output.grow_conversation_guide.will} />
                </div>
              </article>
            </div>
          </section>

          {/* Double-Loop Questions Card */}
          <section className="panel">
            <div className="panel__header">
              <div className="card-header-actions">
                <div>
                  <h2>Double-loop questions</h2>
                  <p>Socratic questions targeting teacher's frames and underlying beliefs.</p>
                </div>
                <button
                  type="button"
                  className={`copy-btn ${copiedId === "questions" ? "copy-btn--copied" : ""}`}
                  onClick={() => handleCopy(formatQuestionsText(), "questions")}
                  title="Copy Socratic Questions to Clipboard"
                >
                  {copiedId === "questions" ? "Copied!" : "Copy Questions"}
                </button>
              </div>
            </div>
            
            <div className="card-list">
              {output.double_loop_questions.map((item, index) => (
                <article className="mini-card" key={`${item.question}-${index}`}>
                  <span className={`badge ${
                    item.challenge_level === "gentle" ? "badge--emerald" : 
                    item.challenge_level === "moderate" ? "badge--amber" : "badge--purple"
                  }`}>
                    {item.challenge_level} challenge
                  </span>
                  <h3 style={{ margin: "0.5rem 0", fontSize: "1.15rem", lineHeight: 1.4 }}>{item.question}</h3>
                  <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", margin: 0 }}>
                    <strong>Purpose:</strong> {item.purpose}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Reframe Suggestion Card */}
          <section className="panel">
            <div className="panel__header">
              <h2>Reframe suggestion</h2>
              <p>Shift from defensive or completion-focused mindsets to learning-oriented frames.</p>
            </div>
            <div className="mini-card" style={{ marginBottom: "1.25rem", borderLeft: "4px solid var(--primary)" }}>
              <span className="badge">Suggested Reframe</span>
              <p style={{ fontStyle: "italic", fontSize: "1.05rem", color: "var(--text-main)", fontWeight: 500 }}>
                "{output.reframe_suggestion.suggested_reframe}"
              </p>
            </div>
            <div className="challenge-grid">
              <ChallengeCard label="Gentle Approach" text={output.reframe_suggestion.coach_challenge_options.gentle} />
              <ChallengeCard
                label="Moderate Approach"
                text={output.reframe_suggestion.coach_challenge_options.moderate}
              />
              <ChallengeCard label="Direct Approach" text={output.reframe_suggestion.coach_challenge_options.direct} />
            </div>
          </section>

          {/* Anticipated Teacher Responses Card */}
          <section className="panel">
            <div className="panel__header">
              <div className="card-header-actions">
                <div>
                  <h2>Anticipated teacher responses</h2>
                  <p>Likely barriers and gentle prompts to preserve partnership while testing assumptions.</p>
                </div>
                <button
                  type="button"
                  className={`copy-btn ${copiedId === "anticipated-responses" ? "copy-btn--copied" : ""}`}
                  onClick={() => handleCopy(formatAnticipatedResponsesText(), "anticipated-responses")}
                  title="Copy anticipated responses to Clipboard"
                >
                  {copiedId === "anticipated-responses" ? "Copied!" : "Copy Responses"}
                </button>
              </div>
            </div>
            <AnticipatedResponseCards responses={output.anticipated_teacher_responses} />
          </section>
        </>
      )}

      {/* TAB 2: BACKGROUND ANALYSIS */}
      {activeTab === "analysis" && (
        <>
          {/* Session Synthesis Card */}
          <section className="panel panel--accent">
            <div className="panel__header">
              <div className="card-header-actions">
                <div>
                  <h2>Session synthesis</h2>
                  <p>AI-synthesized diagnostic analysis of the uploaded teacher and classroom notes.</p>
                </div>
                <button
                  type="button"
                  className={`copy-btn ${copiedId === "synthesis" ? "copy-btn--copied" : ""}`}
                  onClick={() => handleCopy(formatSynthesisText(), "synthesis")}
                  title="Copy Synthesis to Clipboard"
                >
                  {copiedId === "synthesis" ? "Copied!" : "Copy Summary"}
                </button>
              </div>
            </div>
            <div style={{ fontSize: "1.05rem", color: "var(--text-main)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              {output.session_synthesis.summary}
            </div>
            
            <div className="grow-grid">
              <List title="Classroom evidence signals" items={output.session_synthesis.evidence_notes} />
              <List title="Key uncertainties & gaps" items={output.session_synthesis.uncertainties} />
            </div>
          </section>

          {/* Dominant Frame Card */}
          <section className="panel">
            <div className="panel__header">
              <h2>Dominant frame</h2>
              <p>The teacher's underlying mental map identified from reflection inputs.</p>
            </div>
            <div className="mini-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <span className="badge">Current Frame</span>
                <h3 style={{ margin: "0.2rem 0 0", fontSize: "1.1rem" }}>"{output.dominant_frame.frame}"</h3>
              </div>
              <span className={`badge ${
                output.dominant_frame.confidence === "high" ? "badge--emerald" : 
                output.dominant_frame.confidence === "medium" ? "badge--amber" : "badge--purple"
              }`} style={{ margin: 0 }}>
                Confidence: {output.dominant_frame.confidence}
              </span>
            </div>
            <List title="Frame evidence notes" items={output.dominant_frame.evidence} />
          </section>

          {/* Grounded Strategies Card */}
          <section className="panel">
            <div className="panel__header">
              <div className="card-header-actions">
                <div>
                  <h2>Grounded strategies</h2>
                  <p>Evidence-based STEM adaptations matched from the pilot priority strategy bank.</p>
                </div>
                <button
                  type="button"
                  className={`copy-btn ${copiedId === "strategies" ? "copy-btn--copied" : ""}`}
                  onClick={() => handleCopy(formatStrategiesText(), "strategies")}
                  title="Copy Strategies to Clipboard"
                >
                  {copiedId === "strategies" ? "Copied!" : "Copy Strategies"}
                </button>
              </div>
            </div>
            <div className="card-list">
              {output.grounded_strategies.length ? (
                output.grounded_strategies.map((strategy) => (
                  <article className="mini-card" key={strategy.strategy_id} style={{ borderLeft: "4px solid var(--grow-o)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span className="badge badge--emerald">{strategy.strategy_id}</span>
                    </div>
                    <h4 style={{ fontSize: "0.95rem", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 0.35rem" }}>Why this fits</h4>
                    <p style={{ margin: "0 0 1rem", fontSize: "0.95rem" }}>{strategy.rationale}</p>
                    <h4 style={{ fontSize: "0.95rem", textTransform: "uppercase", color: "var(--grow-o)", margin: "0 0 0.35rem" }}>Suggested coach bridge</h4>
                    <p style={{ fontSize: "0.95rem", fontStyle: "italic", color: "var(--text-main)" }}>"{strategy.suggested_coach_bridge}"</p>
                  </article>
                ))
              ) : (
                <p style={{ margin: 0, color: "var(--text-muted)" }}>
                  No strategies were selected from the current database matching this specific diagnostic mix.
                </p>
              )}
            </div>
          </section>

          {/* Coach Confidence Flags */}
          {output.coach_confidence_flags && output.coach_confidence_flags.length > 0 && (
            <section className="panel">
              <div className="panel__header">
                <h2>Coach confidence alerts</h2>
                <p>System flags indicating limited context or potentially conflicting evidence.</p>
              </div>
              <List items={output.coach_confidence_flags} />
            </section>
          )}
        </>
      )}
      </div>
      <PrintExportView output={output} />
    </div>
  );
}

function PrintExportView({ output }: OutputCardsProps) {
  return (
    <div className="print-export-view" aria-label="Printable full coach prep">
      <header className="print-page-title">
        <p className="eyebrow">Coach-only preparation export</p>
        <h1>ReflectLoop Coach Prep</h1>
        <p>
          Complete output including the GROW plan, anticipated responses, grounded strategies, and background analysis.
        </p>
      </header>

      <section className="panel panel--accent">
        <div className="panel__header">
          <h2>GROW conversation guide</h2>
          <p>Actionable scaffolding tailored to the teacher's current goal.</p>
        </div>
        <div className="grow-card-stack">
          <article className="grow-step-card grow-step-card--g">
            <div className="grow-letter">G</div>
            <div className="grow-content">
              <h3>Goal</h3>
              <ListItems items={output.grow_conversation_guide.goal} />
            </div>
          </article>
          <article className="grow-step-card grow-step-card--r">
            <div className="grow-letter">R</div>
            <div className="grow-content">
              <h3>Reality</h3>
              <ListItems items={output.grow_conversation_guide.reality} />
            </div>
          </article>
          <article className="grow-step-card grow-step-card--o">
            <div className="grow-letter">O</div>
            <div className="grow-content">
              <h3>Options</h3>
              <ListItems items={output.grow_conversation_guide.options} />
            </div>
          </article>
          <article className="grow-step-card grow-step-card--w">
            <div className="grow-letter">W</div>
            <div className="grow-content">
              <h3>Will</h3>
              <ListItems items={output.grow_conversation_guide.will} />
            </div>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Double-loop questions</h2>
          <p>Socratic questions targeting teacher's frames and underlying beliefs.</p>
        </div>
        <div className="card-list">
          {output.double_loop_questions.map((item, index) => (
            <article className="mini-card" key={`${item.question}-print-${index}`}>
              <span className={`badge ${
                item.challenge_level === "gentle" ? "badge--emerald" :
                item.challenge_level === "moderate" ? "badge--amber" : "badge--purple"
              }`}>
                {item.challenge_level} challenge
              </span>
              <h3>{item.question}</h3>
              <p><strong>Purpose:</strong> {item.purpose}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Reframe suggestion</h2>
          <p>Shift from defensive or completion-focused mindsets to learning-oriented frames.</p>
        </div>
        <div className="mini-card" style={{ marginBottom: "1.25rem", borderLeft: "4px solid var(--primary)" }}>
          <span className="badge">Suggested Reframe</span>
          <p style={{ fontStyle: "italic", color: "var(--text-main)", fontWeight: 500 }}>
            "{output.reframe_suggestion.suggested_reframe}"
          </p>
        </div>
        <div className="challenge-grid">
          <ChallengeCard label="Gentle Approach" text={output.reframe_suggestion.coach_challenge_options.gentle} />
          <ChallengeCard label="Moderate Approach" text={output.reframe_suggestion.coach_challenge_options.moderate} />
          <ChallengeCard label="Direct Approach" text={output.reframe_suggestion.coach_challenge_options.direct} />
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Anticipated teacher responses</h2>
          <p>Likely barriers and gentle prompts to preserve partnership while testing assumptions.</p>
        </div>
        <AnticipatedResponseCards responses={output.anticipated_teacher_responses} />
      </section>

      <section className="panel panel--accent">
        <div className="panel__header">
          <h2>Session synthesis</h2>
          <p>AI-synthesized diagnostic analysis of the uploaded teacher and classroom notes.</p>
        </div>
        <p style={{ fontSize: "1.05rem", color: "var(--text-main)", lineHeight: 1.6 }}>
          {output.session_synthesis.summary}
        </p>
        <div className="grow-grid">
          <List title="Classroom evidence signals" items={output.session_synthesis.evidence_notes} />
          <List title="Key uncertainties & gaps" items={output.session_synthesis.uncertainties} />
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Dominant frame</h2>
          <p>The teacher's underlying mental map identified from reflection inputs.</p>
        </div>
        <div className="mini-card" style={{ marginBottom: "1.25rem" }}>
          <span className="badge">Current Frame</span>
          <h3>"{output.dominant_frame.frame}"</h3>
          <span className={`badge ${
            output.dominant_frame.confidence === "high" ? "badge--emerald" :
            output.dominant_frame.confidence === "medium" ? "badge--amber" : "badge--purple"
          }`}>
            Confidence: {output.dominant_frame.confidence}
          </span>
        </div>
        <List title="Frame evidence notes" items={output.dominant_frame.evidence} />
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Grounded strategies</h2>
          <p>Evidence-based STEM adaptations matched from the pilot priority strategy bank.</p>
        </div>
        <div className="card-list">
          {output.grounded_strategies.length ? (
            output.grounded_strategies.map((strategy) => (
              <article className="mini-card" key={`${strategy.strategy_id}-print`} style={{ borderLeft: "4px solid var(--grow-o)" }}>
                <span className="badge badge--emerald">{strategy.strategy_id}</span>
                <h4>Why this fits</h4>
                <p>{strategy.rationale}</p>
                <h4>Suggested coach bridge</h4>
                <p style={{ fontStyle: "italic", color: "var(--text-main)" }}>"{strategy.suggested_coach_bridge}"</p>
              </article>
            ))
          ) : (
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              No strategies were selected from the current database matching this specific diagnostic mix.
            </p>
          )}
        </div>
      </section>

      {output.coach_confidence_flags && output.coach_confidence_flags.length > 0 && (
        <section className="panel">
          <div className="panel__header">
            <h2>Coach confidence alerts</h2>
            <p>System flags indicating limited context or potentially conflicting evidence.</p>
          </div>
          <List items={output.coach_confidence_flags} />
        </section>
      )}
    </div>
  );
}

function AnticipatedResponseCards({
  responses
}: {
  responses: CoachPrepOutput["anticipated_teacher_responses"];
}) {
  if (!responses || !responses.length) {
    return null;
  }

  return (
    <div className="card-list">
      {responses.map((response, index) => (
        <article className="mini-card response-card" key={`${response.likely_teacher_response}-${index}`}>
          <span className="badge badge--amber">Possible barrier</span>
          <h3 style={{ margin: "0.35rem 0 0.75rem", fontSize: "1.05rem" }}>
            "{response.likely_teacher_response}"
          </h3>
          <p style={{ marginBottom: "0.85rem" }}>
            <strong>Underlying need or concern:</strong> {response.underlying_need_or_concern}
          </p>
          <p style={{ color: "var(--text-main)", fontStyle: "italic" }}>
            <strong>Coach prompt:</strong> "{response.coach_prompt}"
          </p>
        </article>
      ))}
    </div>
  );
}

function ChallengeCard({ label, text }: { label: string; text: string }) {
  return (
    <article className="mini-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <span className={`badge ${
        label.startsWith("Gentle") ? "badge--emerald" : 
        label.startsWith("Moderate") ? "badge--amber" : "badge--purple"
      }`} style={{ margin: 0 }}>
        {label}
      </span>
      <p style={{ fontSize: "0.92rem", lineHeight: 1.5, color: "var(--text-main)", margin: 0 }}>
        {text}
      </p>
    </article>
  );
}

function List({ title, items }: { title?: string; items: string[] }) {
  if (!items || !items.length) {
    return null;
  }

  return (
    <div className="list-block">
      {title ? <h3>{title}</h3> : null}
      <ul>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ListItems({ items }: { items: string[] }) {
  if (!items || !items.length) {
    return <span style={{ color: "var(--text-light)" }}>None provided</span>;
  }

  return (
    <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`} style={{ margin: "0.25rem 0" }}>{item}</li>
      ))}
    </ul>
  );
}
