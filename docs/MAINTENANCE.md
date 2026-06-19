# Maintenance Guide

> Última actualización: 2026-06-11

---

## Estado

El proyecto está en **Maintenance Mode**. No hay desarrollo activo planificado.

---

## Permitido

- Corregir bugs
- Actualizar dependencias
- Parches de seguridad (rate limits faltantes, account lockout)
- Mover DSNs a env vars de runtime

## No permitido

- Features nuevas
- Rediseños
- Rehacer módulos
- BeeHive v2 dentro del mismo proyecto

---

## Proceso de mantenimiento

### 1. Desarrollo local

```bash
pnpm dev              # Desarrollo local
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint
pnpm test             # Tests unitarios
pnpm test:e2e         # Tests E2E
pnpm preflight        # Todo junto
```

### 2. Publicar cambios

```bash
pnpm preflight
git add -A
git commit -m "tipo: descripción"
git push
```

La pipeline de CI/CD despliega automáticamente a producción (main) o staging (develop).

### 3. Post-deploy

- Verificar en https://dashboard.josmarypirela.dev
- Revisar Sentry por errores nuevos
- Probar flujo completo: login → crear tarea → pomodoro → kanban → export

---

## Stack

| Capa               | Tecnología                    |
| ------------------ | ----------------------------- |
| Framework          | Next.js 15                    |
| UI                 | React 19, Tailwind CSS 4      |
| Estado             | Zustand 5                     |
| Persistencia local | Dexie.js (IndexedDB)          |
| Drag & drop        | @dnd-kit                      |
| Base de datos      | Neon PostgreSQL + Drizzle ORM |
| Autenticación      | bcryptjs, httpOnly cookies    |
| Monitoreo          | Sentry (client/server/edge)   |
| CI/CD              | GitHub Actions                |
| Hosting            | Vercel                        |
