# Changelog

> Formato basado en [Keep a Changelog](https://keepachangelog.com/) y [Semantic Versioning](https://semver.org/).

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
