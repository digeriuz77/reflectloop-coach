import { useState } from "react";

import {
  generateCoachPrep,
  getStoredCoachAccessToken,
  storeCoachAccessToken
} from "./api/coachPrep";
import { CoachPrepForm } from "./components/CoachPrepForm";
import { OutputCards } from "./components/OutputCards";
import type { CoachPrepOutput, CoachPrepRequest } from "./types/coachPrep";

export default function App() {
  const [output, setOutput] = useState<CoachPrepOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coachAccessToken, setCoachAccessToken] = useState(getStoredCoachAccessToken);

  async function handleSubmit(request: CoachPrepRequest) {
    setError(null);
    setIsLoading(true);
    try {
      storeCoachAccessToken(coachAccessToken);
      const response = await generateCoachPrep(request, coachAccessToken);
      setOutput(response);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unknown error.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Coach-only P0 dashboard</p>
          <h1>ReflectLoop Coach</h1>
          <p>
            Prepare a coaching conversation with Schön-style double-loop questions, grounded
            classroom strategies, and a GROW guide.
          </p>
        </div>
        <div className="privacy-card">
          <strong>Confidentiality guardrail</strong>
          <span>
            This surface is for coach preparation only. Calibration signals are internal evidence
            prompts, not teacher-facing ratings.
          </span>
        </div>
      </header>

      <section className="access-panel">
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

      <div className="layout">
        <CoachPrepForm isLoading={isLoading} onSubmit={handleSubmit} />

        <aside className="results-column">
          {isLoading ? (
            <div className="panel loading-overlay">
              <div className="loading-spinner"></div>
              <div className="loading-text">Synthesizing Session Data...</div>
              <div className="loading-sub">
                Reframing dominant assumptions, generating Double-Loop questions, and building your custom GROW coaching conversation guide...
              </div>
            </div>
          ) : error ? (
            <div className="error-card">{error}</div>
          ) : output ? (
            <OutputCards output={output} />
          ) : (
            <section className="panel empty-state">
              <h2>Output will appear here</h2>
              <p>
                Generate coach prep after entering notes. The app will return synthesis,
                double-loop questions, grounded strategies, and GROW guidance.
              </p>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
