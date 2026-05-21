# ReflectLoop Coach â€” Build Process

> Created: 2026-05-21
> Purpose: Professional delivery process for building ReflectLoop Coach without losing the core confidentiality, coaching, and pedagogical requirements.

---

## 1. Delivery Principle

Build the smallest useful system first:

> A coach-only tool that turns teacher reflections, observation notes, and coach notes into a concise session synthesis, SchÃ¶n-style double-loop questions, grounded classroom strategies, and a GROW conversation guide.

Do not build the full platform before the coaching engine has been validated with realistic cases.

---

## 2. Build Phases

### P0 â€” Coach-Only MVP

**Goal:** Prove the coaching intelligence loop.

Scope:
- FastAPI backend scaffold
- Vite + React coach dashboard
- text paste input for:
  - teacher reflection
  - observation notes
  - coach notes
- seed strategy bank
- LLM prompt engine
- generated:
  - session synthesis
  - dominant frame
  - reframe suggestion
  - double-loop questions
  - grounded strategies
  - GROW guide
  - coach caution/confidentiality flags

Out of scope:
- teacher-facing UI
- voice
- Google Drive sync
- full RAG
- M&E reporting
- complex auth

### P1 â€” Persistence, RAG, and Longitudinal Context

**Goal:** Make the MVP useful across repeated coaching sessions.

Scope:
- PostgreSQL persistence
- pgvector support
- source-tracked observations
- stored sessions and generated outputs
- Google Drive document ingestion
- programme-material retrieval
- recurring-frame detection
- Impact Cycle and programme phase tracking

### P2 â€” Voice Coach Support and Limited Teacher Surface

**Goal:** Support live coach preparation and structured teacher reflection.

Scope:
- Deepgram STT/TTS
- conversational coaching-supervisor mode
- teacher reflection entry
- teacher goal view
- teacher self-assessment history

Constraint:
- teacher-facing surfaces must never expose coach-only notes or AI analysis derived from coach-only notes.

### P3 â€” M&E and Reporting

**Goal:** Support anonymised programme monitoring without corrupting coaching confidentiality.

Scope:
- source-quality labels
- anonymised exports
- programme-level reports
- no blended scoring across coach, peer, and teacher self-report sources

---

## 3. Work Cycle

Each build increment follows this cycle:

1. **Read context**
   - `docs/DROID_CONTEXT.md`
   - `docs/BUILD_TRACKER.md`
   - `docs/AGENT_INSTRUCTIONS.md`
   - relevant source files

2. **Confirm phase fit**
   - Does this belong to P0, P1, P2, or P3?
   - If it is outside the current phase, defer it unless explicitly requested.

3. **Define acceptance criteria**
   - user-visible behaviour
   - data boundary requirements
   - tests or manual checks

4. **Implement in small vertical slices**
   - prefer end-to-end slices over isolated infrastructure
   - keep each slice demonstrable

5. **Validate**
   - run backend tests, frontend tests/lint, and smoke checks as applicable
   - verify confidentiality boundaries

6. **Update tracking**
   - update `docs/BUILD_TRACKER.md`
   - add decisions to `docs/DECISION_LOG.md`
   - record blockers clearly

---

## 4. Quality Gates

No phase is considered complete unless these gates pass:

### Architecture Gate
- current work matches the active phase
- confidentiality wall remains intact
- observation source tracking remains explicit
- coach-only and teacher-facing data flows are not mixed

### Product Gate
- the feature solves one of the priority pain points:
  - coach prep time
  - depth of reflection
  - practical strategy matching
- the output is useful in a real coaching conversation

### Engineering Gate
- code is tested where practical
- local validators pass
- environment variables are documented without secrets
- no sensitive data is logged

### Coaching Integrity Gate
- output remains non-evaluative
- strategies are practical and implementable
- questions support double-loop reflection without shaming or judging the teacher

---

## 5. Definition of Done

A feature is done only when:

- it is implemented
- it has been manually checked with realistic sample data
- relevant tests/validators pass
- confidentiality implications have been reviewed
- `BUILD_TRACKER.md` is updated
- any architectural decision is recorded in `DECISION_LOG.md`

---

## 6. Recommended First Sprint

### Sprint 0 â€” Professional Setup

- create app scaffold
- initialise git repository
- add backend/frontend folders
- add `.env.example`
- add minimal test setup
- confirm LLM provider
- create first strategy bank seed file

### Sprint 1 â€” Coach Prep Engine

- implement `POST /api/coach-prep/generate`
- implement prompt templates
- load strategy bank from local JSON
- return structured coach-prep output
- test with 3 realistic cases

### Sprint 2 â€” Coach Dashboard

- build one-page coach dashboard
- wire dashboard to backend
- display generated output in structured cards
- add copy/export support for coach notes
