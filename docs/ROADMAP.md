# Roadmap

> Project status: 🟢 **Completed — Maintenance Mode**

---

## Milestones reached

| Milestone                                                | Status | Date       |
| -------------------------------------------------------- | ------ | ---------- |
| Foundation (Next.js + TS + Tailwind)                     | ✅     | 2026-06-04 |
| Atomic Design components                                 | ✅     | 2026-06-04 |
| Dashboard with tabs                                      | ✅     | 2026-06-05 |
| Stripe checkout + webhooks                               | ✅     | 2026-06-05 |
| Neon PostgreSQL + Drizzle                                | ✅     | 2026-06-05 |
| Docker + docker-compose                                  | ✅     | 2026-06-05 |
| Full Auth (register, login, session, password reset)     | ✅     | 2026-06-06 |
| Kanban drag & drop                                       | ✅     | 2026-06-06 |
| Pomodoro timer                                           | ✅     | 2026-06-06 |
| Gamification (XP, achievements, quests)                  | ✅     | 2026-06-06 |
| CSV export/import                                        | ✅     | 2026-06-06 |
| SVG statistics                                           | ✅     | 2026-06-06 |
| i18n ES/EN                                               | ✅     | 2026-06-06 |
| CI/CD + SonarCloud                                       | ✅     | 2026-06-07 |
| Full README                                              | ✅     | 2026-06-08 |
| Zod on Tasks API                                         | ✅     | 2026-06-11 |
| GPQF Level 4 reached                                     | ✅     | 2026-06-11 |
| Closure and Maintenance Mode                             | ✅     | 2026-06-11 |
| Coverage push (49 tests, 8 suites)                       | ✅     | 2026-06-19 |
| E2E httpOnly cookie fix                                  | ✅     | 2026-06-19 |
| GPQF Level 5 — Portfolio Ready                           | ✅     | 2026-06-19 |

---

## What was NOT built (conscious decision)

| Feature                    | Reason                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Structured LoggerService   | console.log is sufficient for the project size                                                                        |
| Redis for rate limiting    | In-memory is sufficient for a portfolio project without scale                                                         |
| Account lockout            | Rate limiting already mitigates brute force                                                                           |
| Email verification         | Not critical for the project's purpose                                                                                |

---

## Future (only if needed)

- Dependency updates
- Vulnerability fixes
- No active roadmap. The project is closed.
