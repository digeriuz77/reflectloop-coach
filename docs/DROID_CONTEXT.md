# ReflectLoop Coach — Droid Context File

> Created: 2026-05-21
> Purpose: Persistent reference for all architecture, programme context, and design decisions.

---

## 1. Programme Context

### 1.1 Programme Structure
- **Duration:** 8-month STEM programme
- **Phase Rhythm:** Foundation → First Cycles → Deepening → Sustainability (2 months per phase)
- **Assessment Points:** Baseline (Month 1), Midpoint (Month 4), Endpoint (Month 8)

### 1.2 Nested Cycle Rhythms (must be tracked separately)

| Cycle Type | Frequency | Duration | Data Capture |
|---|---|---|---|
| Individual coaching session | Weekly (dialogic embedding) or fortnightly (Phase 4) | 30 min | Post-session coach notes; teacher reflection entry |
| Impact Cycle (Identify → Learn → Improve) | ~4–6 weeks | Full cycle; 3–5 sessions | SMART goal; mid-cycle data review; goal completion |
| Programme phase | Bi-monthly | 2 months | Phase milestone checklist; M&E monitoring spiral |
| Baseline–Midpoint–Endpoint | Month 1, 4, 8 | Survey event | Self-assessment instrument |

**Critical:** Variable session cadence must not be treated as missing data. Weekly (dialogic embedding) and fortnightly (Phase 4) can run simultaneously for the same teacher-coach pair.

### 1.3 Observation Roles (Deferred Beyond P0)

| Source | Objectivity | Frequency | Notes |
|---|---|---|---|
| Coach-observed | Highest | Lowest | Trainer shadows trainee; four Look-Fors (question type, wait time, response/uptake, student-to-student talk) |
| Peer-observed | Medium | Planned (Week 3–4 dialogic embedding) | Colleague using same structured lens; NOT the coach |
| Teacher self-observed (video) | Lowest | Highest | 2–3 min clips; teacher watches independently; baseline/midpoint/endpoint self-assessment |

**P0 Design Update:** The coach-prep MVP does not create formal observation records. It uses an optional free-form `lesson_or_context_notes` field because observation details may already be embedded in coach notes. Formal source-tracked observation records are deferred until P1/P3 M&E features.

**Future Architecture Rule:** When the app later creates formal observation records, every observation record must store `source`, `observer_role`, and `instrument`. Never collapse into a single score — this corrupts triangulation and M&E credibility.

### 1.4 Confidentiality Architecture
- Coaching data is confidential per signed MOU.
- Leadership guide instructs principals not to ask coaches what teachers said.
- Teacher self-assessment returned to teacher and coach only.
- **Dual-surface rule:** Coach inputs (notes, coded observations, evaluations) must NEVER flow to teacher-facing UI. One-way data flow only: teacher inputs → both surfaces; coach inputs → coach surface only.

---

## 2. Pedagogical Frameworks

The strategy bank is multi-framework. Strategies must be tagged by framework, domain, and experience target.

### 2.0 Pilot Instructional Priorities

The coaching pilot must prioritise strategies that help teachers move beyond textbook delivery while remaining realistic for underperforming EAL learners. The strategy bank should be strong enough to provide nuance across:

- **Dialogic teaching for English oracy:** structured student talk, uptake moves, wait time, peer build/challenge, and academic sentence rehearsal.
- **Vocabulary practice and vocabulary teaching:** explicit word selection, student-friendly definitions, morphology/word parts, multiple exposures, oral rehearsal, and vocabulary retrieval.
- **Assessment for learning:** frequent diagnostic checks during the lesson, mini-plenaries, stop-and-check moments, response cards/mini-whiteboards, feedback loops, and next-step grouping.
- **Textbook adaptation:** practical ways to adapt textbook pages so they become planned learning sequences rather than passive exercise completion.
- **EAL access:** strategies should reduce language barriers without reducing cognitive demand.

