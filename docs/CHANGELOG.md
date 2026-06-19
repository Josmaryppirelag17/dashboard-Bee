# Changelog

> Formato basado en [Keep a Changelog](https://keepachangelog.com/) y [Semantic Versioning](https://semver.org/).

---

## [2.2.0] — 2026-06-19

### Added

- 49 nuevos tests unitarios (13 nuevas suites): password-validation (12), rate-limit (8), useDebounce (3), useBeeStats (7), useBeePersistence (3), useHiveProjection (8), useSessionTracker (5), theme (3)
- SonarCloud exclusions sincronizadas con vitest config

### Fixed

- E2E auth cookie check: `document.cookie` → `page.context().cookies()` para httpOnly cookies
- `AuthPage.ts` signInBtn locator: flag `/i` para "Sign In" vs "Sign in"
- `password-validation.test.ts`: unused import TS6133
- `useSessionTracker.test.tsx`: missing `beforeEach` import TS2304

### Changed

- Coverage thresholds met: 87.07% S, 79.07% B, 75.22% F, 87.07% L
- Test total: 215 → 264 tests (25 suites)
- PageSpeed: Performance 91→100 Desktop, 97→96 Mobile

---

## [2.1.0] — 2026-06-19

### Added

- OnboardingTour: 7-step interactive tour (ES/EN) — 12 tests, 89.64% coverage
- Exporter unit tests: 8 tests covering CSV blob, BOM, accents, filename, edge cases (100% coverage)
- E2E specs: reset-password (forgot link, invalid email) — 2 tests
- E2E specs: import-export (CSV export, empty error, import button) — 3 tests

### Fixed

- CI typecheck errors: TS2345 on Drizzle mock chains in tests/api (auth, stats, tasks)
- Exporter mock: added setAttribute stub for jsdom compatibility
- OnboardingTour test: getAllByText for backdrop overlay (multiple elements match)
- exporter.ts removed from coverage exclusion list

### Changed

- Coverage thresholds: branches 70%→74% (met at 76.95%)
- Test total: 104→215 tests (17 suites)
- def-of-done: updated to reflect full E2E + unit coverage

---

## [2.0.0] — 2026-06-11

### Fixed

- Zod validation agregada a Tasks API (POST/PUT)

### Cerrado

- Proyecto pasa a Maintenance Mode
- Documentación de cierre completada (PROJECT_STATUS, KNOWN_LIMITATIONS, MAINTENANCE)

---

## [1.6.0] — 2026-06-10

### Fixed

- Reemplazadas credenciales PostgreSQL hardcodeadas por env vars con defaults

### Added

- Tests CRDT unitarios + E2E smoke tests

---

## [1.5.0] — 2026-06-09

### Added

- Conexión de ChaosPanel UI a inject-failure API para persistencia en DB
- Speed slider en controles 3D overlay
- SimulationSpeed control + auto-heal después de chaos events

---

## [1.4.0] — 2026-06-08

### Docs

- README completo siguiendo formato de template

### Chore

- Sonar scanner script

---

## [1.3.0] — 2026-06-07

### CI

- Migrado deploy a Vercel CLI
- Agregado SonarCloud analysis

---

## [1.2.0] — 2026-06-06

### Added

- Sistema de autenticación completo
- Kanban drag & drop
- Pomodoro timer
- Gamificación: XP, achievements, quests
- CSV export/import
- Estadísticas SVG
- i18n ES/EN

---

## [1.1.0] — 2026-06-05

### Added

- Dashboard con tabs (Garden, Canvas, Marketplace, Analytics, Settings)
- Stripe checkout + webhooks
- Neon PostgreSQL + Drizzle ORM
- Docker + docker-compose

---

## [1.0.0] — 2026-06-04

### Added

- Inicio del proyecto
- Next.js + TypeScript strict + Tailwind CSS
- Atomic Design estructura de componentes
