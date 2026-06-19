# Features

## Implementadas

| Feature                | Descripción                               |
| ---------------------- | ----------------------------------------- |
| Pomodoro Timer         | Configurable con selector de tarea activa |
| Kanban Board           | Drag & drop (To do → In progress → Done)  |
| Gamificación           | XP por quests, ranking por niveles        |
| Estadísticas semanales | Gráficos SVG de tiempo focus y eficiencia |
| CSV Import/Export      | Backup y restore de tareas (con tests)    |
| Markdown Notes         | Editor por tarea con preview              |
| Auth completo          | Register, login, forgot/reset password    |
| i18n ES/EN             | Cambio de idioma en caliente              |
| Onboarding Tour        | 7 pasos interactivos ES/EN (89.64% cov)   |
| SessionList            | Gestión multi-device con revocación       |
| Persistencia local     | IndexedDB via Dexie.js                    |
| Persistencia cloud     | Neon + Drizzle con auth                   |
| Rate limiting          | Login 5/15min, Register 5/min, Forgot 3/min |
| LoggerService          | Logger estructurado con niveles           |

## Pendientes (no planificadas)

| Feature             | Motivo                         |
| ------------------- | ------------------------------ |
| Email verification  | No crítico                     |
| Account lockout     | Rate limiting mitiga           |
