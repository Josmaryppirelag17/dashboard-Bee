# Roadmap

> Estado del proyecto: 🟡 **Completado — Maintenance Mode**

---

## Hitos alcanzados

| Hito                                                     | Estado | Fecha      |
| -------------------------------------------------------- | ------ | ---------- |
| Fundación (Next.js + TS + Tailwind)                      | ✅     | 2026-06-04 |
| Atomic Design components                                 | ✅     | 2026-06-04 |
| Dashboard con tabs                                       | ✅     | 2026-06-05 |
| Stripe checkout + webhooks                               | ✅     | 2026-06-05 |
| Neon PostgreSQL + Drizzle                                | ✅     | 2026-06-05 |
| Docker + docker-compose                                  | ✅     | 2026-06-05 |
| Auth completo (register, login, session, password reset) | ✅     | 2026-06-06 |
| Kanban drag & drop                                       | ✅     | 2026-06-06 |
| Pomodoro timer                                           | ✅     | 2026-06-06 |
| Gamificación (XP, achievements, quests)                  | ✅     | 2026-06-06 |
| CSV export/import                                        | ✅     | 2026-06-06 |
| Estadísticas SVG                                         | ✅     | 2026-06-06 |
| i18n ES/EN                                               | ✅     | 2026-06-06 |
| CI/CD + SonarCloud                                       | ✅     | 2026-06-07 |
| README completo                                          | ✅     | 2026-06-08 |
| Zod en Tasks API                                         | ✅     | 2026-06-11 |
| GPQF Level 4 alcanzado                                   | ✅     | 2026-06-11 |
| Cierre y Maintenance Mode                                | ✅     | 2026-06-11 |
| Coverage push (49 tests, 8 suites)                       | ✅     | 2026-06-19 |
| E2E httpOnly cookie fix                                   | ✅     | 2026-06-19 |
| GPQF Level 5 — Portfolio Ready                           | ✅     | 2026-06-19 |

---

## Lo que NO se construyó (decisión consciente)

| Feature                    | Motivo                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| LoggerService estructurado | console.log es suficiente para el tamaño del proyecto                                                                 |
| Redis para rate limiting   | In-memory es suficiente para un proyecto de portafolio sin escala                                                     |
| Account lockout            | Rate limiting ya mitiga fuerza bruta                                                                                  |
| Email verification         | No crítico para el propósito del proyecto                                                                             |

---

## Futuro (solo si es necesario)

- Actualización de dependencias
- Corrección de vulnerabilidades
- No hay roadmap activo. El proyecto está cerrado.
