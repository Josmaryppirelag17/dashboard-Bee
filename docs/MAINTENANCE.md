# Maintenance Guide

> Last updated: 2026-06-19

---

## Status

The project is in **Maintenance Mode**. No active development planned.

---

## Allowed

- Bug fixes
- Dependency updates
- Security patches (missing rate limits, account lockout)
- Move DSNs to runtime env vars

## Not allowed

- New features
- Redesigns
- Module rewrites
- BeeHive v2 within the same project

---

## Maintenance process

### 1. Local development

```bash
pnpm dev              # Local development
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint
pnpm test             # Unit + API tests
pnpm test:e2e         # E2E tests
pnpm preflight        # All together
```

### 2. Publishing changes

```bash
pnpm preflight
git add -A
git commit -m "type: description"
git push
```

The CI/CD pipeline auto-deploys to production (main) or staging (develop).

### 3. Post-deploy

- Verify at https://dashboard.josmarypirela.dev
- Check Sentry for new errors
- Test full flow: login → create task → pomodoro → kanban → export

---

## Stack

| Layer              | Technology                    |
| ------------------ | ----------------------------- |
| Framework          | Next.js 15                    |
| UI                 | React 19, Tailwind CSS 4      |
| State              | Zustand 5                     |
| Local persistence  | Dexie.js (IndexedDB)          |
| Drag & drop        | @dnd-kit                      |
| Database           | Neon PostgreSQL + Drizzle ORM |
| Authentication     | bcryptjs, httpOnly cookies    |
| Monitoring         | Sentry (client/server/edge)   |
| CI/CD              | GitHub Actions                |
| Hosting            | Vercel                        |
