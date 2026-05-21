# ReflectLoop Coach â€” Quality Gates

> Created: 2026-05-21
> Purpose: Define the checks required before work is considered complete.

---

## 1. Universal Gates

Every feature must pass:

- [ ] phase-fit check
- [ ] confidentiality-wall check
- [ ] source-tracking check
- [ ] non-evaluative coaching-language check
- [ ] no-secrets check
- [ ] no-sensitive-logging check
- [ ] tests/validators relevant to changed files
- [ ] manual smoke test where applicable

---

## 2. P0 Gates â€” Coach-Only MVP

### Product

- [ ] coach can paste teacher reflection, observation notes, and coach notes
- [ ] app returns a useful session synthesis
- [ ] app identifies a dominant frame and possible reframe
- [ ] app generates 3â€“5 double-loop questions
- [ ] app recommends practical strategies from the seed bank
- [ ] app formats a GROW conversation guide

### Data and Privacy

- [ ] no teacher-facing UI exists
- [ ] coach notes are not exposed outside coach-only flow
- [ ] sensitive input is not logged

### Engineering

- [ ] backend starts locally
- [ ] frontend starts locally
- [ ] API contract is documented in code or schema
- [ ] backend tests pass
- [ ] frontend build/lint passes once frontend exists

---

## 3. P1 Gates â€” Persistence, RAG, and Longitudinal Context

### Product

- [ ] sessions can be stored and retrieved
- [ ] recurring frames can be surfaced without becoming evaluative labels
- [ ] Impact Cycle and programme phase are tracked separately

### Data and Privacy

- [ ] observation records include `source`, `observer_role`, and `instrument`
- [ ] self, peer, coach, and trainer-coded data remain separate
- [ ] variable cadence does not create false missing-data warnings
- [ ] RAG output includes source metadata for coach review

### Engineering

- [ ] database migrations run cleanly
- [ ] pgvector setup is repeatable
- [ ] document ingestion is idempotent
- [ ] RAG retrieval tests cover source metadata

---

## 4. P2 Gates â€” Voice and Teacher Surface

### Product

- [ ] coach voice mode supports coaching-supervisor questions
- [ ] teacher can enter reflection data
- [ ] teacher can view only their permitted data

### Data and Privacy

- [ ] teacher APIs cannot access coach notes
- [ ] teacher UI cannot display AI outputs derived from coach-only material
- [ ] voice transcripts are handled according to retention settings

### Engineering

- [ ] Deepgram keys are environment variables only
- [ ] voice requests fail safely if keys are missing
- [ ] permission tests cover teacher/coach separation

---

## 5. P3 Gates â€” M&E and Reporting

### Product

- [ ] reports are useful for programme monitoring
- [ ] reports do not undermine coaching confidentiality

### Data and Privacy

- [ ] exports are anonymised where required
- [ ] no blended score combines teacher self-assessment with coach/peer/trainer observations
- [ ] source labels remain visible in exports

### Engineering

- [ ] export tests verify anonymisation
- [ ] reporting queries are reviewed for data leakage

---

## 6. Prompt Quality Gates

LLM outputs must:

- [ ] avoid judgemental or evaluative language
- [ ] distinguish observation evidence from interpretation
- [ ] generate questions that support double-loop reflection
- [ ] pair abstract reflection with practical classroom moves
- [ ] map strategies to strategy-bank entries where possible
- [ ] flag uncertainty rather than inventing evidence
- [ ] preserve the coach's ability to choose how strongly to challenge the teacher
