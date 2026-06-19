# Test Plan

## Estado actual

| Tipo            | Cantidad                   | Estado |
| --------------- | -------------------------- | ------ |
| Unitarios       | 55 tests (8 suites)        | ✅     |
| Integración API | 67 tests (5 suites)        | ✅     |
| E2E             | 6 specs (Playwright)       | ✅     |
| **Total**       | **215 tests (17 suites)**  | ✅     |

## Tests existentes

### API (67 tests, 5 suites)
| Suite      | Tests | Cobertura |
| ---------- | ----- | --------- |
| Auth       | 36    | Register, login, forgot/reset password, rate limiting, validation |
| Tasks      | 15    | CRUD, Kanban logic, Zod validation, authorization |
| Stats      | 9     | CRUD, authorization |
| Sync       | 4     | Push/pull, merge, authorization |
| Analytics  | 3     | Event tracking, validation |

### Unit (55 tests, 8 suites)
| Suite            | Tests | Notas |
| ---------------- | ----- | ----- |
| useHiveStore     | 39    | Store Zustand completo |
| SessionList      | 19    | Revocación, renderizado |
| TaskCard         | 12    | Renderizado, acciones |
| FocusTimer       | 12    | Temporizador, estados |
| OnboardingTour   | 12    | Pasos, navegación, i18n (89.64% coverage) |
| Importer         | 21    | CSV parsing ES/EN |
| Exporter         | 8     | CSV blob, BOM, filename, edge cases (100% coverage) |
| Otros            | 8     | sanitize, id, middleware, placeholder |

### E2E (6 specs)
| Spec              | Flujo |
| ----------------- | ----- |
| auth.spec         | Registro, login, logout |
| tasks.spec        | CRUD de tareas |
| focus.spec        | Pomodoro timer |
| full-flow.spec    | Recorrido completo |
| reset-password    | Forgot + reset password |
| import-export     | CSV export, empty state, import button |

## Cobertura

| Métrica    | Threshold | Actual | Estado |
| ---------- | --------- | ------ | ------ |
| Statements | 80%       | 86.53% | ✅     |
| Branches   | 74%       | 76.95% | ✅     |
| Functions  | 60%       | 73.68% | ✅     |
| Lines      | 80%       | 86.53% | ✅     |

## Ejecución

```bash
pnpm test          # Tests unitarios + API con coverage
pnpm test:watch    # Watch mode
pnpm test:e2e      # Tests E2E (Playwright)
pnpm preflight     # typecheck + lint + test
```
