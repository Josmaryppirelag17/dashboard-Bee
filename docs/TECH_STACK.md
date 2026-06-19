# Tech Stack

## Frontend

| Tecnología              | Uso                         |
| ----------------------- | --------------------------- |
| Next.js 15 (App Router) | Framework React             |
| React 19                | UI declarativa              |
| Tailwind CSS v4         | Estilos utilitarios         |
| Motion (Framer Motion)  | Animaciones                 |
| @dnd-kit                | Drag & drop para Kanban     |
| Dexie.js                | IndexedDB persistence local |
| Zustand                 | Estado global               |
| Lucide React            | Iconos                      |
| react-hook-form + Zod   | Formularios y validación    |

## Backend

| Tecnología         | Uso                                |
| ------------------ | ---------------------------------- |
| Next.js API Routes | API REST (auth, tasks)             |
| Drizzle ORM        | ORM tipado                         |
| Neon (PostgreSQL)  | Base de datos serverless           |
| bcryptjs           | Hashing de contraseñas (12 rounds) |
| Zod                | Validación de esquemas             |

## Calidad

| Tecnología        | Uso                                   |
| ----------------- | ------------------------------------- |
| TypeScript strict | Tipado estático                       |
| ESLint + Prettier | Linting y formateo                    |
| Vitest            | Tests unitarios (104 tests, 7 suites) |
| Playwright        | Tests E2E                             |
| SonarCloud        | Análisis estático                     |

## Infraestructura

| Tecnología     | Uso                    |
| -------------- | ---------------------- |
| Turborepo      | Orquestación de tareas |
| Vercel         | Hosting y deploy       |
| Sentry         | Monitoreo de errores   |
| GitHub Actions | CI/CD                  |
