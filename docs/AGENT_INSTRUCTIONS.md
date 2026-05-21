# ReflectLoop Coach â€” Agent Instructions

> Created: 2026-05-21
> Purpose: Operating rules for Droid and any delegated agents working on this project.

---

## 1. Required Context Before Work

Before implementing, reviewing, or planning any feature, read:

1. `docs/DROID_CONTEXT.md`
2. `docs/BUILD_TRACKER.md`
3. `docs/BUILD_PROCESS.md`
4. this file

If working on data, auth, prompts, AI output, teacher UI, or reporting, also review the confidentiality rules in `docs/DROID_CONTEXT.md`.

---

## 2. Non-Negotiable Rules

1. **Build coach-only P0 first.**
   - Do not add teacher-facing UI, voice, full RAG, or M&E exports during P0 unless explicitly instructed.

2. **Preserve the confidentiality wall.**
   - Teacher inputs may flow into coach analysis.
   - Coach notes, coach analysis, coded observations, and fidelity/evaluation data must never flow into teacher-facing APIs or UI.

3. **Track source and role on every observation-like record.**
   - Required fields:
     - `source`
     - `observer_role`
     - `instrument`

4. **Do not collapse evidence sources.**
   - Teacher self-report, peer observation, coach notes, and coded trainer feedback must remain separate.
   - Never generate one blended "observation score."

5. **Keep coaching non-evaluative.**
   - The app supports coaching preparation, not teacher appraisal.
   - Output should challenge and support without judgement.

6. **Do not log sensitive material.**
   - Never log identifiable teacher reflections, coach notes, LLM payloads, API keys, or uploaded document contents.

---

## 3. Agent Roles

### Lead Droid

Responsible for:
- maintaining overall architecture
- keeping work aligned to the current phase
- updating build tracker and decision log
- deciding when to delegate to specialist agents
- verifying final integration

Use for:
- default coordination
- final decisions
- cross-cutting architecture

### Worker Agent

Responsible for:
- focused research
- implementation support in bounded areas
- independent review of proposed designs

Use for:
- exploring options
- drafting implementation approaches
- reviewing a specific subsystem before coding

Do not use for:
- unsupervised changes to confidentiality-sensitive architecture
- broad edits without clear scope

### Backend Agent

Responsible for:
- FastAPI routes
- SQLAlchemy models
- database migrations
- LLM service integration
- RAG and pgvector later

Mandatory checks:
- API response does not leak coach-only data
- observation source fields are present
- sensitive data is not logged
- tests cover permission/data-boundary behaviour where applicable

### Frontend Agent

Responsible for:
- Vite/React coach dashboard
- later teacher-facing UI
- form design
- output display

Mandatory checks:
- each screen has a declared audience: `coach`, `teacher`, or `admin`
- P0 screens are coach-only
- teacher-facing surfaces never display coach-originated analysis

### LLM/Prompt Agent

Responsible for:
- prompt templates
- structured output schemas
- strategy matching logic
- test cases for AI output quality

Mandatory checks:
- outputs are non-evaluative
- double-loop questions challenge assumptions without shaming
- every recommended strategy is practical and linked to strategy-bank metadata
- no invented framework claims when the strategy bank lacks support

### QA/Review Agent

Responsible for:
- quality-gate review
- regression testing
- confidentiality-wall review
- prompt-output review

Use before:
- completing a phase
- deploying
- adding teacher-facing surfaces
- adding reporting/export functionality

### Deployment Agent

Responsible for:
- Railway deployment
- environment variables
- release checklist
- smoke tests

Mandatory checks:
- secrets are configured only as environment variables
- `.env.example` contains placeholders only
- migrations run cleanly
- rollback path is documented

---

## 4. Handoff Protocol

Every agent handoff must include:

- task objective
- files likely to change
- phase (`P0`, `P1`, `P2`, or `P3`)
- constraints
- expected output
- validation required

Example:

```text
Goal: Implement P0 coach-prep endpoint.
Files: backend/app/api/coach_prep.py, backend/app/services/llm.py, backend/app/prompts/coach_prep.md.
Phase: P0.
Constraints: coach-only; no persistence required yet; no sensitive payload logging.
Expected output: POST /api/coach-prep/generate returns structured JSON.
Validation: backend tests pass; manual sample request returns synthesis/questions/strategies/GROW guide.
```

---

## 5. Review Checklist for Every Change

- [ ] Does this belong to the active phase?
- [ ] Does it preserve the confidentiality wall?
- [ ] Does it avoid blended scoring?
- [ ] Are observation sources explicit?
- [ ] Are teacher-facing and coach-facing outputs separated?
- [ ] Are secrets excluded from code and docs?
- [ ] Are validators/tests run?
- [ ] Is `BUILD_TRACKER.md` updated if build status changed?
- [ ] Is `DECISION_LOG.md` updated if a decision was made?
