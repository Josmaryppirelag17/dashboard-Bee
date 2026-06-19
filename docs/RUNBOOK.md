# Runbook

## Desarrollo local

```bash
pnpm install
cp .env.example .env.local
pnpm dev              # http://localhost:3000
```

## Comandos

```bash
pnpm dev              # Desarrollo
pnpm build            # Build producción
pnpm start            # Iniciar producción
pnpm test             # Tests unitarios + API (264 tests)
pnpm test:e2e         # Tests E2E
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint
pnpm preflight        # typecheck + lint + test
pnpm format           # Prettier
pnpm db:generate      # Generar migraciones
pnpm db:push          # Push schema
pnpm db:studio        # Drizzle Studio
pnpm db:migrate       # Correr migraciones
```

## Turborepo

```bash
pnpm turbo build      # Build con cache
pnpm turbo test       # Tests con cache
```
