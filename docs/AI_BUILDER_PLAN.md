# AI Builder Plan — ReflectLoop Coach Enhancements

> For use with an advanced autonomous AI builder.
> The builder is expected to read all referenced files, reason about the best implementation, and decide on the optimal approach. This plan defines the desired outcomes, not the implementation mechanics.

---

## System Overview

**What this app does:** ReflectLoop Coach is a coach-only AI-assisted preparation tool. A coach inputs teacher reflections, lesson observations, coach notes, and session history. The AI returns a structured coaching package: GROW conversation guide, double-loop (Socratic) questions, evidence-grounded classroom strategies, and anticipated teacher responses.

**Single hard rule:** The output is coach-only. No teacher-facing scores, ratings, labels, or appraisal language.

**Key files already in the codebase:**

| File | Role |
|---|---|
| `backend/app/prompts/coach_prep.md` | LLM prompt template — the AI builder's primary instruction set |
| `backend/app/models/coach_prep.py` | Pydantic request/response schemas |
| `backend/app/services/coach_prep_service.py` | Orchestrates prompt rendering and LLM call |
| `backend/app/services/strategy_bank.py` + `strategy_bank.json` | Strategy repertoire with `strategy_id` values the AI must use |
| `backend/app/services/coaching_rubrics.py` + `coaching_rubrics.json` | Internal coach calibration signals |
| `frontend/src/components/OutputCards.tsx` | Displays AI output in two tabs: GROW Coaching Plan / Background Analysis |
| `docs/talk-moves-reference.ts` | 14 concrete talk moves with teacher cues, classroom examples, and "what to avoid" |
| `docs/TalkMoveReferences.txt` | Pedagogical guidance on EAL adaptation, wait time (2–4 minutes in practice), macro/micro adaptations, dialogic teaching |
| `docs/rubrics.txt` | 4-level (Beginning / Developing / Embedding / Excelling) progression rubric across 12 domains |

---

## Goal

Sharpen the AI's output quality in four specific areas. The builder should implement all four fully, using the best approach they judge appropriate given the existing code structure.

---

## Enhancement 1 — Strategy Matching with Talk-Moves Integration

**Desired outcome:** When the AI recommends a strategy from `strategy_bank.json`, it should make the recommendation concrete and classroom-actionable by linking it to the corresponding talk move from `docs/talk-moves-reference.ts`.

**Why:** The strategy bank gives coaching-level rationale; the talk-moves file gives teacher-facing language, teacher cues, classroom examples, and "what to avoid." The coach needs both to have a productive coaching conversation.

**Specific behavioural requirements:**
- When a strategy maps to a talk move (many do — e.g., wait time strategies map to `TM-T01`), the `suggested_coach_bridge` should include the talk move's **teacherCue** and a **classroomExample** from that file.
- Wait time must be contextualised for STEM/EAL contexts: 2–4 minutes, not generic "3–5 seconds." The AI should note that modelling the thinking process ("Take some time to think. No hands yet") is part of the move.
- The `comboMultiplier` chain logic from talk-moves-reference.ts should inform the `rationale` — e.g., when recommending Wait Time, note that it is most effective before Turn and Talk.
- Do not fabricate talk move IDs or details. Only reference what exists in `talk-moves-reference.ts`.

