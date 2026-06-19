# Environment Variables

Ver `.env.example` para variables requeridas.

## Archivos de entorno

| Archivo            | Propósito                        |
| ------------------ | -------------------------------- |
| `.env.example`     | Template con valores por defecto |
| `.env.local`       | Overrides locales (gitignored)   |
| `.env.development` | Desarrollo                       |
| `.env.staging`     | Staging                          |
| `.env.production`  | Producción                       |

## Variables requeridas

| Variable                 | Descripción                       | Pública |
| ------------------------ | --------------------------------- | ------- |
| `DATABASE_URL`           | Neon PostgreSQL connection string | ❌      |
| `APP_URL`                | Application base URL              | ❌      |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN                        | ✅      |
| `NEXT_PUBLIC_SITE_URL`   | Site URL                          | ✅      |

## Setup local

```bash
cp .env.example .env.local
pnpm dev
```