| Framework | Role | Key Strategies |
|---|---|---|
| **Jim Knight — Big Four / Impact Cycle** | Primary coaching methodology | Guiding questions, learning maps, checks for understanding, thinking prompts, effective questions, cooperative learning, reinforcing praise, fluent corrections |
| **HITS (Hattie-derived)** | Continuum rubric (Emerging → Evolving → Embedding → Excelling) | Setting Goals, Structuring Lessons, Explicit Teaching, Worked Examples, Collaborative Learning, Multiple Exposures, Questioning, Feedback, Metacognitive Strategies, Differentiated Teaching |
| **Alexander's Dialogic Principles** | Primary content of PD Cycle 1; most behaviourally specific | 5 discourse capacities: questioning, building, challenging, hedging, connecting. 4 uptake moves: revoice, probe, redirect, connect. Principles: collective, reciprocal, supportive, cumulative, purposeful. |
| **Motivational Interviewing / OARS** | Coaching conversation methodology (not classroom strategy) | Open questions, Affirmations, Reflections, Summaries; change talk; sustain talk; evoking; planning |
| **5E STEM Model** | Lesson structure framework | Engage, Explore, Explain, Elaborate, Evaluate |
| **TLAC** | Referenced but not foregrounded | Circulate, Standardize the Format, Strong Start, Culture of Error |

**Priority for first build:** Anchor strategy bank on Alexander's five discourse capacities + four uptake moves, and the four Look-Fors from the leader observation tool. These are already operationalised at a codeable level of specificity.

---

## 3. App Architecture

### 3.0 P0 Input Simplification

The P0 coach-prep endpoint should stay lightweight:

- `teacher_reflection` — optional text
- `lesson_or_context_notes` — optional free-form notes; may include observation details but is not a formal observation record
- `coach_notes` — optional text
- `session_context.coach_calibration` — optional internal evidence signals selected through concrete this-or-that prompts about implementation, adaptation, ownership, artifacts, student evidence, engagement stance, resistance context, classroom talk pattern, and reflective depth

At least one text input is required. Calibration signals are internal coach aids only and must never be surfaced as teacher-facing scores, labels, or appraisals. The app should avoid asking coaches to enter direct numerical progress/stuckness ratings in P0 because those can overstate subjective impressions.

### 3.1 High-Level Flow
```
Raw Inputs (Text)
  → Ingestion & Parsing Layer
    → Schön Reflection Engine (Double-Loop Analysis)
      → Strategy Grounding Layer (Practical Classroom Translation)
        → GROW/Impact Cycle Formatter
          → Coach-Facing Output Dashboard
```

### 3.2 Dual-Surface Data Flow
```
┌─────────────────┐     ┌──────────────────┐
│  TEACHER INPUTS │────→│  Teacher-Facing  │
│  (reflections,  │     │  Surface         │
│   self-assess,  │     │  (own data only) │
│   video notes)  │     └──────────────────┘
└─────────────────┘              │
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Coach-Facing    │
                        │  Analytical Layer│
                        │  (AI + RAG)      │
                        └──────────────────┘
                                 ▲
┌─────────────────┐              │
│  COACH INPUTS   │──────────────┘
│  (notes, obs,   │    [ONE-WAY ONLY]
│   coded data)   │
└─────────────────┘
```

### 3.3 Core Components

| Component | Purpose | Key Design Decisions |
|---|---|---|
| **Input Layer** | Accept teacher reflections, observation notes, coach notes | Free-form text; document upload (PDF/Word); optional tagging. Lightweight, no heavy forms. |
| **Ingestion & Parsing** | Extract text, entities, themes, tone | Identify recurring topics, emotional tone, stated vs. unstated assumptions |
| **Schön Reflection Engine** | Double-loop analysis + question generation | 3-5 Socratic questions; surface dominant frame; suggest reframe; distinguish reflection-on-action vs. reflection-in-action |
| **Strategy Grounding Layer** | Match surfaced assumptions to concrete strategies | Pull from tagged strategy bank; filter by implementability; ensure GROW-alignment |
| **GROW / Impact Cycle Formatter** | Structure output for coach conversation | Goal (with refinements) → Reality (synthesis + gaps) → Options (2-3 strategies with rationale) → Will (small commitment + reflection prompt) |
| **RAG Pipeline** | Ingest programme documents for grounding | Google Drive → parse → chunk → embed → pgvector → retrieve at runtime |
| **Voice AI Support** | Live coach supervision via voice | Deepgram STT (Nova-2) + LLM + TTS (Aura); coaching-on-coaching guidance |