**Files involved:**
- `backend/app/prompts/coach_prep.md` — add strategy grounding refinement
- `docs/talk-moves-reference.ts` — source of truth for talk move data
- `backend/app/services/strategy_bank.py` — consider adding a talk-moves summary renderer (builder's choice)

**Validation:** Every grounded strategy with a talk-move match should have a `suggested_coach_bridge` containing a real teacher cue and a real classroom example from the talk-moves file. If no matching talk move exists, the bridge should still be concrete and classroom-actionable.

---

## Enhancement 2 — Evidence-Based Double-Loop Questions from Contradictions

**Desired outcome:** Double-loop questions must be generated specifically from the contradictions between what the coach observed (`lesson_or_context_notes`) and what the teacher said (`teacher_reflection`).

**Why:** Coach notes contain "discoveries" about the gap between the teacher's self-perception and the classroom reality. Double-loop questions are most powerful when they surface these gaps gently, without confrontation.

**Specific behavioural requirements:**
- Explicitly cross-check `lesson_or_context_notes` against `teacher_reflection`.
- Where a contradiction exists, generate a double-loop question that surfaces the gap without naming it as a failure.
- Use talk move concepts as the scaffolding for questions where appropriate (e.g., framing a challenge around the Wait Time move when the contradiction is about think-time).
- Generate a question for every clear contradiction found. If no clear contradiction exists, generate questions that probe the stated claim against the evidence that does exist.
- Challenge levels (gentle / moderate / direct) should reflect the severity of the contradiction. At least one question must be gentle so the coach can choose the intensity.

**Example of the desired output:**
- Teacher says: "I give students enough time to think."
- Coach notes say: "Teacher dominated first 15 minutes; wait time under 1 second throughout."
- Gentle double-loop question: "You mentioned students had time to think. I'm curious what that looked like in practice — when you posed a question, how long did you typically wait before calling on someone, and what did you notice about the quality of responses when you waited versus when you moved quickly?"

**Files involved:**
- `backend/app/prompts/coach_prep.md` — add explicit cross-check rule to double-loop question generation

**Validation:** Review the prompt's double-loop question generation instructions. Confirm it requires contradiction detection as a mandatory step, not a suggestion.

---

## Enhancement 3 — Longitudinal Continuity via ai_coach_next_step

**Desired outcome:** The AI should look at the most recent `session_history` row, extract `ai_coach_next_step`, and check whether the current session shows progress, drift, or abandonment of that previously identified step.

**Why:** The coach manages the longitudinal memory. The AI should serve as a continuity check, not just a one-shot session analyser. Goal drift is one of the most common coaching failure modes.

**Specific behavioural requirements:**
- Locate the most recent dated session history row (or the last row if dates are absent).
- Extract `ai_coach_next_step` from that row.
- In `session_synthesis`, include a brief continuity note: "Previous next step was [X]. Current evidence suggests [progress / drift / abandonment / insufficient data]."
- In `grow_conversation_guide` under the Reality or Will phases, surface the continuity finding: "You had identified [previous step] last session. How is that feeling now — have you had a chance to try it?"
- If `ai_coach_next_step` is absent or the session history is empty, note in `coach_confidence_flags` that continuity cannot be assessed.

**Files involved:**
- `backend/app/prompts/coach_prep.md` — add explicit session continuity rule

**Validation:** When session history containing a non-empty `ai_coach_next_step` is provided, the output must include a continuity finding in the synthesis and either the Reality or Will phase of GROW.

---

## Enhancement 4 — GROW/MI Hybrid in Options and Will Phases

**Desired outcome:** The Options and Will phases of the GROW conversation guide must use Motivational Interviewing (MI) phrasing — open-ended questions that explore possibility and barriers, not directives or commitment statements.

**Why:** MI-consistent phrasing preserves teacher agency, reduces defensiveness, and produces more genuine commitment than directives like "You should try X."

**Specific behavioural requirements:**
- Options phase must use MI-style exploratory questions, not strategy recommendation lists.
  - Bad: "Try Turn and Talk before whole-class discussion."
  - Good: "What might it look like to try having students rehearse in pairs before speaking during the textbook phase? What's the likelihood you'd be able to do that, and what might get in the way?"
- Will phase must use commitment-evoking curiosity, not commitment requests.
  - Bad: "Will you commit to using wait time in your next science lesson?"
  - Good: "On a scale of 1–10, how ready do you feel to try a 2-minute think time before your next question? What would need to be true for that to be a 7 or higher?"
- Reference the "Stay Neutral" and "Include Yourself" talk moves as the MI-style models in the coach's internal guidance (not in teacher-facing output).
- Do not mix MI phrasing with evaluative language (no "should", "need to", "must", "will you commit to").

**Files involved:**
- `backend/app/prompts/coach_prep.md` — add MI phrasing requirements to the grow_conversation_guide output section

**Validation:** Read the Options and Will phases from three different generated outputs. Neither should contain directive language. Both should contain open-ended exploratory questions framed around possibility and barriers.

---

## Additional Instruction — Rubrics.txt Usage

**How to use rubrics.txt:** It is the coach's internal calibration backbone, not teacher-facing language.

**What to do with it:**
- Use the 4-level framework internally to calibrate the coach's own confidence before a session. If evidence spans Beginning through Developing across different domains, the coach knows to keep the conversation concrete.
- The AI may use rubric language in `coach_confidence_flags` to describe evidence gaps: "Evidence covers questioning and lesson planning but not AfL or vocabulary instruction. Overall progress is difficult to calibrate with this coverage."
- The AI may use rubric reflective depth spectrum to calibrate double-loop question intensity — more concrete and evidence-linked for "Beginning" reflective depth, more assumption-testing for "Assumption-aware."

**What never to do with it:**
- Never surface a rubric level as a teacher label.
- Never generate output like "teacher is at Developing level" or "moving from Developing to Embedding."
- The word "Developing" appearing in an output is a signal that the rule has been broken.

**No code changes needed for rubrics.txt.** The rule is cultural and prompt-level.

---

## Validation Checklist

After implementing all four enhancements, verify:

- [ ] Every grounded strategy with a matching talk move has a `suggested_coach_bridge` containing a real teacher cue and classroom example from talk-moves-reference.ts
- [ ] Wait time recommendations reflect 2–4 minute durations appropriate for STEM/EAL contexts, not generic seconds
- [ ] Double-loop questions are demonstrably generated from specific contradictions between lesson_or_context_notes and teacher_reflection
- [ ] When session history contains `ai_coach_next_step`, the output includes a continuity finding in synthesis and GROW
- [ ] GROW Options and Will phases use MI open-ended question format — no directives, no "should/must/need to/commit to" language
- [ ] Rubric levels never appear as teacher-facing labels in any output field
- [ ] All existing tests pass
- [ ] Strategy ID validation still passes — no invented strategy_ids
- [ ] Confidentiality architecture unchanged — coach-only output throughout

---

## Files Reference (for the builder to read before acting)

```
backend/app/prompts/coach_prep.md          ← primary target, all four enhancements
backend/app/models/coach_prep.py           ← understand output schema constraints
backend/app/services/coach_prep_service.py ← understand prompt rendering pipeline
backend/app/services/strategy_bank.py      ← understand strategy loading/summary
backend/app/services/strategy_bank.json    ← source of truth for strategy repertoire
docs/talk-moves-reference.ts               ← talk moves for Enhancement 1
docs/TalkMoveReferences.txt                ← context on wait time, EAL, dialogic teaching
docs/rubrics.txt                           ← reference only, no code changes needed
```
