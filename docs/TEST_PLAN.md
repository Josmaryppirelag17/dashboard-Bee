# Test Plan

## Estado actual

| Tipo            | Cantidad                   | Estado |
| --------------- | -------------------------- | ------ |
| Unitarios       | 106 tests (13 suites)      | ✅     |
| Integración API | 67 tests (5 suites)        | ✅     |
| E2E             | 6 specs (Playwright)       | ✅     |
| **Total**       | **264 tests (25 suites)**  | ✅     |

## Tests existentes

### API (67 tests, 5 suites)
| Suite      | Tests | Cobertura |
| ---------- | ----- | --------- |
| Auth       | 36    | Register, login, forgot/reset password, rate limiting, validation |
| Tasks      | 15    | CRUD, Kanban logic, Zod validation, authorization |
| Stats      | 9     | CRUD, authorization |
| Sync       | 4     | Push/pull, merge, authorization |
| Analytics  | 3     | Event tracking, validation |

### Unit (106 tests, 13 suites)
| Suite               | Tests | Notas |
| ------------------- | ----- | ----- |
| useHiveStore        | 39    | Store Zustand completo |
| SessionList         | 19    | Revocación, renderizado |
| TaskCard            | 12    | Renderizado, acciones |
| FocusTimer          | 12    | Temporizador, estados |
| OnboardingTour      | 12    | Pasos, navegación, i18n (89.64% coverage) |
| Importer            | 21    | CSV parsing ES/EN |
| Exporter            | 8     | CSV blob, BOM, filename, edge cases (100% coverage) |
| password-validation | 12    | checkPassword + validatePassword (Zod + regex) |
| rate-limit          | 8     | Unique IPs per test para evitar estado compartido |
| useDebounce         | 3     | Debounce hook con wait |
| useBeeStats         | 7     | Cálculo de estadísticas semanales |
| useBeePersistence   | 3     | Persistencia y carga de datos |
| useHiveProjection   | 8     | Filtros y proyección de datos |
| useSessionTracker   | 5     | heartbeat, deviceId, localStorage |
| theme               | 3     | Tema claro/oscuro, persistencia |
| Otros               | 8     | sanitize, id, middleware, placeholder |

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
| Statements | 80%       | 87.07% | ✅     |
| Branches   | 74%       | 79.07% | ✅     |
| Functions  | 60%       | 75.22% | ✅     |
| Lines      | 80%       | 87.07% | ✅     |

## Ejecución

```bash
pnpm test          # Tests unitarios + API con coverage
pnpm test:watch    # Watch mode
pnpm test:e2e      # Tests E2E (Playwright)
pnpm preflight     # typecheck + lint + test
```
