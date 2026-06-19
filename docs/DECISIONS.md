# Architecture Decisions

## Architecture

- **Next.js App Router** with Atomic Design for components
- **Zustand** for client-side global state
- **Dexie.js (IndexedDB)** for offline-first local persistence
- **Neon + Drizzle** for cloud persistence with auth
- **@dnd-kit** for Kanban drag & drop

## Structured logger not implemented

`console.log` is sufficient for the project size.

## Redis for rate limiting not used

In-memory is sufficient for a portfolio project without scale.
