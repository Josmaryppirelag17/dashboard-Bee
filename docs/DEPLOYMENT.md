# Deployment

## Plataforma

Vercel (Preview + Production).

## CI/CD

GitHub Actions en `.github/workflows/`:

- `test.yml`: typecheck + lint + test + E2E + SonarCloud
- `deploy.yml`: build + deploy a Vercel

## Estrategia

| Rama      | Entorno                  | Disparador          |
| --------- | ------------------------ | ------------------- |
| `develop` | Staging (Vercel Preview) | Push automático     |
| `main`    | Production (Vercel Prod) | Push automático     |
| Manual    | Rollback                 | `workflow_dispatch` |

## Pre-requisitos

```bash
DATABASE_URL
APP_URL
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_SITE_URL
```
