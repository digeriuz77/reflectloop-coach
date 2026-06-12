# ReflectLoop Coach — Repository Overview

## What This Application Does

ReflectLoop Coach is a coach-only AI-assisted preparation tool for instructional coaches working with teachers in an 8-month STEM programme. It synthesises coach notes, teacher reflections, lesson observations, and session history into actionable coaching prompts: a GROW conversation guide, double-loop (Socratic) questions, evidence-grounded classroom strategies, and anticipated teacher responses with gentle bridge prompts.

**Key product principle:** The output is for the coach alone. Calibration signals are internal coaching aids, not teacher-facing ratings or scores. Teacher inputs may inform the analysis, but coach notes and AI synthesis remain coach-only.

---

## Repository Structure

```
reflectloop-coach/
├── backend/               # FastAPI Python backend
│   ├── app/
│   │   ├── api/           # FastAPI route definitions
│   │   ├── core/          # Auth, config, logging
│   │   ├── models/        # Pydantic request/response schemas
│   │   ├── prompts/       # LLM prompt templates
│   │   └── services/      # Business logic and external integrations
│   │       └── llm/       # LLM client abstraction layer
│   ├── pyproject.toml
│   └── railway.toml
├── frontend/              # Vite + React TypeScript frontend
│   ├── src/
│   │   ├── api/           # Frontend API client
│   │   ├── components/    # React UI components
│   │   └── types/         # Shared TypeScript interfaces
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── docs/                  # Development documentation
└── .env.example
```

---

## Core Architecture

### Backend (Python/FastAPI)

**Entry point:** `backend/app/main.py` (or via `app/` direct import)

**API endpoint:** `POST /api/coach-prep/generate`

The FastAPI app receives a `CoachPrepGenerateRequest`, renders an LLM prompt from a template, calls the LLM via a provider-agnostic client abstraction, validates the structured output, and returns a `CoachPrepOutput`.

**Key modules:**

| File | Purpose |
|---|---|
| `app/models/coach_prep.py` | Pydantic schemas for all request/response types |
| `app/prompts/coach_prep.md` | LLM prompt template (the AI "builder" instructions) |
| `app/services/coach_prep_service.py` | Orchestrates prompt rendering and LLM call |
| `app/services/strategy_bank.py` | Loads and summarises the strategy bank JSON |
| `app/services/coaching_rubrics.py` | Loads and summarises the coaching rubrics JSON |
| `app/services/llm/base.py` | Abstract LLM client interface |
| `app/services/llm/factory.py` | Factory to build the configured LLM client |
| `app/services/llm/fireworks.py` | Fireworks.ai implementation of the LLM client |
| `app/api/coach_prep.py` | FastAPI route definition |
| `app/core/config.py` | Pydantic-settings for environment variables |
| `app/core/auth.py` | Coach access token middleware |

**LLM configuration** (environment variables):
- `LLM_PROVIDER=fireworks` (default)
- `LLM_MODEL=accounts/fireworks/models/qwen3p6-plus` (default)
- `FIREWORKS_API_KEY`
- `COACH_ACCESS_TOKEN` (shared token for non-local deployments)

**Strategy validation:** After the LLM returns output, the service validates that every `strategy_id` in `grounded_strategies` exists in the strategy bank. Invalid IDs raise a 502 error.

### Frontend (React/TypeScript/Vite)

**Entry point:** `frontend/src/main.tsx` → `frontend/src/App.tsx`

The single-page app presents a two-column layout: an input form on the left, output cards on the right.

**Key components:**

| Component | Purpose |
|---|---|
| `CoachPrepForm.tsx` | Collects session inputs (teacher reflection, lesson notes, coach notes, session history CSV upload, session context, calibration signals) |
| `CalibrationSection.tsx` | Accordion of 10 coach-facing calibration questions (implementation, adaptation, ownership, risk, evidence, student outcomes, engagement, resistance, dialogic patterns, reflective depth) |
| `OutputCards.tsx` | Displays the AI response across two tabs: "GROW Coaching Plan" and "Background Analysis". Includes clipboard copy, print-to-PDF, and a print-export view. |
| `Field.tsx` | Reusable label/input/textarea wrapper |
| `App.tsx` | Root component, manages loading/error state, calls the API |

**API client (`frontend/src/api/coachPrep.ts`):**
- `generateCoachPrep(request, coachAccessToken)` → `CoachPrepOutput`
- Bearer token sent when `coachAccessToken` is set
- Empty strings and undefined values are stripped before sending

**TypeScript types** (`frontend/src/types/coachPrep.ts`): Mirror the Pydantic backend schemas exactly.

---

## Key Data Flows

### Coach Prep Generation Flow

```
Coach types inputs in frontend
    ↓
Frontend calls POST /api/coach-prep/generate (CoachPrepGenerateRequest)
    ↓
FastAPI route validates request + checks COACH_ACCESS_TOKEN
    ↓
CoachPrepService.generate():
    1. Load coach_prep.md prompt template
    2. Render placeholders with session_context, session_history,
       teacher_reflection, lesson_or_context_notes, coach_notes,
       strategy_bank_summary, coaching_rubrics_summary
    3. Call LLM via provider interface with structured output schema
    4. Validate that all strategy_ids in output exist in strategy_bank.json
    5. Return CoachPrepOutput
    ↓
Frontend receives CoachPrepOutput, renders OutputCards
```

### Calibration Signals Flow

