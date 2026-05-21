# ReflectLoop Coach â€” Release Checklist

> Created: 2026-05-21
> Purpose: Checklist for local milestones and Railway releases.

---

## 1. Pre-Release Checks

- [ ] active phase and release scope confirmed
- [ ] `BUILD_TRACKER.md` reflects current status
- [ ] relevant decisions recorded in `DECISION_LOG.md`
- [ ] quality gates reviewed in `QUALITY_GATES.md`
- [ ] no secrets committed
- [ ] no sensitive teacher or coach data committed
- [ ] `.env.example` is current and contains placeholders only

---

## 2. Local Validation

### Backend

- [ ] dependencies install cleanly
- [ ] FastAPI app starts locally
- [ ] backend tests pass
- [ ] database migrations run cleanly, once migrations exist
- [ ] logs do not include sensitive input payloads

### Frontend

- [ ] dependencies install cleanly
- [ ] frontend app starts locally
- [ ] lint/build passes
- [ ] coach dashboard smoke test passes

### End-to-End Smoke Test

- [ ] paste sample teacher reflection
- [ ] paste sample observation notes
- [ ] paste sample coach notes
- [ ] generate output
- [ ] confirm synthesis, questions, strategies, and GROW guide appear
- [ ] confirm no teacher-facing output is generated during P0

---

## 3. Railway Deployment Checks

- [ ] Railway project selected
- [ ] backend service configured
- [ ] frontend service configured
- [ ] PostgreSQL provisioned when required
- [ ] required environment variables configured in Railway
- [ ] migrations executed when required
- [ ] deployed URLs open successfully
- [ ] health check endpoint responds
- [ ] sample coach-prep request succeeds

---

## 4. Rollback Notes

Before production-like use:

- [ ] identify previous working deployment
- [ ] document rollback command or Railway UI step
- [ ] confirm database migration rollback approach

---

## 5. Post-Release

- [ ] update `BUILD_TRACKER.md`
- [ ] record any incidents or unexpected behaviours
- [ ] add follow-up tasks for known gaps
- [ ] archive representative test outputs if they contain no sensitive data
