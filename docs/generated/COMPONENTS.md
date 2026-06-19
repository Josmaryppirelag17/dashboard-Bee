# Component Catalog

> Generated: 2026-06-07
> Total components: **9**
> Pattern: **Atomic Design**

---

## Atoms — UI primitives (4)

### `<Badge />`

- **File:** `src/components/atoms/Badge.tsx`
- **Variants:** `high` (red), `medium` (amber), `low` (green), `neutral` (gray)
- **Usage:** Visual task priority indicator

### `<HexButton />`

- **File:** `src/components/atoms/HexButton.tsx`
- **Variants:** `primary`, `secondary`
- **Usage:** Primary button with honeycomb icon

### `<PollenIndicator />`

- **File:** `src/components/atoms/PollenIndicator.tsx`
- **Usage:** Displays 1-5 effort hexagons (pollen) per task

### `<ProgressHex />`

- **File:** `src/components/atoms/ProgressHex.tsx`
- **Usage:** Animated hexagon with circular progress bar for metrics

---

## Molecules — Groups of atoms (1)

### `<TaskCard />` (Compound Component)

- **File:** `src/components/molecules/TaskCard.tsx`
- **Subcomponents:** `Checkbox`, `Body`, `Pollen`, `Actions`, `DragHandle`
- **Usage:** Task card with checkbox, title, badges, pollen indicator, and lazy-loaded Markdown editor
- **Drag & Drop:** Compatible with @dnd-kit sortable

---

## Organisms — Complex sections (4)

### `<FocusTimer />`

- **File:** `src/components/organisms/FocusTimer.tsx`
- **Usage:** Configurable Pomodoro timer (15/25/45/60 min) with:
  - Active task selector (moves from "todo" to "in_progress")
  - Completion confirmation (completed / return to pending)
  - Dynamic honeycomb panel with all tasks as cells
  - Sound, pause, reset

### `<TaskBoard />`

- **File:** `src/components/organisms/TaskBoard.tsx`
- **Usage:** Kanban with 3 columns (To Do / In Progress / Completed)
  - Drag & Drop with @dnd-kit
  - Category filter and global search
  - New task form with priority and effort

### `<Sidebar />`

- **File:** `src/components/organisms/Sidebar.tsx`
- **Usage:** Collapsible sidebar navigation with:
  - 3 tabs: Dashboard, Focus, Analytics
  - Language selector (ES/EN)
  - XP and level bar
  - Bee profile with randomizable name

### `<StatsChart />`

- **File:** `src/components/organisms/StatsChart.tsx`
- **Usage:** Weekly SVG area chart with:
  - Metrics: focus time and efficiency (%)
  - Interactive daily tooltip
  - Summary: total focus, daily average, average efficiency

### `<MetricCard />`

- **File:** `src/components/organisms/MetricCard.tsx`
- **Usage:** Metric card with progress hexagon and SVG sparkline

### `<HiveProjectionCard />`

- **File:** `src/components/organisms/HiveProjectionCard.tsx`
- **Usage:** Remaining days prediction with daily pace slider

### `<MarkdownNotesEditor />`

- **File:** `src/components/organisms/MarkdownNotesEditor.tsx`
- **Usage:** Inline Markdown editor with preview and autosave (lazy-loaded)

### `<MainTemplate />`

- **File:** `src/components/organisms/MainTemplate.tsx`
- **Usage:** Main layout with slots for sidebar, header, and content

---

## Design System

- **Palette:** Honey (#e28800), Amber (#faa715), Cream (#faf6ee), Border (#ebdcb9)
- **Typography:** Sans-serif system, monospace for numeric data
- **Icons:** Lucide React
- **Animations:** Motion (Framer Motion)
