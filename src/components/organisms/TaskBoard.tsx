import React, { useState } from "react";
import { Plus, Sparkles, ChevronDown, Inbox, LayoutGrid } from "lucide-react";
import { useHiveStore } from "@/store/useHiveStore";
import { useBeePersistence } from "@/hooks/useBeePersistence";
import { useBeeToasts } from "@/context/BeeToastContext";
import { PriorityLevel, ColumnId, Task } from "@/types";
import { THEME_CONFIG } from "@/theme.config";
import { HexButton } from "@/components/atoms/HexButton";
import { TaskCard } from "@/components/molecules/TaskCard";
import { motion, AnimatePresence } from "motion/react";
import { useForm, Controller } from "react-hook-form";
import { translations } from "@/utils/translations";

// dnd-kit Imports
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CATEGORY_OPTIONS_ES = [
  "Miel (Producción)",
  "Polen (Investigación)",
  "Cera (Diseño/Desa)",
  "Colmena (Operaciones)",
];

const CATEGORY_OPTIONS_EN = [
  "Honey (Production)",
  "Pollen (Foraging)",
  "Wax (Design/Devel)",
  "Hive (Operations)",
];

// Sub-Component: Droppable Column container
const KanbanColumn: React.FC<{
  column: { id: ColumnId; title: string; color: string; label: string };
  tasks: Task[];
  children: React.ReactNode;
  language: "es" | "en";
}> = ({ column, tasks, children, language }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      role="region"
      aria-label={language === "en" ? `Column ${column.title}` : `Columna ${column.title}`}
      className={`flex-1 flex flex-col border min-h-[350px] lg:min-w-[310px] xl:min-w-[350px] rounded-2xl p-4 transition-all duration-300 ${
        isOver
          ? "border-[#e28800] bg-amber-500/5 shadow-[0_4px_20px_rgba(226,136,0,0.06)]"
          : column.color
      }`}
    >
      {/* Column Title with responsive elements */}
      <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-[#ebdcb9]/30">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              column.id === "todo"
                ? "bg-[#faa715] animate-pulse"
                : column.id === "in_progress"
                  ? "bg-[#e28800]"
                  : "bg-emerald-600"
            }`}
          />
          <h4 className="text-xs font-extrabold text-[#100f0d] uppercase tracking-wider">
            {column.title}
          </h4>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#5c5449] bg-white border border-[#ebdcb9]/50 px-2.5 py-0.5 rounded-lg shadow-inner">
          {tasks.length}
        </span>
      </div>

      <p className="text-[10px] text-[#5c5449] mb-4 italic">{column.label}</p>

      {/* Column children list wrapper */}
      <div className="flex-1 space-y-3 relative">{children}</div>
    </div>
  );
};

// Sub-Component: Sortable Task Item Binder
const SortableTaskItem: React.FC<{
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}> = ({ task, onToggle, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="outline-none">
      <TaskCard
        task={task}
        onToggle={onToggle}
        onDelete={onDelete}
        className={isDragging ? "border-[#e28800] ring-2 ring-[#e28800]/10" : ""}
      >
        <div className="flex items-center space-x-1.5 shrink-0">
          <TaskCard.DragHandle listeners={listeners} attributes={attributes} />
          <TaskCard.Checkbox />
        </div>

        <TaskCard.Body />

        <div className="flex items-center space-x-2 shrink-0">
          <TaskCard.Pollen />
          <TaskCard.Actions />
        </div>
      </TaskCard>
    </div>
  );
};

/**
 * Organism: TaskBoard (Kanban View)
 *
 * DESIGN SYSTEM COMMENTARY (Senior/Staff Frontend Engineer):
 * - SRP: Orchestrates Kanban operations using dnd-kit, binding to Zustand + Dexie database layers.
 * - Accessibility: Uses verticalListSortingStrategy with custom Keyboard Sensors for keyboard movement support.
 * - Dynamic Save State: Renders a custom animation when IndexedDB actions conclude.
 */
export const TaskBoard: React.FC = () => {
  const language = useHiveStore((state) => state.language);
  const t = translations[language];

  // Derive active options list based on active language settings
  const categoryOptions = React.useMemo(() => {
    return language === "en" ? CATEGORY_OPTIONS_EN : CATEGORY_OPTIONS_ES;
  }, [language]);

  const tasks = useHiveStore((state) => state.tasks);
  const addTask = useHiveStore((state) => state.addTask);
  const toggleTask = useHiveStore((state) => state.toggleTask);
  const deleteTask = useHiveStore((state) => state.deleteTask);
  const updateTaskColumn = useHiveStore((state) => state.updateTaskColumn);
  const searchQuery = useHiveStore((state) => state.searchQuery);

  const { isSaving, isSaved } = useBeePersistence();
  const { showToast } = useBeeToasts();

  // Local state controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  interface TaskFormValues {
    title: string;
    priority: PriorityLevel;
    category: string;
    pollenValue: number;
  }

  const { register, handleSubmit, reset, control } = useForm<TaskFormValues>({
    defaultValues: {
      title: "",
      priority: PriorityLevel.MEDIUM,
      category: categoryOptions[0],
      pollenValue: 2,
    },
  });

  React.useEffect(() => {
    reset({
      title: "",
      priority: PriorityLevel.MEDIUM,
      category: categoryOptions[0],
      pollenValue: 2,
    });
  }, [language, reset, categoryOptions]);

  // Sensors formulation for @dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement before triggering drag, avoiding checkbox click interference
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleFormSubmit = (data: TaskFormValues) => {
    addTask(data.title.trim(), data.priority, data.category, data.pollenValue);
    showToast(
      language === "en"
        ? "New task submitted to the hive successfully!"
        : "¡Nueva labor ingresada al panal con éxito!",
      "honey",
    );
    reset();
    setIsFormOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    let targetColumnId: ColumnId | null = null;

    if (["todo", "in_progress", "completed"].includes(overId)) {
      targetColumnId = overId as ColumnId;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetColumnId = overTask.columnId;
      }
    }

    if (targetColumnId) {
      const activeTask = tasks.find((t) => t.id === taskId);
      if (activeTask && activeTask.columnId !== targetColumnId) {
        updateTaskColumn(taskId, targetColumnId);
      }
    }
  };

  // Filter tasks as specified by the search category control and current search string
  const filteredTasks = tasks.filter((t) => {
    const categoryMatches = categoryFilter === "all" ? true : t.category === categoryFilter;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return categoryMatches;

    const titleMatches = t.title.toLowerCase().includes(query);
    const notesMatches = (t.notes || "").toLowerCase().includes(query);

    return categoryMatches && (titleMatches || notesMatches);
  });

  return (
    <div className={THEME_CONFIG.components.glassCard}>
      {/* 1. Header Area with telemetry and action triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 flex-shrink-0 border-b border-[#ebdcb9]/30 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[#faf6ee] border border-[#ebdcb9] rounded-2xl shadow-inner text-[#e28800]">
            <LayoutGrid className="w-5 h-5 stroke-[2]" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-md font-bold text-[#100f0d] flex items-center gap-1.5">
              {t.kanban.title}
            </h3>
            <p className="text-xs text-[#5c5449]">
              {language === "en"
                ? "Plan your day by dragging tasks between cells"
                : "Planifica tu jornada arrastrando tareas entre las celdas"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {/* Micro-Animation: Néctar Guardado Persistence Alerts */}
          <div className="h-8 flex items-center">
            <AnimatePresence mode="popLayout">
              {isSaving && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, scale: 0.85, x: 12 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-1.5 bg-[#e28800]/5 text-[#e28800] border border-[#ebdcb9]/40 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e28800] animate-ping" />
                  <span>{language === "en" ? "Distilling..." : "Destilando..."}</span>
                </motion.div>
              )}
              {isSaved && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.85, x: 12 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm"
                >
                  <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-[#15803d]">
                    <path d="M 50 5 L 91 29 L 91 71 L 50 95 L 9 71 L 9 29 Z" />
                  </svg>
                  <span>{language === "en" ? "Nectar Saved" : "Néctar Guardado"}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <HexButton
            variant={isFormOpen ? "secondary" : "primary"}
            onClick={() => setIsFormOpen(!isFormOpen)}
            size="sm"
          >
            {isFormOpen ? (
              language === "en" ? (
                "Close"
              ) : (
                "Cerrar"
              )
            ) : (
              <span className="flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.kanban.newBtn}</span>
              </span>
            )}
          </HexButton>
        </div>
      </div>

      {/* 2. Slideout task entry block form with spring layout */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0, scaleY: 0.95 }}
            animate={{ height: "auto", opacity: 1, scaleY: 1 }}
            exit={{ height: 0, opacity: 0, scaleY: 0.95 }}
            transition={{
              duration: THEME_CONFIG.motion.duration,
              ease: THEME_CONFIG.motion.easeSpring,
            }}
            onSubmit={handleSubmit(handleFormSubmit)}
            className="overflow-hidden mb-6 p-4 border border-[#ebdcb9] bg-[#faf6ee]/65 rounded-2xl flex flex-col space-y-4"
          >
            <div>
              <label
                htmlFor="task-description"
                className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1.5"
              >
                {t.kanban.formTitle}
              </label>
              <input
                id="task-description"
                type="text"
                placeholder={t.kanban.formTitlePlaceholder}
                {...register("title", { required: true, maxLength: 90 })}
                className="w-full bg-white border border-[#ebdcb9] focus:border-[#e28800] rounded-xl px-3.5 py-2.5 text-sm text-[#100f0d] placeholder-[#ebdcb9]/80 outline-none transition-colors duration-200 shadow-sm"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="task-priority"
                  className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1.5"
                >
                  {t.kanban.formPriority}
                </label>
                <select
                  id="task-priority"
                  {...register("priority")}
                  className="w-full bg-white border border-[#ebdcb9] focus:border-[#e28800] rounded-xl px-3 py-2 text-xs text-[#100f0d] outline-none transition-all shadow-sm cursor-pointer"
                >
                  <option value={PriorityLevel.LOW}>{t.kanban.priorityLow}</option>
                  <option value={PriorityLevel.MEDIUM}>{t.kanban.priorityMedium}</option>
                  <option value={PriorityLevel.HIGH}>{t.kanban.priorityHigh}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-category"
                  className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1.5"
                >
                  {language === "en" ? "Depot (Category)" : "Depósito (Categoría)"}
                </label>
                <select
                  id="task-category"
                  {...register("category")}
                  className="w-full bg-white border border-[#ebdcb9] focus:border-[#e28800] rounded-xl px-3 py-2 text-xs text-[#100f0d] outline-none transition-all shadow-sm cursor-pointer"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1.5">
                  {t.kanban.formPollen}
                </label>
                <Controller
                  control={control}
                  name="pollenValue"
                  render={({ field }) => (
                    <div
                      className="flex items-center space-x-1.5 h-[34px]"
                      role="group"
                      aria-label="Selector de esfuerzo de polen"
                    >
                      {[1, 2, 3, 4, 5].map((u) => (
                        <button
                          type="button"
                          key={u}
                          onClick={() => field.onChange(u)}
                          className="group relative focus:outline-none cursor-pointer"
                          title={language === "en" ? `${u} pollen units` : `${u} unidades de polen`}
                          aria-label={
                            language === "en"
                              ? `${u} of 5 workload cells`
                              : `${u} de 5 celdas de esfuerzo`
                          }
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 100 100"
                            className={`transition-colors duration-200 fill-current ${
                              u <= field.value
                                ? "text-[#faa715] filter drop-shadow-[0_0_4px_rgba(250,167,21,0.4)]"
                                : "text-stone-200 hover:text-[#faa715]/40"
                            }`}
                          >
                            <path d="M 50 0 L 100 25 L 100 75 L 50 100 L 0 75 L 0 25 Z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#ebdcb9]/40">
              <HexButton type="submit" size="sm">
                {language === "en" ? "Submit into Hive" : "Ingresar en el Panal"}
              </HexButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 3. Category Filter Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3">
        <div className="flex items-center space-x-1">
          <Sparkles className="w-4 h-4 text-[#e28800]" aria-hidden="true" />
          <span className="text-[10px] uppercase font-bold text-[#5c5449] tracking-widest">
            {language === "en" ? "KanBan Foraging Board" : "Tablero de Producción KanBan"}
          </span>
        </div>

        <div className="relative flex items-center bg-white border border-[#ebdcb9] px-3.5 py-1.5 rounded-xl text-xs text-[#5c5449] hover:border-[#e28800] transition-colors shadow-sm cursor-pointer min-w-[190px]">
          <label htmlFor="taskboard-category-select" className="font-bold mr-1.5">
            {language === "en" ? "Category:" : "Categoría:"}
          </label>
          <select
            id="taskboard-category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent bg-none border-none text-[#5c5449] font-black outline-none pr-4 cursor-pointer w-full"
            aria-label="Filtrar por categoría del panal"
          >
            <option value="all">{t.kanban.filterAll}</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-3.5 h-3.5 text-stone-400 absolute right-3 pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* 4. Drag & Drop columns mapping */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:min-w-[960px] xl:min-w-full">
            {[
              {
                id: "todo" as ColumnId,
                title: t.kanban.colTodo,
                color: "border-[#ebdcb9]/45 bg-[#faf6ee]/10",
                label: language === "en" ? "Pending foraging queue" : "Cola de acopio pendiente",
              },
              {
                id: "in_progress" as ColumnId,
                title: t.kanban.colInProgress,
                color: "border-amber-500/10 bg-amber-500/5",
                label: language === "en" ? "Tasks in maturation" : "Labores en maduración",
              },
              {
                id: "completed" as ColumnId,
                title: t.kanban.colCompleted,
                color: "border-emerald-500/10 bg-emerald-500/5",
                label:
                  language === "en" ? "Honeycombs filled with honey" : "Celdas colmadas de miel",
              },
            ].map((column) => {
              const columnTasks = filteredTasks.filter((t) => t.columnId === column.id);

              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  language={language}
                >
                  <SortableContext
                    items={columnTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {columnTasks.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[#ebdcb9]/40 rounded-2xl bg-[#faf6ee]/10">
                            <Inbox className="w-5 h-5 text-[#ebdcb9]/80 mb-2" aria-hidden="true" />
                            <span className="text-[10px] text-[#5c5449] font-bold">
                              {language === "en" ? "Empty Cell" : "Celda Vacía"}
                            </span>
                          </div>
                        ) : (
                          columnTasks.map((task) => (
                            <SortableTaskItem
                              key={task.id}
                              task={task}
                              onToggle={async () => {
                                await toggleTask(task.id);
                                showToast(
                                  task.completed ? t.toasts.taskActive : t.toasts.taskCompleted,
                                  "success",
                                );
                              }}
                              onDelete={async () => {
                                await deleteTask(task.id);
                                showToast(
                                  language === "en"
                                    ? "Task discarded from the hive"
                                    : "Labor descartada del panal",
                                  "warning",
                                );
                              }}
                            />
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </SortableContext>
                </KanbanColumn>
              );
            })}
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default TaskBoard;