### 3.4 Output Structure (Coach Dashboard)

1. **Synthesis Card** — readable summary of all inputs
2. **Double-Loop Question Set** — 3-5 Schön-style questions, marked by mode
3. **Grounded Strategy Shortlist** — 2-3 strategies with framework tags, implementation level, rationale
4. **GROW Conversation Guide** — suggested flow for the coach
5. **Next Session Seed** — reflection prompt or observation focus for next meeting
6. **Longitudinal Panel** — recurring frames, cycle progress, programme phase indicator

### 3.5 Voice Interaction Mode
- **STT:** Deepgram Nova-2 (streaming, low latency)
- **LLM:** Same backend, conversational system prompt variant
- **TTS:** Deepgram Aura (calm, non-judgmental tone)
- **Use case:** "How do I introduce this reframe without triggering defensiveness?"

---

## 4. Technology Stack (Railway-Deployable)

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | Next.js (React) or React + Vite | Railway-native, simple deploy |
| **Backend** | FastAPI (Python) | Excellent for LLM/RAG pipelines |
| **Database** | PostgreSQL (Railway add-on) | Native pgvector support |
| **LLM API** | OpenAI API or Anthropic Claude API | Simplest integration; consider OpenRouter for fallback |
| **Embeddings** | OpenAI `text-embedding-3-small` or `-large` | Cheap, high quality |
| **Voice (STT/TTS)** | Deepgram (Nova-2 / Aura) | Low latency, good pricing, excellent API |
| **Document Sync** | Google Drive API (read-only service account) | Poll or webhook for programme materials |
| **Auth** | Clerk or simple JWT | Clerk easiest for multi-role (coach/teacher/admin) |
| **File Storage** | Cloudflare R2 or S3 | If needed for uploads; prefer Google Drive for source docs |

---

## 5. MVP Priority Order

| Phase | Feature | Pain Points Addressed | Effort |
|---|---|---|---|
| **P0** | Basic coach dashboard: upload/paste inputs → generate synthesis + questions + strategies | Prep time, depth, strategy matching | Medium |
| **P0** | Strategy bank seeded with Alexander + HITS + Knight moves | Strategy matching | Medium |
| **P1** | Google Drive document ingestion + RAG | Depth, accuracy | Medium |
| **P1** | Longitudinal tracking (recurring frames, cycle progress) | Depth over time | Low |
| **P2** | Voice AI support (Deepgram STT/TTS) | Prep time, support | Medium |
| **P2** | Teacher-facing surface (reflection entry, goal view) | Programme fidelity | Low |
| **P3** | Peer observation source tracking + data quality labels | M&E rigour | Low |

---

## 6. Key Architectural Constraints (Never Violate)

1. **Confidentiality wall:** Coach inputs never exposed to teacher-facing surface.
2. **Source tracking:** Every observation record stores who generated it, in what role, using what instrument.
3. **Non-evaluative stance:** Coach observation notes are coaching tools, not fidelity measures. Coded conversation recordings (assessed by trainer) are the fidelity measure. Store and display separately.
4. **No score collapsing:** Never aggregate teacher self-reported scores with coach-coded observations into a single metric.
5. **Variable cadence tolerance:** Gaps in session frequency are not missing data points.

---

## 7. Open Decisions / Future Considerations

- [ ] Which LLM provider to standardise on (OpenAI vs. Claude vs. OpenRouter fallback)
- [ ] Whether to integrate with existing reflection app API or replicate its data
- [ ] Deepgram API key procurement and cost estimation
- [ ] Google Drive service account setup and folder structure
- [ ] Auth provider decision (Clerk vs. custom JWT for low user count)
- [ ] FERPA / data residency requirements for cloud storage
