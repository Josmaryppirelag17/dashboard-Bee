# Test Plan

## Estado actual

| Tipo            | Cantidad             | Estado |
| --------------- | -------------------- | ------ |
| Unitarios       | 104 tests (7 suites) | ✅     |
| Integración API | Parcial              | ⚠️     |
| E2E             | 1 test               | ⚠️     |

## Tests existentes

| Suite        | Archivos                       |
| ------------ | ------------------------------ |
| Auth         | password, rate-limit, session  |
| Tasks        | CRUD, validation, Kanban logic |
| Gamification | XP, quests, levels             |
| Analytics    | stats, charts                  |
| Utils        | CSV, translations, sanitize    |

## Cobertura

| Métrica    | Threshold | Estado |
| ---------- | --------- | ------ |
| Statements | 80%       | ✅     |
| Branches   | 74%       | ✅     |
| Functions  | 60%       | ✅     |
| Lines      | 80%       | ✅     |

## Ejecución

```bash
pnpm test          # Tests unitarios con coverage
pnpm test:watch    # Watch mode
pnpm test:e2e      # Tests E2E
pnpm preflight     # typecheck + lint + test
```