```
Coach selects calibration signals in CalibrationSection
    ↓
Signal values stored in session_context.coach_calibration
    ↓
Included in API request as JSON
    ↓
Rendered into LLM prompt as structured session_context
    ↓
LLM uses calibration to:
    - Adjust challenge level for double-loop questions
    - Select appropriate GROW phrasing
    - Flag coach-facing confidence concerns
    - Influence strategy recommendation rationale
    ↓
Output is coach-only; signals never surface in teacher-facing contexts
```

---

## Strategy Bank and Rubrics

### Strategy Bank (`backend/app/services/strategy_bank.json`)

A curated JSON file containing ~50 classroom coaching strategies. Each entry includes:

- `strategy_id` — unique identifier used in AI output validation
- `title`, `summary`, `focus_areas`
- `teacher_move`, `student_move`
- `coach_use_when` — conditions under which the strategy is appropriate
- `alexander_mapping` — links to discourse capacities and uptake moves
- `look_fors` — what to observe (response uptake, wait time)
- `jim_knight_big_four` — checks for understanding
- `hits_multiple_exposures` — vocabulary exposure pattern
- `implementation_steps`, `observable_indicators`, `cautions`

The prompt instructs the LLM to recommend strategies only from this bank and to reference `strategy_id` values exactly.

### Coaching Rubrics (`backend/app/services/coaching_rubrics.json`)

Contains:
- 10 calibration questions (matching the frontend CalibrationSection) with labelled options
- Named rubrics (e.g., dialogic participation, reflective depth) with levels, descriptions, and coaching implications

The rubrics are summarised into the prompt to help the LLM calibrate challenge level without producing teacher ratings.

---

## Coach Prep Output Schema

The `CoachPrepOutput` consists of:

| Field | Description |
|---|---|
| `session_synthesis` | AI summary of the session; evidence notes; key uncertainties |
| `dominant_frame` | The teacher's underlying mental model; supporting evidence; confidence level |
| `reframe_suggestion` | A reframe for defensive/completion-focused mindsets; gentle/moderate/direct challenge options |
| `double_loop_questions` | 3–5 Socratic questions at gentle/moderate/direct levels targeting underlying assumptions |
| `grounded_strategies` | Up to 3 strategies from the strategy bank with rationale and coach bridge text |
| `anticipated_teacher_responses` | 2–4 likely teacher barriers with underlying concerns and coach prompts |
| `grow_conversation_guide` | GROW-structured prompts: Goal, Reality, Options, Will |
| `coach_confidence_flags` | Warnings about limited evidence or conflicting signals |

---

## Confidentiality Architecture

- **Coach-only P0 surface:** All output is for the coach. No teacher-facing UI in P0.
- **One-way data flow:** Teacher inputs may inform coach analysis; coach notes/AI synthesis never flow to teacher-facing APIs.
- **Calibration signals are internal:** They are evidence prompts, not ratings. The prompt explicitly forbids treating them as scores or appraisals.
- **Coach access token:** Protects the API in non-local deployments. Not a full multi-user auth system (deferred).
- **No sensitive payload logging:** LLM payloads, teacher reflections, and coach notes are never logged.

---

## Refined Design Principles (per recent decisions)

### 1. Repertoire as Strategy Bank (not coach instructions)

The strategy bank acts as a menu of high-leverage moves. The AI acts as a "Filter and Matchmaker" — it analyses `teacher_reflection` and `coach_notes` to surface which moves from `strategy_bank.json` are most appropriate for the current teacher context. The AI suggests: "Given this teacher is reverting to early volunteers, this is a perfect time to suggest [Strategy X]."

### 2. Evidence-Based Challenging via Double-Loop Questions

`double_loop_questions` are fed specifically by contradictions found in coach notes. The logic: if the teacher says "I prioritise student talk" but coach notes say "Teacher dominated the first 15 minutes", the AI generates a gentle double-loop question like: "I'm curious about the first 15 minutes of the lesson — how did the balance of talk there support your goal of increasing student reasoning?"

### 3. Longitudinal Memory (Coach-Managed History)

The coach passes session history into the `session_history` field. The AI looks at `ai_coach_next_step` from previous sessions for continuity. The prompt explicitly instructs the AI to check for goal drift.

### 4. GROW/MI Hybrid

GROW conversation prompts are framed using Motivational Interviewing (MI) phrasing. Instead of directives like "Tell the teacher to do X", the AI generates MI-based GROW reflections: "What would be the benefit to the students if we tried [Talk Move X] during the textbook phase, and what do you anticipate the teacher might say is the biggest barrier to trying that?"

The `options` and `will` phases of GROW are specifically instructed to use MI open-ended question formats.

---

## Development and Build

### Running Locally

**Backend:**
```bash
cd backend
pip install -e .
fastapi dev app/main.py
# Or: uvicorn app:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Environment variables** (copy `.env.example` to `.env`):
- Backend: `FIREWORKS_API_KEY`, `COACH_ACCESS_TOKEN` (non-local), `LLM_*` settings
- Frontend: `VITE_API_BASE_URL` (defaults to relative path)

### Tests

Backend tests are in `backend/tests/`. Run with `pytest` or `python -m pytest`.

### Deployment

Two separate Railway services:
1. Backend rooted at `backend/` (FastAPI on Railway)
2. Frontend rooted at `frontend/` (static hosting)

CORS must be configured to allow the frontend origin.
