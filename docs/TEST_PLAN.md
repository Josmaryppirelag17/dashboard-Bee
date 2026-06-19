# Test Plan

## Current state

| Type             | Count                       | Status |
| ---------------- | --------------------------- | ------ |
| Unit             | 106 tests (13 suites)       | ✅     |
| API Integration  | 67 tests (5 suites)         | ✅     |
| E2E              | 6 specs (Playwright)        | ✅     |
| **Total**        | **264 tests (25 suites)**   | ✅     |

## Existing tests

### API (67 tests, 5 suites)
| Suite      | Tests | Coverage                           |
| ---------- | ----- | ---------------------------------- |
| Auth       | 36    | Register, login, forgot/reset password, rate limiting, validation |
| Tasks      | 15    | CRUD, Kanban logic, Zod validation, authorization |
| Stats      | 9     | CRUD, authorization                |
| Sync       | 4     | Push/pull, merge, authorization    |
| Analytics  | 3     | Event tracking, validation         |

### Unit (106 tests, 13 suites)
| Suite               | Tests | Notes                                    |
| ------------------- | ----- | ---------------------------------------- |
| useHiveStore        | 39    | Full Zustand store                       |
| SessionList         | 19    | Revocation, rendering                    |
| TaskCard            | 12    | Rendering, actions                       |
| FocusTimer          | 12    | Timer, states                            |
| OnboardingTour      | 12    | Steps, navigation, i18n (89.64% coverage)|
| Importer            | 21    | CSV parsing ES/EN                        |
| Exporter            | 8     | CSV blob, BOM, filename, edge cases (100% coverage) |
| password-validation | 12    | checkPassword + validatePassword (Zod + regex) |
| rate-limit          | 8     | Unique IPs per test to avoid shared state |
| useDebounce         | 3     | Debounce hook with wait                  |
| useBeeStats         | 7     | Weekly statistics calculation            |
| useBeePersistence   | 3     | Data persistence and loading             |
| useHiveProjection   | 8     | Filters and data projection              |
| useSessionTracker   | 5     | heartbeat, deviceId, localStorage        |
| theme               | 3     | Light/dark theme, persistence            |
| Other               | 8     | sanitize, id, middleware, placeholder    |

### E2E (6 specs)
| Spec              | Flow                              |
| ----------------- | --------------------------------- |
| auth.spec         | Register, login, logout           |
| tasks.spec        | CRUD tasks                        |
| focus.spec        | Pomodoro timer                    |
| full-flow.spec    | Complete journey                  |
| reset-password    | Forgot + reset password           |
| import-export     | CSV export, empty state, import button |

## Coverage

| Metric     | Threshold | Actual | Status |
| ---------- | --------- | ------ | ------ |
| Statements | 80%       | 87.07% | ✅     |
| Branches   | 74%       | 79.07% | ✅     |
| Functions  | 60%       | 75.22% | ✅     |
| Lines      | 80%       | 87.07% | ✅     |

## Running

```bash
pnpm test          # Unit + API tests with coverage
pnpm test:watch    # Watch mode
pnpm test:e2e      # E2E tests (Playwright)
pnpm preflight     # typecheck + lint + test
```
