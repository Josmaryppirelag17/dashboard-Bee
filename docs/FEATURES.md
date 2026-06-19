# Features

## Implemented

| Feature                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| Pomodoro Timer         | Configurable with active task selector         |
| Kanban Board           | Drag & drop (To do → In progress → Done)       |
| Gamification           | XP from quests, level-based ranking            |
| Weekly statistics      | SVG charts for focus time and efficiency       |
| CSV Import/Export      | Task backup and restore (with tests)           |
| Markdown Notes         | Per-task editor with preview                   |
| Full Auth              | Register, login, forgot/reset password         |
| i18n ES/EN             | Hot-switchable language                        |
| Onboarding Tour        | 7-step interactive tour ES/EN (89.64% cov)     |
| SessionList            | Multi-device management with revocation        |
| Local persistence      | IndexedDB via Dexie.js                         |
| Cloud persistence      | Neon + Drizzle with auth                       |
| Rate limiting          | Login 5/15min, Register 5/min, Forgot 3/min    |
| LoggerService          | Structured logger with levels                  |

## Pending (not planned)

| Feature             | Reason                         |
| ------------------- | ------------------------------ |
| Email verification  | Not critical                   |
| Account lockout     | Rate limiting mitigates        |
