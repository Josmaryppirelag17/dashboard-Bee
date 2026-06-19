# User Flow

## Visitante

```
Landing → Login / Register
  ├── Sin auth: datos locales (IndexedDB)
  └── Con auth: datos cloud (Neon)
```

## Dashboard (autenticado)

```
Dashboard
  ├── Pomodoro Timer
  │     └── Seleccionar tarea → Iniciar → Completar → +XP
  ├── Kanban Board
  │     └── Drag & drop tareas
  ├── Estadísticas
  │     └── Gráficos semanales de focus
  ├── Quest / XP
  │     └── Reclamar quests → Subir nivel
  ├── Notas Markdown
  │     └── Editor por tarea
  └── Settings
        └── Perfil, idioma, CSV export/import
```

## Auth

```
Register → Login → Dashboard
  ├── Forgot password → Email token → Reset → Login
  └── Logout
```
