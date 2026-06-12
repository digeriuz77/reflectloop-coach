import { useRef, useState } from "react";

import {
  generateCoachPrep,
  getStoredCoachAccessToken,
  refineCoachPrep,
  storeCoachAccessToken
} from "./api/coachPrep";
import { CoachPrepForm } from "./components/CoachPrepForm";
import { OutputCards } from "./components/OutputCards";
import type { CoachPrepOutput, CoachPrepRequest } from "./types/coachPrep";

export default function App() {
  const [output, setOutput] = useState<CoachPrepOutput | null>(null);
  const [lastRequest, setLastRequest] = useState<CoachPrepRequest | null>(null);
  const [refineReaction, setRefineReaction] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coachAccessToken, setCoachAccessToken] = useState(getStoredCoachAccessToken);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  function scrollToResults() {
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  async function handleSubmit(request: CoachPrepRequest) {
    setError(null);
    setIsLoading(true);
    scrollToResults();
    try {
      storeCoachAccessToken(coachAccessToken);
      const response = await generateCoachPrep(request, coachAccessToken);
      setOutput(response);
      setLastRequest(request);
      setRefineReaction("");
      scrollToResults();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unknown error.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefine() {
    if (!output || !lastRequest || !refineReaction.trim()) {
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      storeCoachAccessToken(coachAccessToken);
      const response = await refineCoachPrep(
        {
          original_request: lastRequest,
          previous_output: output,
          coach_reaction: refineReaction.trim()
        },
        coachAccessToken
      );
      setOutput(response);
      setRefineReaction("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unknown error.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Coach preparation</p>
        <h1>Prepare a transformative coaching conversation</h1>
        <p>
          Surface the teacher's values, anchor the conversation in student impact, and walk in with
          a GROW plan you can actually use in the room.
        </p>
        <div className="hero__meta">
          <span className="hero__chip">Coach-only — never teacher-facing</span>
          <button
            type="button"
            className="hero__settings"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-expanded={settingsOpen}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            {settingsOpen ? "Hide access settings" : "Access settings"}
          </button>
        </div>
      </header>

      {settingsOpen ? (
        <section className="app-settings access-panel">
          <label>
            <span>Coach access token</span>
            <input
              type="password"
              value={coachAccessToken}
              onChange={(event) => setCoachAccessToken(event.target.value)}
              placeholder="Required when backend COACH_ACCESS_TOKEN is configured"
              autoComplete="off"
            />
          </label>
          <p>
            Stored only in this browser session. Do not paste real teacher or coach notes unless the
            backend is deployed privately with access control enabled.
          </p>
        </section>
      ) : null}

      <div className="workspace">
        <CoachPrepForm isLoading={isLoading} onSubmit={handleSubmit} />

        <div className="results-area" ref={resultsRef}>
          {isLoading ? (
            <div className="panel loading-overlay">
              <div className="loading-spinner"></div>
              <div className="loading-text">Synthesizing session data...</div>
              <div className="loading-sub">
                Reframing dominant assumptions, generating double-loop questions, and building your
                custom GROW coaching conversation guide...
              </div>
            </div>
          ) : (
            <>
              {error ? <div className="error-card">{error}</div> : null}
              {output ? (
                <>
                  <OutputCards output={output} />
                  <section className="panel refine-panel">
                    <div className="panel__header">
                      <h2>Refine this prep</h2>
                      <p>
                        React like the expert you are. Correct what the AI got wrong, name what to
                        deepen, and it will revise the whole preparation around your steer.
                      </p>
                    </div>
                    <textarea
                      value={refineReaction}
                      onChange={(event) => setRefineReaction(event.target.value)}
                      rows={4}
                      placeholder="e.g. The values hypothesis is off — she's anxious about behaviour, not coverage. Push deeper on the talk-balance contradiction, and make the pivot prompts specific to the science investigation."
                    />
                    <div style={{ marginTop: "0.85rem" }}>
                      <button
                        type="button"
                        onClick={handleRefine}
                        disabled={!refineReaction.trim() || !lastRequest}
                      >
                        Refine prep
                      </button>
                    </div>
                  </section>
                </>
              ) : !error ? (
                <section className="panel empty-state">
                  <h2>Your coaching prep will appear here</h2>
                  <p>
                    Start with your pre-brief above, add any evidence you have, then generate. You
                    will get the teacher's likely values, a contradiction worth naming, grounded
                    next moves, and a GROW plan to guide the conversation.
                  </p>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
