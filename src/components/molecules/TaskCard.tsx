import React, { createContext, useContext, useState, lazy, Suspense } from "react";
import { Check, Trash2, GripVertical, FileText, Loader2 } from "lucide-react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { Task, PriorityLevel } from "@/types";
import { THEME_CONFIG } from "@/theme.config";
import { Badge } from "@/components/atoms/Badge";
import { PollenIndicator } from "@/components/atoms/PollenIndicator";
import { motion, AnimatePresence } from "motion/react";

const LazyMarkdownNotesEditor = lazy(() => import("../organisms/MarkdownNotesEditor"));

// Context interface to link parent TaskCard compound components
interface TaskCardContextProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  isNotesOpen: boolean;
  setIsNotesOpen: (open: boolean) => void;
}

const TaskCardContext = createContext<TaskCardContextProps | null>(null);

function useTaskCardContext() {
  const context = useContext(TaskCardContext);
  if (!context) {
    throw new Error(
      "TaskCard compound elements must be encapsulated inside a <TaskCard> container.",
    );
  }
  return context;
}

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * Molecule: TaskCard (Compound Host Container with support for markdown notes)
 *
 * DESIGN ARCHITECTURE BRIEF (Staff/Senior Frontend Engineer):
 * - Compound Pattern: Allows callers to structure checkboxes, text bodies, effort marks,
 *   drag handles, and actions recursively without altering internal model logic.
 * - Code-splitting: Utilizes React.lazy and Suspense to only download Markdown Editor asset
 *   on request, satisfying SEO & performance requirements.
 */
export const TaskCard: React.FC<TaskCardProps> & {
  Checkbox: React.FC;
  Body: React.FC;
  Pollen: React.FC;
  Actions: React.FC;
  DragHandle: React.FC<{ listeners?: SyntheticListenerMap; attributes?: DraggableAttributes }>;
} = ({ task, onToggle, onDelete, children, className = "", id }) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  return (
    <TaskCardContext.Provider value={{ task, onToggle, onDelete, isNotesOpen, setIsNotesOpen }}>
      <motion.div
        layout
        id={id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration: THEME_CONFIG.motion.duration,
          ease: THEME_CONFIG.motion.easeSpring,
        }}
        className={`flex flex-col border ${
          task.completed
            ? "border-[#ebdcb9]/40 bg-white/40 opacity-70"
            : "border-[#ebdcb9] bg-white/85 shadow-[0_2px_12px_rgba(110,80,45,0.03)]"
        } rounded-2xl p-3 md:p-4 transition-all duration-300 relative overflow-hidden group hover:shadow-[0_8px_24px_rgba(226,136,0,0.06)] hover:border-[#e28800]/30 ${className}`}
      >
        {/* Main Item Row layout */}
        <div className="flex items-center justify-between w-full">{children}</div>

        {/* Collapsible Lazy Markdown editor module */}
        <AnimatePresence>
          {isNotesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full overflow-hidden"
            >
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-6 text-xs text-stone-400 space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#e28800]" />
                    <span>Cargando editor del panal...</span>
                  </div>
                }
              >
                <LazyMarkdownNotesEditor
                  taskId={task.id}
                  initialValue={task.notes || ""}
                  onClose={() => setIsNotesOpen(false)}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TaskCardContext.Provider>
  );
};

// 1. Compound Checklist Hex-Button
TaskCard.Checkbox = function TaskCardCheckbox() {
  const { task, onToggle } = useTaskCardContext();
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative w-8 h-8 flex items-center justify-center shrink-0 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#ebdcb9] rounded-lg cursor-pointer"
      aria-label={task.completed ? "Marcar labor como incompleta" : "Completar labor del panal"}
    >
      <svg
        viewBox="0 0 100 100"
        className={`absolute inset-0 w-full h-full transition-all duration-300 stroke-[5.5] stroke-linejoin-round ${
          task.completed
            ? "fill-[#e28800] stroke-[#e28800] filter drop-shadow-[0_0_8px_rgba(226,136,0,0.3)]"
            : "fill-transparent stroke-stone-300 group-hover:stroke-[#e28800]/50"
        }`}
      >
        <path d="M 50 5 L 91 29 L 91 71 L 50 95 L 9 71 L 9 29 Z" />
      </svg>
      {task.completed && <Check className="w-4 h-4 text-white stroke-[3.5] relative z-10" />}
    </button>
  );
};

