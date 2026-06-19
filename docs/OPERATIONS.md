# Operations Guide

## Monitoreo

| Herramienta      | Propósito          |
| ---------------- | ------------------ |
| Sentry           | Error tracking     |
| SonarCloud       | Calidad de código  |
| Vercel Dashboard | Métricas de deploy |

## CI/CD Pipeline

1. Push/PR → CI (typecheck + lint + test + E2E)
2. Push `develop` → Vercel Preview (staging)
3. Push `main` → Vercel Production
4. Rollback manual via `workflow_dispatch`

## Estado del proyecto

El proyecto está en **Maintenance Mode** — cerrado a nuevas features. Solo mantenimiento de seguridad y dependencias.
