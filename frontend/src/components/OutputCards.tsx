import type { CoachPrepOutput } from "../types/coachPrep";

type OutputCardsProps = {
  output: CoachPrepOutput;
};

export function OutputCards({ output }: OutputCardsProps) {
  return (
    <div className="output-stack" aria-live="polite">
      <section className="panel panel--accent">
        <div className="panel__header">
          <h2>Session synthesis</h2>
          <p>{output.session_synthesis.summary}</p>
        </div>
        <List title="Evidence notes" items={output.session_synthesis.evidence_notes} />
        <List title="Uncertainties" items={output.session_synthesis.uncertainties} />
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Dominant frame</h2>
          <p>{output.dominant_frame.frame}</p>
          <span className="badge">Confidence: {output.dominant_frame.confidence}</span>
        </div>
        <List title="Evidence" items={output.dominant_frame.evidence} />
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Reframe suggestion</h2>
          <p>{output.reframe_suggestion.suggested_reframe}</p>
        </div>
        <div className="challenge-grid">
          <ChallengeCard label="Gentle" text={output.reframe_suggestion.coach_challenge_options.gentle} />
          <ChallengeCard
            label="Moderate"
            text={output.reframe_suggestion.coach_challenge_options.moderate}
          />
          <ChallengeCard label="Direct" text={output.reframe_suggestion.coach_challenge_options.direct} />
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Double-loop questions</h2>
          <p>Candidate prompts for the coach to choose from.</p>
        </div>
        <div className="card-list">
          {output.double_loop_questions.map((item, index) => (
            <article className="mini-card" key={`${item.question}-${index}`}>
              <span className="badge">{item.challenge_level}</span>
              <h3>{item.question}</h3>
              <p>{item.purpose}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Grounded strategies</h2>
          <p>Only strategy IDs returned by the backend strategy bank are shown.</p>
        </div>
        <div className="card-list">
          {output.grounded_strategies.length ? (
            output.grounded_strategies.map((strategy) => (
              <article className="mini-card" key={strategy.strategy_id}>
                <span className="badge">{strategy.strategy_id}</span>
                <h3>Why this fits</h3>
                <p>{strategy.rationale}</p>
                <h3>Coach bridge</h3>
                <p>{strategy.suggested_coach_bridge}</p>
              </article>
            ))
          ) : (
            <p>No grounded strategy was selected from the current strategy bank.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>GROW conversation guide</h2>
        </div>
        <div className="grow-grid">
          <List title="Goal" items={output.grow_conversation_guide.goal} />
          <List title="Reality" items={output.grow_conversation_guide.reality} />
          <List title="Options" items={output.grow_conversation_guide.options} />
          <List title="Will" items={output.grow_conversation_guide.will} />
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Coach confidence flags</h2>
        </div>
        <List items={output.coach_confidence_flags} />
      </section>
    </div>
  );
}

function ChallengeCard({ label, text }: { label: string; text: string }) {
  return (
    <article className="mini-card">
      <span className="badge">{label}</span>
      <p>{text}</p>
    </article>
  );
}

function List({ title, items }: { title?: string; items: string[] }) {
  if (!items.length) {
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