// 2. Compound Text Metadata Body
TaskCard.Body = function TaskCardBody() {
  const { task, setIsNotesOpen, isNotesOpen } = useTaskCardContext();

  const priorityMap: Record<PriorityLevel, "high" | "medium" | "low"> = {
    [PriorityLevel.HIGH]: "high",
    [PriorityLevel.MEDIUM]: "medium",
    [PriorityLevel.LOW]: "low",
  };

  const priorityLabelMap: Record<PriorityLevel, string> = {
    [PriorityLevel.HIGH]: "Prioridad Alta",
    [PriorityLevel.MEDIUM]: "Prioridad Media",
    [PriorityLevel.LOW]: "Prioridad Baja",
  };

  return (
    <div className="flex-1 min-w-0 mx-3">
      <button
        type="button"
        onClick={() => setIsNotesOpen(!isNotesOpen)}
        className={`text-sm font-semibold tracking-wide block truncate text-left w-full transition-all duration-300 hover:text-[#e28800] cursor-pointer ${
          task.completed ? "line-through text-[#5c5449]/65" : "text-[#100f0d]"
        }`}
        title="Ver notas de este ítem"
        aria-label={`${isNotesOpen ? "Cerrar" : "Abrir"} notas de ${task.title}`}
      >
        {task.title}
      </button>
      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
        <Badge variant="neutral" className="text-[10px] px-1.5 py-0.5">
          {task.category}
        </Badge>
        <Badge variant={priorityMap[task.priority]} className="text-[10px] px-1.5 py-0.5">
          {priorityLabelMap[task.priority]}
        </Badge>
      </div>
    </div>
  );
};

// 3. Compound Pollen Rating (Effort cells)
TaskCard.Pollen = function TaskCardPollen() {
  const { task } = useTaskCardContext();
  return (
    <PollenIndicator
      units={task.pollenUnits}
      completed={task.completed}
      className="hidden sm:flex"
    />
  );
};

// 4. Compound Action Controls (Trash bin button & notes icon toggle)
TaskCard.Actions = function TaskCardActions() {
  const { task, onDelete, isNotesOpen, setIsNotesOpen } = useTaskCardContext();

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <button
        type="button"
        onClick={() => setIsNotesOpen(!isNotesOpen)}
        className={`p-1.5 rounded-lg transition-all focus:outline-none cursor-pointer flex items-center justify-center relative ${
          isNotesOpen
            ? "text-[#e28800] bg-amber-500/10 border border-amber-500/20"
            : "text-stone-300 hover:text-[#e28800] hover:bg-stone-100 opacity-60 group-hover:opacity-100"
        }`}
        aria-label="Ver notas de labor"
        title="Notas de esta labor"
      >
        <FileText className="w-4 h-4" />
        {task.notes && task.notes.trim().length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#e28800] rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 text-stone-300 hover:text-[#b91c1c] hover:bg-red-50 rounded-lg transition-all opacity-100 focus:outline-none cursor-pointer"
        aria-label="Eliminar labor"
        title="Eliminar labor"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// 5. Compound Drag Handle for Sortable
TaskCard.DragHandle = function TaskCardDragHandle({ listeners, attributes }) {
  return (
    <div
      {...attributes}
      {...listeners}
      className="p-1 text-stone-300 hover:text-[#e28800] rounded-md transition-all cursor-grab active:cursor-grabbing hover:bg-amber-500/10"
      title="Arrastrar labor"
      role="button"
      aria-label="Manija para ordenar labor"
    >
      <GripVertical className="w-4 h-4" />
    </div>
  );
};
