# API Reference

> Generated: 2026-06-07
> Platform: **Web (Next.js) — Client-side SPA**
> Endpoints: 3 (health/status)

---

## Architecture

This application is primarily **client-side**. Task, session, and gamification data is stored in **IndexedDB** (browser) via Dexie.js. No backend or external database is required for its core functionality.

## Next.js API Endpoints

| Method | Route | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/latest` | Current API version |
| `GET` | `/api/v1` | API v1 endpoint (placeholder) |

### `GET /api/health`
**File:** `src/app/api/health/route.ts`
**Returns:** `{ status: "ok", timestamp: string }`

---

## Persistence (Client-side)

| Storage | Technology | Purpose |
|---------------|------------|-----------|
| IndexedDB | Dexie.js | Tasks, notes, settings |
| localStorage | — | XP, level, achievements, streaks, weekly metrics, session deviceId |

## Data Export

- **Format:** CSV (UTF-8 BOM, Excel-compatible)
- **Headers:** ID, Title, Completed, Priority, Category, Pollen/Effort, Column, Notes
- **Import:** Smart parsing with ES/EN support
