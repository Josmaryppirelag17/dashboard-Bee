# Architecture Decisions

## Arquitectura

- **Next.js App Router** con Atomic Design para componentes
- **Zustand** para estado global del cliente
- **Dexie.js (IndexedDB)** para persistencia local offline-first
- **Neon + Drizzle** para persistencia cloud con auth
- **@dnd-kit** para drag & drop del Kanban

## Logger estructurado no implementado

`console.log` es suficiente para el tamaño del proyecto.

## Redis para rate limiting no usado

In-memory es suficiente para un proyecto de portafolio sin escala.
