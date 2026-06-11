# 🐝 BeeHive — Productivity Dashboard

> Gamified productivity dashboard with Pomodoro, Kanban, XP quests and user authentication.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/state-Zustand-orange)](https://zustand-demo.pmnd.rs)
[![Dexie](<https://img.shields.io/badge/db-IndexedDB%20(Dexie)-yellow>)](https://dexie.org)
[![Vitest](https://img.shields.io/badge/tests-Vitest%2BPlaywright-green)](https://vitest.dev)
[![Tests](https://img.shields.io/badge/tests-104%20passed-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/types-strict-blue)]()
[![ESLint](https://img.shields.io/badge/ESLint-flat%20config-purple)]()
[![Security](https://img.shields.io/badge/CSP-nonce%20based-brightgreen)]()
[![Auth](https://img.shields.io/badge/auth-Register%2FLogin%2FPassword--Reset-8B5CF6)]()
[![i18n](https://img.shields.io/badge/i18n-ES%2FEN-ff69b4)]()
[![Rate Limiting](https://img.shields.io/badge/rate%20limiting-5%2Fmin-orange)]()
[![Observatory](https://img.shields.io/badge/Mozilla%20Observatory-A%2B-brightgreen)]()
[![Sentry](https://img.shields.io/badge/monitoring-Sentry-362D59)](https://sentry.io)
[![Turborepo](https://img.shields.io/badge/monorepo-Turborepo-EF4444)]()
[![CI](https://github.com/Josmaryppirelag17/Dashboard-Bee/actions/workflows/test.yml/badge.svg)](https://github.com/Josmaryppirelag17/Dashboard-Bee/actions/workflows/test.yml)
[![Deploy](https://github.com/Josmaryppirelag17/Dashboard-Bee/actions/workflows/deploy.yml/badge.svg)](https://github.com/Josmaryppirelag17/Dashboard-Bee/actions/workflows/deploy.yml)
[![Accessibility](https://img.shields.io/badge/a11y-role%2Fprogressbar%2Fskip--to--content-brightgreen)]()
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Josmaryppirelag17_Dashboard-Bee&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Josmaryppirelag17_Dashboard-Bee)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Josmaryppirelag17_Dashboard-Bee&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Josmaryppirelag17_Dashboard-Bee)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Josmaryppirelag17_Dashboard-Bee&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Josmaryppirelag17_Dashboard-Bee)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Josmaryppirelag17_Dashboard-Bee&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Josmaryppirelag17_Dashboard-Bee)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=Josmaryppirelag17_Dashboard-Bee&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=Josmaryppirelag17_Dashboard-Bee)

![OG Image](public/og-image.svg)

---

## 📊 Quality Audits

| Category | Score (Desktop) | Score (Mobile) | Tool |
|---|---|---|---|
| **Performance** | 91/100 | 97/100 | PageSpeed Insights |
| **Accessibility** | 93/100 | 93/100 | PageSpeed Insights |
| **Best Practices** | 96/100 | 96/100 | PageSpeed Insights |
| **SEO** | 100/100 | 100/100 | PageSpeed Insights |
| **Security** | A+ 🏆 | A+ 🏆 | Mozilla Observatory |

> ✅ **Mozilla Observatory**: A+ (10/10 tests passed) — nonce-based CSP.
> 🔗 [Mozilla Observatory report](https://observatory.mozilla.org/analyze/dashboard.josmarypirela.dev)
> 🔗 [PageSpeed Insights report](https://pagespeed.web.dev/analysis/https-dashboard-josmarypirela-dev/ky8q0qtcyh?form_factor=desktop)

---

## 🎯 Core Web Vitals (Production - PageSpeed Insights)

### Desktop

| Metric | Value | Rating |
|---|---|---|
| **First Contentful Paint** | 0.2 s | ✅ Good |
| **Largest Contentful Paint** | 0.6 s | ✅ Good |
| **Total Blocking Time** | 20 ms | ✅ Good |
| **Cumulative Layout Shift** | 0.01 | ✅ Good |
| **Speed Index** | 1.2 s | ✅ Good |

### Mobile

| Metric | Value | Rating |
|---|---|---|
| **First Contentful Paint** | 0.2 s | ✅ Good |
| **Largest Contentful Paint** | 0.6 s | ✅ Good |
| **Total Blocking Time** | 10 ms | ✅ Good |
| **Cumulative Layout Shift** | 0.01 | ✅ Good |
| **Speed Index** | 1.8 s | ✅ Good |

> 📱 **Note**: Metrics obtained under real network conditions (Slow 4G, CPU throttled)
> 🔗 [PageSpeed Insights report](https://pagespeed.web.dev/analysis/https-dashboard-josmarypirela-dev/ky8q0qtcyh?form_factor=desktop)
>
> 🔒 **Mozilla Observatory**: A+ (10/10) — [View report](https://observatory.mozilla.org/analyze/dashboard.josmarypirela.dev)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Pomodoro Timer** | Configurable timer with active task selector and completion confirmation |
| **Kanban Board** | Task management with drag & drop (To do → In progress → Done) |
| **Gamification** | XP from claimable quests with level-based ranking system |
| **Weekly statistics** | SVG charts of focus time and daily efficiency |
| **CSV Import/Export** | Backup and restore tasks in CSV format |
| **Authentication** | Registration, login, forgot/reset password with bcryptjs, httpOnly cookies and DB sessions |
| **i18n** | Spanish and English with hot-switching (includes auth forms) |
| **Markdown Notes** | Per-task Markdown note editor with preview (lazy-loaded) |

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19 + Tailwind CSS 4 + Motion |
| **State** | Zustand (global store) |
| **Local persistence** | IndexedDB via Dexie.js |
| **Cloud persistence** | Neon (PostgreSQL) + Drizzle ORM (with auth) |
| **Authentication** | bcryptjs + httpOnly cookies + DB sessions |
| **Drag & Drop** | @dnd-kit |
| **Forms** | react-hook-form + Zod |
| **Logger** | Context-scoped structured Logger |
| **Typography** | Inter (self-hosted via next/font) |
| **Tests** | Vitest (unit) + Playwright (e2e) |
| **Monitoring** | Sentry (error tracking + performance) |
| **Orchestration** | Turborepo |
| **Quality** | SonarQube + TypeScript strict + ESLint + Prettier |

---

## 🛠️ Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server (Turborepo) |
| `pnpm build` | Build for production (Turborepo with cache) |
| `pnpm test` | Unit tests with coverage (104 tests) |
| `pnpm test:e2e` | End-to-end tests with Playwright |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | ESLint (flat config, no circular ref) |
| `pnpm preflight` | typecheck + lint + test (CI ready) |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check formatting with Prettier |
| `pnpm start` | Start production server (Next.js) |
| `pnpm test:watch` | Tests in watch mode (Vitest) |

---

## 🧪 Tests

```bash
pnpm test        # Unit + integration (Vitest) — 104 tests, 7 suites
pnpm test:e2e    # E2E (Playwright: Chromium/Firefox/WebKit local, Chromium only in CI)
pnpm preflight   # typecheck + lint + test (CI pipeline)
```

### Key coverage

| Module | Statements | Branches |
|---|---|---|
| `store/useHiveStore` | 95% | 78% |
| `hooks/useTasks` | 100% | 100% |
| `components/TaskCard` | 100% | 100% |
| `components/FocusTimer` | 72% | 56% |
| `utils/importer` | 100% | 91% |
| `utils/sanitize` | 100% | 100% |

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

| Job | Commands | Artifacts (only on failure) |
|---|---|---|
| **quality** | `typecheck` → `lint` → `test` | `coverage/` |
| **e2e** | `playwright install chromium` → `test:e2e` | `playwright-report/` |
| **deploy-staging** | Build + Vercel Preview (branch `develop`) | — |
| **deploy-prod** | Build + Vercel Production (branch `main`) | — |
| **rollback** | Manual rollback via `workflow_dispatch` | — |

- `pnpm preflight` for pre-push hook
- **Concurrency**: auto-cancel-in-progress per branch (`concurrency.group`)
- **Staging**: auto-deploy from `develop` to Vercel Preview (`amondnet/vercel-action@v25`)
- **Production**: auto-deploy from `main` to Vercel Production (`--prod --prebuilt`)
- **Rollback**: manual via GitHub Actions (`workflow_dispatch` with `--prod --force`)

---

## 🔐 Authentication

BeeHive allows users to register and login to preserve their data across sessions. Without authentication, data is stored locally (IndexedDB) and lost when closing the browser.

| Feature | Detail |
|---|---|
| **Registration** | Name, Last Name, Username, Email, Password + Confirmation |
| **Validations** | Unique email, Unique username (alphanumeric regex), password: 8+ chars, 1 uppercase, 1 number, 1 special |
| **Password checker** | Real-time dynamic checklist with [✓]/[ ] during registration; submit disabled if requirements not met |
| **Forgot password** | "Forgot password?" link in login → `/auth/forgot-password` page (bee theme) |
| **Reset** | API generates token (1h expiration), `/auth/reset-password/[token]` page for new password |
| **Reset security** | All active sessions are invalidated on password reset |
| **Security** | bcryptjs (12 rounds), httpOnly cookies, sessions with 7-day expiration |
| **Login** | By email or username |
| **Rate limiting** | Login 5/15min, Register 5/min, Forgot password 3/min (per IP) |
| **Password validation** | Shared regex in `src/lib/password-validation.ts` (Zod + server-side + client-side widget) |
| **i18n** | Auth forms and reset pages in Spanish and English |
| **UX** | "Sign In" button always visible in sidebar, logout with icon |

---

## 🐛 Sentry (Error Monitoring)

Sentry is configured to capture errors on client, server and edge:

| File | Runtime | Sampling |
|---|---|---|
| `sentry.client.config.ts` | Browser | 25% |
| `sentry.server.config.ts` | Node.js | 50% |
| `sentry.edge.config.ts` | Edge | 10% |
| `instrumentation.ts` | Bootstrap | — |

Only enabled in production (`NODE_ENV=production`).

---

## 📝 Logger

Structured logger with levels and context in `src/lib/logger.ts`:

```typescript
const log = createLogger("MyComponent");
log.info("message", { key: "value" });
log.error("something failed", err);
```

- Levels: `debug`, `info`, `warn`, `error`
- `debug` is silenced in production

---

## 🏗️ Turborepo

Configured with `turbo.json` for cached and parallel task execution:

| Task | Depends on | Cache |
|---|---|---|
| `dev` | — | ❌ (persistent) |
| `build` | `^build` | `.next/**` |
| `lint` | `^build` | ❌ |
| `typecheck` | `^build` | ❌ |
| `test` | `build` | `coverage/**` |
| `preflight` | typecheck + lint + test | ❌ |

Run with `pnpm turbo <task>` or directly `pnpm <task>` (PNPM runner).

---

## 🔐 Environment Variables

| File | Purpose |
|---|---|
| `.env.example` | Template with default values |
| `.env.local` | Local overrides (gitignored) |
| `.env.development` | Development (`NODE_ENV=development`) |
| `.env.staging` | Staging (`NODE_ENV=production`) |
| `.env.production` | Production (`NODE_ENV=production`) |

| Variable | Description | Public |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Site URL | ✅ |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | ✅ |
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT` | Analytics endpoint | ✅ |
| `NODE_ENV` | development / production | ❌ |
| `DATABASE_URL` | Neon PostgreSQL connection string | ❌ |
| `APP_URL` | Application base URL | ❌ |
| `LOG_LEVEL` | debug / info / warn / error | ❌ |
| `LOG_ENDPOINT` | Remote log endpoint | ❌ |
| `SENTRY_DSN` | Sentry DSN (server) | ❌ |

---

## ♿ Accessibility

| Practice | Implementation |
|---|---|
| **Skip to content** | Skip link to main content |
| **ARIA roles** | Semantic roles (`region`, `progressbar`, `button`) |
| **Role progressbar** | Pomodoro timer with `aria-valuenow` and visual state |
| **Focus management** | Visible focus and logical tab order |
| **Contrast** | Sufficient contrast color palette |
| **Alternative text** | Decorative icons with `aria-hidden` |

---

## 📦 Quick Deploy

```bash
pnpm install && pnpm dev      # Development
pnpm build && pnpm start       # Production
```

## 🔗 Links

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://dashboard.josmarypirela.dev)
[![PageSpeed](https://img.shields.io/badge/PageSpeed-97F100-brightgreen)](https://pagespeed.web.dev/analysis/https-dashboard-josmarypirela-dev/ky8q0qtcyh?form_factor=desktop)
