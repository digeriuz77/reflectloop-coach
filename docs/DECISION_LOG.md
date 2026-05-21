# ReflectLoop Coach â€” Decision Log

> Created: 2026-05-21
> Purpose: Record important technical, product, privacy, and deployment decisions.

---

## Decision Format

Each decision should use:

```markdown
## YYYY-MM-DD â€” Decision Title

**Status:** Proposed | Accepted | Superseded
**Context:** Why the decision is needed.
**Decision:** What we decided.
**Rationale:** Why this option was chosen.
**Consequences:** Trade-offs, follow-up work, risks.
```

---

## 2026-05-21 â€” Use a Coach-Only P0 MVP

**Status:** Accepted
**Context:** The app could become large quickly: teacher UI, RAG, voice, M&E, longitudinal tracking, and deployment concerns.
**Decision:** Build a coach-only MVP first.
**Rationale:** This validates the highest-value loop: coach prep time, depth of reflection, and strategy matching.
**Consequences:** Teacher-facing UI, voice, full RAG, and M&E exports are deferred until the core coaching engine is proven.

---

## 2026-05-21 â€” Prefer FastAPI Backend and Vite/React Frontend

**Status:** Accepted
**Context:** The app needs a simple Railway-deployable structure with LLM calls, later RAG, and a lightweight dashboard.
**Decision:** Use FastAPI for backend and Vite + React for frontend unless a later constraint requires otherwise.
**Rationale:** FastAPI is strong for Python LLM/RAG work; Vite/React is simple for a small dashboard.
**Consequences:** The project should be scaffolded with separate `backend/` and `frontend/` folders.

---

## 2026-05-21 â€” Start Without Full RAG

**Status:** Accepted
**Context:** Google Drive ingestion and pgvector are useful but can delay validating the prompt engine.
**Decision:** Start with a local seed strategy bank and prompt templates. Add RAG in P1.
**Rationale:** Prompt quality and strategy usefulness should be tested before building document ingestion infrastructure.
**Consequences:** Early results depend on the seed strategy bank, not full programme-document retrieval.

---

## 2026-05-21 â€” Use Fireworks-Compatible LLM Client Behind Provider Interface

**Status:** Accepted
**Context:** Sprint 0/1 requires an LLM integration that can later swap providers or models without rewriting app logic.
**Decision:** Implement a vendor-agnostic LLM interface with Fireworks.ai as the first OpenAI-compatible provider, using `accounts/fireworks/models/qwen3p6-plus` for P0.
**Rationale:** Fireworks can be configured through `LLM_PROVIDER`, `LLM_MODEL`, `FIREWORKS_API_KEY`, and generation settings, keeping model choice in environment variables.
**Consequences:** P0 backend uses Qwen 3.6 Plus via Fireworks by default. Future OpenAI, Anthropic, OpenRouter, or embedding clients can be added behind separate provider interfaces.

---

## 2026-05-21 â€” Expand Strategy Bank Around Pilot Instructional Priorities

**Status:** Accepted
**Context:** The pilot needs nuanced coaching support for teachers using textbooks with underperforming EAL learners. The core improvement areas are dialogic teaching for English oracy, explicit vocabulary teaching, and assessment for learning.
**Decision:** Expand the P0 local strategy bank around four focus areas: dialogic/oracy, vocabulary/EAL, diagnostic AfL, and textbook adaptation.
**Rationale:** The LLM can only give practical, relevant recommendations if the strategy bank contains concrete classroom moves matched to the pilot context.
**Consequences:** P0 prompt grounding now prioritises small, implementable adaptations such as academic recasts, sentence stems, vocabulary pre-teaching, mini-whiteboard scans, mini-plenary error sorts, and textbook question upgrades.

---

## 2026-05-21 â€” Simplify P0 Inputs and Add Evidence-Based Coach Calibration

**Status:** Accepted
**Context:** For the coach-prep MVP, observation details may be embedded in coach notes, and direct numerical progress/stuckness ratings could overstate subjective coach impressions.
**Decision:** Replace structured P0 observation metadata with optional free-form `lesson_or_context_notes`, and use internal `coach_calibration` evidence signals selected through concrete this-or-that prompts rather than direct numerical ratings. Formal source-tracked observation records are deferred until future observation/M&E features.
**Rationale:** This reduces coach input friction while encouraging evidence-based calibration around implementation, adaptation, ownership, artifacts, student evidence, engagement stance, resistance context, classroom talk pattern, and reflective depth.
**Consequences:** P0 no longer requires `source`, `observer_role`, or `instrument` because it is not creating formal observation records. If formal observation records are added later, source tracking remains mandatory. Calibration signals must remain internal and must not be presented as teacher-facing scores or appraisals.

---

## 2026-05-21 â€” Use Shared Coach Access Token for P0 Deployment

**Status:** Accepted
**Context:** P0 handles teacher reflections and private coach notes, so public unauthenticated deployment is not acceptable. Full multi-user auth is out of scope for P0.
**Decision:** Protect the coach-prep API with a backend `COACH_ACCESS_TOKEN` in non-local environments. The frontend asks the coach to enter the token and stores it only in browser session storage.
**Rationale:** This gives a simple deployment-safe access boundary without building full auth prematurely.
**Consequences:** Railway backend must set `ENVIRONMENT=production` and `COACH_ACCESS_TOKEN`. Clerk or proper role-based auth remains a later decision before broader use.

---

## 2026-05-21 â€” Deploy as Separate Railway Services for P0

**Status:** Accepted
**Context:** The project has separate `backend/` and `frontend/` folders with different runtimes.
**Decision:** Configure Railway as two services: backend service rooted at `backend/`, frontend service rooted at `frontend/`.
**Rationale:** This is simpler than serving static frontend assets from FastAPI and keeps local/backend/frontend build processes clear.
**Consequences:** Frontend `VITE_API_BASE_URL` must be set to the deployed backend URL at build time, and backend `CORS_ORIGINS` must include the deployed frontend URL.

---

## Open Decisions

| # | Decision | Needed By | Status |
|---|---|---|---|
| 1 | LLM provider: Fireworks first, additional providers later | P0 backend | Accepted for P0 |
| 2 | Auth provider: shared coach access token for P0; Clerk/custom later | Before broader deployment | Accepted for P0 |
| 3 | Railway service layout: separate backend/frontend services | First deployment | Accepted for P0 |
| 4 | Data residency / FERPA requirements | Before real teacher data | Open |
| 5 | Google Drive folder and service account design | P1 RAG | Open |
| 6 | Voice provider confirmation and Deepgram keys | P2 voice | Open |
