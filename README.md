# 🐝 BeeHive — Productivity Dashboard

> Gamified productivity dashboard with Pomodoro, Kanban, XP quests and user authentication.

[![Tests](https://img.shields.io/badge/tests-264%20passed-brightgreen)]()
[![Observatory](https://img.shields.io/badge/Mozilla%20Observatory-A%2B-brightgreen)]()
[![CI](https://github.com/Josmaryppirelag17/Dashboard-Bee/actions/workflows/test.yml/badge.svg)](https://github.com/Josmaryppirelag17/Dashboard-Bee/actions/workflows/test.yml)
[![Deploy](https://github.com/Josmaryppirelag17/Dashboard-Bee/actions/workflows/deploy.yml/badge.svg)](https://github.com/Josmaryppirelag17/Dashboard-Bee/actions/workflows/deploy.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Josmaryppirelag17_Dashboard-Bee&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Josmaryppirelag17_Dashboard-Bee)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Josmaryppirelag17_Dashboard-Bee&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Josmaryppirelag17_Dashboard-Bee)

![OG Image](public/og-image.svg)

---

## 📊 Quality Audits

| Category           | Score (Desktop) | Score (Mobile) | Tool                |
| ------------------ | --------------- | -------------- | ------------------- |
| **Performance**    | 100/100         | 96/100         | PageSpeed Insights  |
| **Accessibility**  | 93/100          | 93/100         | PageSpeed Insights  |
| **Best Practices** | 96/100          | 96/100         | PageSpeed Insights  |
| **SEO**            | 100/100         | 100/100        | PageSpeed Insights  |
| **Security**       | A+ 🏆           | A+ 🏆          | Mozilla Observatory |

> ✅ **Mozilla Observatory**: A+ (10/10 tests passed) — nonce-based CSP.

> 🔗 [Mozilla Observatory report](https://observatory.mozilla.org/analyze/dashboard.josmarypirela.dev)

---

## 🎯 Core Web Vitals (Production - PageSpeed Insights)

### Desktop

| Metric                       | Value | Rating  |
| ---------------------------- | ----- | ------- |
| **First Contentful Paint**   | 0.3 s | ✅ Good |
| **Largest Contentful Paint** | 0.6 s | ✅ Good |
| **Total Blocking Time**      | 30 ms | ✅ Good |
| **Cumulative Layout Shift**  | 0.01  | ✅ Good |
| **Speed Index**              | 0.8 s | ✅ Good |

### Mobile

| Metric                       | Value | Rating  |
| ---------------------------- | ----- | ------- |
| **First Contentful Paint**   | 1.2 s | ✅ Good |
| **Largest Contentful Paint** | 2.6 s | ✅ Good |
| **Total Blocking Time**      | 0 ms  | ✅ Good |
| **Cumulative Layout Shift**  | 0     | ✅ Good |
| **Speed Index**              | 3.1 s | ✅ Good |

> 🔗 [PageSpeed Insights report](https://pagespeed.web.dev/analysis/https-dashboard-josmarypirela-dev/ky8q0qtcyh?form_factor=desktop)

---

## ✨ Features

| Feature               | Description                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------ |
| **Pomodoro Timer**    | Configurable timer with active task selector and completion confirmation                   |
| **Kanban Board**      | Task management with drag & drop (To do → In progress → Done)                              |
| **Gamification**      | XP from claimable quests with level-based ranking system                                   |
| **Weekly statistics** | SVG charts of focus time and daily efficiency                                              |
| **CSV Import/Export** | Backup and restore tasks in CSV format (with E2E + unit tests)                                |
| **Authentication**    | Registration, login, forgot/reset password with bcryptjs, httpOnly cookies and DB sessions (E2E tested) |
| **i18n**              | Spanish and English with hot-switching (includes auth forms)                               |
| **Onboarding Tour**   | 7-step interactive tour (ES/EN) for new users (89.64% coverage, 12 tests)                  |
| **Markdown Notes**    | Per-task Markdown note editor with preview (lazy-loaded)                                   |

---

## 🚀 Tech Stack

| Layer                 | Technology                                        |
| --------------------- | ------------------------------------------------- |
| **Framework**         | Next.js 15 (App Router)                           |
| **UI**                | React 19 + Tailwind CSS 4 + Motion                |
| **State**             | Zustand (global store)                            |
| **Local persistence** | IndexedDB via Dexie.js                            |
| **Cloud persistence** | Neon (PostgreSQL) + Drizzle ORM (with auth)       |
| **Authentication**    | bcryptjs + httpOnly cookies + DB sessions         |
| **Drag & Drop**       | @dnd-kit                                          |
| **Forms**             | react-hook-form + Zod                             |
| **Logger**            | Context-scoped structured Logger                  |
| **Typography**        | Inter (self-hosted via next/font)                 |
| **Tests**             | Vitest (unit) + Playwright (e2e)                  |
| **Monitoring**        | Sentry (error tracking + performance)             |
| **Orchestration**     | Turborepo                                         |
| **Quality**           | SonarQube + TypeScript strict + ESLint + Prettier |

---

## 🛠️ Scripts

| Command             | Description                                 |
| ------------------- | ------------------------------------------- |
| `pnpm dev`          | Start development server (Turborepo)        |
| `pnpm build`        | Build for production (Turborepo with cache) |
| `pnpm test`         | Unit + API tests with coverage (264 tests)  |
| `pnpm test:e2e`     | End-to-end tests with Playwright            |
| `pnpm typecheck`    | TypeScript type checking                    |
| `pnpm lint`         | ESLint (flat config, no circular ref)       |
| `pnpm preflight`    | typecheck + lint + test (CI ready)          |
| `pnpm format`       | Format code with Prettier                   |
| `pnpm format:check` | Check formatting with Prettier              |
| `pnpm start`        | Start production server (Next.js)           |
| `pnpm test:watch`   | Tests in watch mode (Vitest)                |

---

## 🧪 Tests

```bash
pnpm test        # Unit + API + integration (Vitest) — 264 tests, 25 suites
pnpm test:e2e    # E2E (Playwright: auth, tasks, focus, full-flow, reset-password, import-export)
pnpm preflight   # typecheck + lint + test (CI pipeline)
```

---

## 📁 Architecture

```
src/
├── components/     # Atomic Design
│   ├── atoms/      # Badge, HexButton, PollenIndicator, ProgressHex
│   ├── molecules/  # TaskCard (compound component)
│   └── organisms/  # FocusTimer, TaskBoard, Sidebar, StatsChart, etc.
├── hooks/          # useTasks, useBeeStats, useSessionTracker, etc.
├── store/          # Zustand store (useHiveStore)
├── context/        # BeeToastProvider (notifications)
├── lib/            # Dexie DB, logger, analytics, sanitize
├── utils/          # CSV export/import, translations, sanitize
└── types/          # Shared types
```

---

## 🚦 CI/CD

### GitHub Actions (`.github/workflows/test.yml` + `.github/workflows/deploy.yml`)

| Job                | Commands                                   | Artifacts (only on failure) |
| ------------------ | ------------------------------------------ | --------------------------- |
| **quality**        | `typecheck` → `lint` → `test`              | `coverage/`                 |
| **e2e**            | `playwright install chromium` → `test:e2e` | `playwright-report/`        |
| **deploy-staging** | Build + Vercel Preview (branch `develop`)  | —                           |
| **deploy-prod**    | Build + Vercel Production (branch `main`)  | —                           |
| **rollback**       | Manual rollback via `workflow_dispatch`    | —                           |

- `pnpm preflight` for pre-push hook
- **Concurrency**: auto-cancel-in-progress per branch (`concurrency.group`)
- **Staging**: auto-deploy from `develop` to Vercel Preview (`amondnet/vercel-action@v25`)
- **Production**: auto-deploy from `main` to Vercel Production (`--prod --prebuilt`)
- **Rollback**: manual via GitHub Actions (`workflow_dispatch` with `--prod --force`)

---

## 🔐 Authentication

BeeHive allows users to register and login to preserve their data across sessions. Without authentication, data is stored locally (IndexedDB) and lost when closing the browser.

| Feature                 | Detail                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| **Registration**        | Name, Last Name, Username, Email, Password + Confirmation                                                |
| **Validations**         | Unique email, Unique username (alphanumeric regex), password: 8+ chars, 1 uppercase, 1 number, 1 special |
| **Password checker**    | Real-time dynamic checklist with [✓]/[ ] during registration; submit disabled if requirements not met    |
| **Forgot password**     | "Forgot password?" link in login → `/auth/forgot-password` page (bee theme)                              |
| **Reset**               | API generates token (1h expiration), `/auth/reset-password/[token]` page for new password                |
| **Reset security**      | All active sessions are invalidated on password reset                                                    |
| **Security**            | bcryptjs (12 rounds), httpOnly cookies, sessions with 7-day expiration                                   |
| **Login**               | By email or username                                                                                     |
| **Rate limiting**       | Login 5/15min, Register 5/min, Forgot password 3/min (per IP)                                            |
| **Password validation** | Shared regex in `src/lib/password-validation.ts` (Zod + server-side + client-side widget)                |
| **i18n**                | Auth forms and reset pages in Spanish and English                                                        |
| **UX**                  | "Sign In" button always visible in sidebar, logout with icon                                             |

---

## 📝 Logger

Structured logger with levels (`debug`, `info`, `warn`, `error`) — silenced in production.

---

## 🏗️ Turborepo

Configured with `turbo.json` for cached and parallel task execution:

| Task        | Depends on              | Cache           |
| ----------- | ----------------------- | --------------- |
| `dev`       | —                       | ❌ (persistent) |
| `build`     | `^build`                | `.next/**`      |
| `lint`      | `^build`                | ❌              |
| `typecheck` | `^build`                | ❌              |
| `test`      | `build`                 | `coverage/**`   |
| `preflight` | typecheck + lint + test | ❌              |

Run with `pnpm turbo <task>` or directly `pnpm <task>` (PNPM runner).

---

## 🔐 Environment Variables

See `.env.example` for required variables.

---

## ♿ Accessibility

| Practice             | Implementation                                       |
| -------------------- | ---------------------------------------------------- |
| **Skip to content**  | Skip link to main content                            |
| **ARIA roles**       | Semantic roles (`region`, `progressbar`, `button`)   |
| **Role progressbar** | Pomodoro timer with `aria-valuenow` and visual state |
| **Focus management** | Visible focus and logical tab order                  |
| **Contrast**         | Sufficient contrast color palette                    |
| **Alternative text** | Decorative icons with `aria-hidden`                  |

---

## 📦 Quick Deploy

```bash
pnpm install && pnpm dev      # Development
pnpm build && pnpm start       # Production
```

## 🔗 Links

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://dashboard.josmarypirela.dev)
[![PageSpeed](https://img.shields.io/badge/PageSpeed-100/100-brightgreen)](https://pagespeed.web.dev/analysis/https-dashboard-josmarypirela-dev/ky8q0qtcyh?form_factor=desktop)
