# Custom Hooks

> Generated: 2026-06-07
> Total hooks: **7**

---

## Hook Catalog

### `useHiveStore`
- **File:** `src/store/useHiveStore.ts`
- **Type:** Zustand store
- **State:** tasks, activeTab, searchQuery, xp, level, achievements, etc.
- **Actions:** addTask, toggleTask, deleteTask, updateTaskColumn, recordFocusSession, addXP, importTasks, etc.

### `useTasks`
- **File:** `src/hooks/useTasks.ts`
- **Purpose:** Facade over useHiveStore for CRUD task operations
- **Returns:** tasks, filteredTasks, completedTasksCount, taskCompletionRate, totalPollenProduced

### `useBeeStats`
- **File:** `src/hooks/useBeeStats.ts`
- **Purpose:** Focus and streak metrics
- **Returns:** totalFocusMins, streakCount, hiveRank, activeStatusText

### `useBeePersistence`
- **File:** `src/hooks/useBeePersistence.ts`
- **Purpose:** IndexedDB save state (idle/saving/saved)
- **Returns:** isSaving, isSaved, isIdle

### `useSessionTracker`
- **File:** `src/hooks/useSessionTracker.ts`
- **Purpose:** Login-free session tracking with heartbeat and inactivity timeout (5 min)
- **Returns:** deviceId, isOnline, activeDuration, formattedDuration

### `useHiveProjection`
- **File:** `src/hooks/useHiveProjection.ts`
- **Purpose:** Remaining days prediction based on tasks/day rate
- **Returns:** totalTasksCount, completedTasksCount, pendingTasksCount, remainingDays, advice

### `useDebounce`
- **File:** `src/hooks/useDebounce.ts`
- **Purpose:** Generic debounce for controlled values

---

## Data Flow

```
Components → Custom Hooks → Zustand Store → IndexedDB (Dexie)
                                        ↕
                              Session Tracker → localStorage
                                        ↕
                              CSV Export/Import → File API
```
