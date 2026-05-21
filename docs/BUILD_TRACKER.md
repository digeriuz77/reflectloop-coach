# ReflectLoop Coach — Build Tracker

> Created: 2026-05-21
> Last Updated: 2026-05-21
> Status: P0 coach dashboard and backend are deployment-prepared. Live deployment still requires Railway environment variables and a live LLM smoke test.

---

## Build Phases

### Build Governance
- [x] Droid context file
- [x] Build tracker
- [x] Build process
- [x] Agent instructions
- [x] Decision log
- [x] Quality gates
- [x] Release checklist
- [x] `.env.example`

### P0 — Core Coach Dashboard & Strategy Bank
- [x] FastAPI backend scaffold
- [ ] PostgreSQL + pgvector setup (Railway)
- [ ] SQLAlchemy data models (teachers, sessions, inputs, ai_outputs, strategies)
- [x] LLM prompt templates (Mode A: Pre-Session Prep)
- [x] Strategy bank seed data (JSON; vectorisation deferred)
- [x] Basic coach dashboard UI (React/Vite)
- [x] Input ingestion (text API and UI; file upload deferred)
- [x] Session synthesis + double-loop question generation
- [x] Grounded strategy matching (LLM constrained to seed-bank IDs; vector search deferred)
- [x] GROW conversation flow formatter

### P1 — RAG & Longitudinal Tracking
- [ ] Google Drive API integration (service account, read-only)
- [ ] Document parser (PDF, DOCX, MD)
- [ ] Chunking + embedding pipeline
- [ ] RAG retrieval at runtime
- [ ] Recurring frame detection across sessions
- [ ] Impact cycle progress tracking
- [ ] Programme phase indicator
- [ ] Longitudinal dashboard panel

### P2 — Voice AI & Teacher Surface
- [ ] Deepgram STT integration (Nova-2)
- [ ] Deepgram TTS integration (Aura)
- [ ] Conversational coaching supervisor prompt (Mode B)
- [ ] Voice chat UI (microphone button, transcript display)
- [ ] Teacher-facing reflection entry form
- [ ] Teacher-facing goal view (read-only, coach-entered)
- [ ] Teacher-facing self-assessment history

### P3 — M&E & Data Quality
- [ ] Peer observation source tagging UI
- [ ] Data quality labels (coach vs. peer vs. self)
- [ ] Observation role indicator in all outputs
- [ ] Export/reporting for programme evaluation (anonymised)

---

## Current Blockers / Decisions Needed

| # | Decision | Blocking | Status |
|---|---|---|---|
| 1 | LLM provider (Fireworks first; additional providers later) | P0 backend | ACCEPTED FOR P0 |
| 2 | Frontend framework (Vite+React) | P0 UI | ACCEPTED FOR P0 |
| 3 | Auth provider (shared coach access token; Clerk later) | Deployment | ACCEPTED FOR P0 |
| 4 | Google Drive folder structure + service account | P1 RAG | OPEN |
| 5 | Deepgram API key | P2 voice | OPEN |
| 6 | FERPA / data residency compliance | Deployment | OPEN |
| 7 | Integration with existing reflection app API | P1 longitudinal | OPEN |

---

## Latest Session Log

| Date | Action | Outcome |
|---|---|---|
| 2026-05-21 | Architecture design session | Full spec completed: dual-surface UI, Schön engine, strategy bank, voice layer, RAG pipeline, Railway stack |
| 2026-05-21 | Created project files | `DROID_CONTEXT.md` and `BUILD_TRACKER.md` created in `C:\Users\user\builds\reflectloop-coach\docs\` |
| 2026-05-21 | Established build governance | Added `BUILD_PROCESS.md`, `AGENT_INSTRUCTIONS.md`, `DECISION_LOG.md`, `QUALITY_GATES.md`, and `RELEASE_CHECKLIST.md` |
| 2026-05-21 | Implemented P0 Sprint 0/1 backend slice | Added FastAPI scaffold, Fireworks-compatible LLM client, coach-prep endpoint, structured schemas, prompt template, strategy bank seed data, `.env.example`, `.gitignore`, and backend tests. Validators passed: `pytest` 6 passed, `ruff check`, health smoke test. |
| 2026-05-21 | Expanded strategy bank for pilot priorities | Expanded local strategy bank to 21 strategies covering dialogic English oracy, vocabulary/EAL, diagnostic AfL, mini-plenaries, stop-and-check routines, feedback/discussion, and textbook adaptation. Validators passed: `pytest` 8 passed, `ruff check`, JSON validation. |
| 2026-05-21 | Simplified inputs and added calibration prompts | Replaced structured P0 observation metadata with optional free-form `lesson_or_context_notes`; replaced direct progress/stuckness ratings with evidence-based coach calibration signals for implementation, adaptation, ownership, artifacts, student evidence, engagement, resistance context, dialogic participation, and reflective depth. Validators passed: `pytest` 11 passed, `ruff check`, rubric JSON validation. |
| 2026-05-21 | Built P0 coach dashboard and deployment prep | Added Vite/React coach-only dashboard, evidence-signal calibration UI, backend CORS, shared coach access token protection, Railway configs for separate frontend/backend services, frontend production start via `serve`, and frontend build scripts. Validators passed: backend `pytest` 12 passed, backend `ruff check`, frontend `typecheck`, `lint`, and `build`; deployment QA passed with env vars pending. |

---

## Notes

- Programme is non-evaluative, confidential. Dual-surface architecture is non-negotiable.
- Strategy bank must be tagged by framework (Alexander, HITS, Knight, MI, 5E, TLAC).
- Priority pain points: coach prep time, depth of teacher reflection, strategy matching for weak pedagogical knowledge.
- Voice AI is for coach support (coach talks to AI supervisor), not teacher-facing.
