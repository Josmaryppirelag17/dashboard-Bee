import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Award, Check } from "lucide-react";
import { motion } from "motion/react";
import { useHiveStore } from "@/store/useHiveStore";
import { useBeeToasts } from "@/context/BeeToastContext";
import { playTone } from "@/utils/audio";
import { translations } from "@/utils/translations";

interface FocusTimerProps {
  onSessionComplete?: (hivesEarned: number) => void;
}

/**
 * Organism: FocusTimer
 *
 * DESIGN ARCHITECTURE BRIEF (Staff Frontend Engineer):
 * - SRP: Orchestrates Pomodoro state machines (run, break, interval ticks) and tactile feedback.
 * - Hardware Acceleration: Progress hexagons utilize Framer Motion spring updates.
 */
export const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete }) => {
  const language = useHiveStore((state) => state.language);
  const t = translations[language];

  // Customizable session durations (minutes)
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // Pomodoro timer states
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Hooking to our central state store
  const storeTasks = useHiveStore((state) => state.tasks);
  const toggleTask = useHiveStore((state) => state.toggleTask);
  const updateTaskColumn = useHiveStore((state) => state.updateTaskColumn);
  const { showToast } = useBeeToasts();

  // User-selected task to auto-complete on timer finish
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  // Completion confirmation state: null = no confirmation needed, true = completed, false = not completed
  const [completionPending, setCompletionPending] = useState<{
    taskId: string;
    taskTitle: string;
  } | null>(null);

  // Dynamically map cells directly to ALL user-supplied tasks (no fixed limit, no placeholders)
  const cells = React.useMemo(() => {
    return storeTasks.map((task) => ({
      id: task.id,
      completed: task.completed,
      title: task.title,
    }));
  }, [storeTasks]);

  // Pending/in-progress tasks available for selection
  const availableTasks = React.useMemo(() => {
    return storeTasks.filter((t) => t.columnId !== "completed");
  }, [storeTasks]);

  // Reset selected task if it gets completed or deleted
  useEffect(() => {
    if (
      selectedTaskId &&
      !storeTasks.find((t) => t.id === selectedTaskId && t.columnId !== "completed")
    ) {
      setSelectedTaskId(null);
    }
  }, [storeTasks, selectedTaskId]);

  // Build honeycomb rows: alternating 2, 3, 2, 3...
  const honeycombRows = React.useMemo(() => {
    const rows: { cells: typeof cells; isOffset: boolean }[] = [];
    let i = 0;
    let rowSize = 2;
    while (i < cells.length) {
      const size = Math.min(rowSize, cells.length - i);
      rows.push({
        cells: cells.slice(i, i + size),
        isOffset: rows.length > 0,
      });
      i += size;
      rowSize = rowSize === 2 ? 3 : 2;
    }
    return rows;
  }, [cells]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const handleTimerCompleteRef = useRef<() => Promise<void>>(async () => {});

  // Keep seconds in sync if the timer is inactive and user adjusts times
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft((isBreak ? breakMinutes : workMinutes) * 60);
    }
  }, [workMinutes, breakMinutes, isBreak, isRunning]);

  // Timer countdown hook - ONLY decrements, no side effects
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Separate effect: detect when timer hits 0 and complete session
  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      handleTimerCompleteRef.current();
    }
  }, [secondsLeft, isRunning]);

  const handleTimerComplete = async () => {
    setIsRunning(false);

    if (soundEnabled) {
      playTone({ frequency: 520, type: "sine", gain: 0.2, duration: 1.0 });
    }

    if (!isBreak) {
      if (selectedTaskId) {
        const task = storeTasks.find((t) => t.id === selectedTaskId);
        if (task) {
          setCompletionPending({ taskId: selectedTaskId, taskTitle: task.title });
        } else {
          onSessionComplete?.(workMinutes);
          setIsBreak(true);
          setSecondsLeft(breakMinutes * 60);
          showToast(t.toasts.sessionCompletePollen, "success");
        }
      } else {
        onSessionComplete?.(workMinutes);
        setIsBreak(true);
        setSecondsLeft(breakMinutes * 60);
        showToast(t.toasts.sessionCompletePollen, "success");
      }
    } else {
      setIsBreak(false);
      setSecondsLeft(workMinutes * 60);
      showToast(t.toasts.breakDoneReturn, "info");
    }
  };
  handleTimerCompleteRef.current = handleTimerComplete;

  const confirmCompletion = async (completed: boolean) => {
    if (!completionPending) return;
    const { taskId } = completionPending;
    setCompletionPending(null);

    if (completed) {
      await toggleTask(taskId);
      showToast(t.toasts.taskCompleted, "success");
    } else {
      await updateTaskColumn(taskId, "todo");
      showToast(
        language === "en" ? "Task moved back to pending" : "Tarea devuelta a pendiente",
        "info",
      );
    }

    setSelectedTaskId(null);
    onSessionComplete?.(workMinutes);
    setIsBreak(true);
    setSecondsLeft(breakMinutes * 60);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft((isBreak ? breakMinutes : workMinutes) * 60);
  };

  const handleCellClick = async (cellId: string) => {
    await toggleTask(cellId);

    const task = storeTasks.find((t) => t.id === cellId);
    if (task) {
      const nextCompleted = !task.completed;
      if (nextCompleted) {
        onSessionComplete?.(workMinutes);
        showToast(t.toasts.taskCompleted, "success");
        if (selectedTaskId === cellId) setSelectedTaskId(null);
      } else {
        showToast(t.toasts.taskActive, "success");
      }
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const timerTotal = (isBreak ? breakMinutes : workMinutes) * 60;
  const timePercent = ((timerTotal - secondsLeft) / (timerTotal || 1)) * 100;
  const timerCirclePerim = 272;
  const timerOffset = timerCirclePerim - (timerCirclePerim * timePercent) / 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative">
      {/* 1. Timer Control card (Left side) */}
      <div className="lg:col-span-5 bg-white/75 backdrop-blur-md border border-[#ebdcb9]/60 rounded-3xl p-6 shadow-[0_10px_35px_rgba(110,80,45,0.04)] flex flex-col justify-between items-center relative overflow-hidden text-center min-h-[420px]">
        <div className="absolute top-[-40px] left-[-40px] w-48 h-48 bg-[#e28800]/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="w-full relative z-10">
          <span className="text-[10px] font-bold tracking-widest text-[#e28800] uppercase block mb-1">
            {isBreak ? t.timer.breakTag : t.timer.focusTitleActive}
          </span>
          <h3 className="text-md font-bold text-[#100f0d]">
            {language === "en" ? "Foraging Rhythm" : "Ritmo de Polinización"}
          </h3>
          <p className="text-xs text-[#5c5449] max-w-xs mx-auto leading-relaxed mt-1 mb-3">
            {t.timer.description}
          </p>

          {/* Configurable Session Durations Selector */}
          <div className="flex flex-col items-center space-y-3 bg-[#faf6ee]/70 border border-[#ebdcb9]/40 p-3.5 rounded-2xl max-w-xs mx-auto mb-2">
            <div className="flex flex-col space-y-1.5 w-full">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c5449]">
                  {t.timer.focusTag}
                </span>
                <span className="text-xs font-mono font-bold text-[#e28800]">
                  {workMinutes} min
                </span>
              </div>
              <div className="flex items-center space-x-1.5 w-full">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => !isRunning && setWorkMinutes(mins)}
                    disabled={isRunning}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold font-mono transition-all border ${
                      workMinutes === mins
                        ? "bg-[#e28800] border-[#e28800] text-white shadow-sm"
                        : "bg-white border-[#ebdcb9]/50 text-[#5c5449] hover:bg-[#ebdcb9]/10 disabled:opacity-50"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={workMinutes}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(120, parseInt(e.target.value) || 25));
                    setWorkMinutes(val);
                  }}
                  disabled={isRunning}
                  className="w-10 bg-white border border-[#ebdcb9]/60 rounded-lg py-0.5 text-center font-mono text-[10px] font-extrabold text-[#e28800] outline-none disabled:opacity-50"
                  aria-label={
                    language === "en" ? "Custom focus minutes" : "Minutos de foco personalizados"
                  }
                  title={
                    language === "en" ? "Custom focus minutes" : "Minutos de foco personalizados"
                  }
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5 w-full border-t border-[#ebdcb9]/20 pt-2.5">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c5449]">
                  {t.timer.breakTag}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {breakMinutes} min
                </span>
              </div>
              <div className="flex items-center space-x-1.5 w-full">
                {[3, 5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => !isRunning && setBreakMinutes(mins)}
                    disabled={isRunning}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold font-mono transition-all border ${
                      breakMinutes === mins
                        ? "bg-emerald-700 border-emerald-700 text-white shadow-sm"
                        : "bg-white border-[#ebdcb9]/50 text-[#5c5449] hover:bg-[#ebdcb9]/10 disabled:opacity-50"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={breakMinutes}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(60, parseInt(e.target.value) || 5));
                    setBreakMinutes(val);
                  }}
                  disabled={isRunning}
                  className="w-10 bg-white border border-[#ebdcb9]/60 rounded-lg py-0.5 text-center font-mono text-[10px] font-extrabold text-emerald-700 outline-none disabled:opacity-50"
                  aria-label={
                    language === "en"
                      ? "Custom break minutes"
                      : "Minutos de descanso personalizados"
                  }
                  title={
                    language === "en"
                      ? "Custom break minutes"
                      : "Minutos de descanso personalizados"
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Big Hexagonal Countdown */}
        <div
          className="my-6 relative w-44 h-44 flex items-center justify-center select-none group"
          role="timer"
          aria-live="polite"
          aria-label="Temporizador Pomodoro"
        >
          <svg className="absolute inset-0 w-full h-full transform" viewBox="0 0 100 100">
            <path
              d="M 50 5 L 90 28 L 90 72 L 50 95 L 10 72 L 10 28 Z"
              fill="none"
              stroke="#ebdcb9"
              strokeWidth="4"
              strokeLinejoin="round"
              opacity="0.55"
            />
            <motion.path
              d="M 50 5 L 90 28 L 90 72 L 50 95 L 10 72 L 10 28 Z"
              fill="none"
              stroke={isBreak ? "#15803d" : "#e28800"}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={timerCirclePerim}
              animate={{ strokeDashoffset: timerOffset }}
              transition={{ ease: "easeOut", duration: 0.3 }}
              className="drop-shadow-[0_0_8px_rgba(226,136,0,0.22)]"
            />
          </svg>

          <div className="text-center relative z-10 transition-transform duration-300 group-hover:scale-105">
            <span className="text-3xl font-extrabold tracking-tight text-[#100f0d] block font-mono">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-widest text-[#5c5449] mt-1 pr-0.5 inline-block">
              {isBreak
                ? language === "en"
                  ? "RELAX"
                  : "Relajarse"
                : language === "en"
                  ? "FOCUS"
                  : "Foco Activado"}
            </span>
          </div>
        </div>

        {/* Timer main actions bar */}
        <div className="w-full relative z-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            {/* Buzzer Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border transition-all duration-200 focus:outline-none cursor-pointer ${
                soundEnabled
                  ? "bg-amber-500/10 border-amber-500/40 text-[#e28800]"
                  : "bg-white border-[#ebdcb9] text-[#5c5449]/70 hover:bg-[#faf6ee]"
              }`}
              aria-label={
                soundEnabled
                  ? language === "en"
                    ? "Mute sound"
                    : "Silenciar sonido"
                  : language === "en"
                    ? "Enable sound"
                    : "Activar sonido"
              }
              title={
                soundEnabled
                  ? language === "en"
                    ? "Bee buzz enabled"
                    : "Zumbido abeja activado"
                  : language === "en"
                    ? "Muted"
                    : "Silenciado"
              }
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={toggleTimer}
              aria-pressed={isRunning}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 select-none flex items-center space-x-2 focus:outline-none cursor-pointer ${
                isRunning
                  ? "bg-stone-100 border border-stone-200 text-[#5c5449] hover:bg-stone-200/60"
                  : "bg-gradient-to-r from-amber-500 to-[#faa715] text-[#100f0d] shadow-[0_4px_16px_rgba(226,136,0,0.2)] hover:shadow-[0_4px_22px_rgba(226,136,0,0.35)] font-black"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4.5 h-4.5 text-[#5c5449]" />
                  <span>{t.timer.pause}</span>
                </>
              ) : (
                <>
                  <Play className="w-4.5 h-4.5 text-black fill-current" />
                  <span>{language === "en" ? "Focus" : "Enfocar"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetTimer}
              className="p-2.5 bg-white border border-[#ebdcb9] text-[#5c5449] rounded-xl hover:border-[#e28800] hover:text-[#e28800] transition-all focus:outline-none cursor-pointer"
              aria-label={language === "en" ? "Reset timer" : "Reiniciar temporizador"}
              title={t.timer.resetInterval}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Completion confirmation */}
          {completionPending && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white border-2 border-[#e28800] rounded-2xl p-4 mb-3 text-center shadow-lg"
            >
              <p className="text-xs font-bold text-[#100f0d] mb-3">
                {language === "en" ? "Did you complete this task?" : "¿Completaste esta labor?"}
              </p>
              <p className="text-[11px] text-[#5c5449] mb-3 truncate font-semibold">
                {completionPending.taskTitle}
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => confirmCompletion(true)}
                  className="px-4 py-2 bg-[#e28800] text-white text-xs font-bold rounded-xl hover:bg-[#d07a00] transition-all cursor-pointer"
                >
                  {language === "en" ? "Yes, complete it" : "Sí, completada"}
                </button>
                <button
                  type="button"
                  onClick={() => confirmCompletion(false)}
                  className="px-4 py-2 bg-stone-100 border border-[#ebdcb9] text-[#5c5449] text-xs font-bold rounded-xl hover:bg-stone-200 transition-all cursor-pointer"
                >
                  {language === "en" ? "No, move to pending" : "No, devolver a pendiente"}
                </button>
              </div>
            </motion.div>
          )}

          <div className="w-full bg-[#faf6ee]/80 border border-[#ebdcb9] rounded-2xl px-3.5 py-2">
            <span className="text-[8.5px] uppercase font-bold text-[#5c5449] block tracking-widest mb-1">
              {t.timer.assignedTask}
            </span>
            {availableTasks.length === 0 ? (
              <span className="block text-xs text-[#5c5449] font-medium text-center italic">
                {language === "en"
                  ? "No pending tasks — add one in the Kanban board"
                  : "Sin tareas pendientes — agrega una en el Kanban"}
              </span>
            ) : (
              <select
                value={selectedTaskId || ""}
                onChange={(e) => {
                  const id = e.target.value || null;
                  setSelectedTaskId(id);
                  if (id) {
                    const task = storeTasks.find((t) => t.id === id);
                    if (task && task.columnId === "todo") {
                      updateTaskColumn(id, "in_progress");
                    }
                  }
                }}
                disabled={isRunning}
                className="w-full bg-white border border-[#ebdcb9] rounded-xl px-2.5 py-1.5 text-xs text-[#100f0d] font-semibold text-center outline-none focus:border-[#e28800] transition-colors cursor-pointer disabled:opacity-50"
                aria-label={t.timer.assignedTask}
              >
                <option value="">
                  {language === "en"
                    ? "-- Select a task to auto-complete --"
                    : "-- Elegir labor para completar --"}
                </option>
                {availableTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title} (
                    {task.columnId === "in_progress"
                      ? language === "en"
                        ? "in progress"
                        : "en proceso"
                      : language === "en"
                        ? "pending"
                        : "pendiente"}
                    )
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* 2. Honeycomb matrix panel (Right side) */}
      <div className="lg:col-span-7 bg-white/75 backdrop-blur-md border border-[#ebdcb9]/60 rounded-3xl p-6 shadow-[0_10px_35px_rgba(110,80,45,0.04)] flex flex-col justify-between min-h-[420px]">
        <div className="flex items-center justify-between mb-4.5 flex-shrink-0">
          <div>
            <h3 className="text-md font-bold text-[#100f0d]">
              {language === "en" ? "Focus Cells" : "Celda de Foco"}
            </h3>
            <p className="text-xs text-[#5c5449]">
              {language === "en"
                ? "Click any cell to log immediate focus or complete pomodoros"
                : "Haz clic en una celda para registrar foco inmediato o completa pomodoros"}
            </p>
          </div>
          <div className="flex items-center space-x-1 bg-[#faf6ee] px-2.5 py-1.5 rounded-xl border border-[#ebdcb9]/60 font-mono text-[11px] font-bold text-[#e28800]">
            <span>
              {cells.filter((c) => c.completed).length}/{cells.length}
            </span>
            <span className="text-[10px] text-[#5c5449] font-sans">
              {language === "en" ? "cells ready" : "celdas listas"}
            </span>
          </div>
        </div>

        {/* Dynamic honeycomb layout */}
        <div className="flex flex-col items-center justify-center flex-1 py-3 my-4 overflow-y-auto">
          {cells.length === 0 ? (
            <div className="text-center py-10 text-[#5c5449]">
              <p className="text-xs font-bold">
                {language === "en"
                  ? "No tasks yet — head to the Kanban board to add some!"
                  : "Aún no hay labores — ¡ve al Kanban para agregar!"}
              </p>
            </div>
          ) : (
            honeycombRows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className={`flex justify-center space-x-3 ${row.isOffset ? "-mt-7" : ""} ${rowIdx < honeycombRows.length - 1 ? "mb-1.5" : ""}`}
              >
                {row.cells.map((cell) => {
                  const isSelected = cell.id === selectedTaskId;
                  return (
                    <button
                      type="button"
                      key={cell.id}
                      onClick={() => handleCellClick(cell.id)}
                      className="group relative focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <div className="w-24 h-[105px] relative flex items-center justify-center">
                        <svg
                          className="absolute inset-0 w-full h-full drop-shadow-[0_2px_8px_rgba(110,80,45,0.04)]"
                          viewBox="0 0 100 115"
                        >
                          <path
                            d="M 50 0 L 100 28.87 L 100 86.13 L 50 115 L 0 86.13 L 0 28.87 Z"
                            className={`transition-all duration-500 stroke-[5] stroke-linejoin-round ${
                              cell.completed
                                ? "fill-[#e28800] stroke-[#e28800] filter drop-shadow-[0_0_8px_rgba(226,136,0,0.3)]"
                                : isSelected
                                  ? "fill-amber-100 stroke-[#e28800] filter drop-shadow-[0_0_12px_rgba(226,136,0,0.35)]"
                                  : "fill-[#faf6ee]/70 stroke-[#ebdcb9] group-hover:stroke-[#e28800]/50"
                            }`}
                          />
                          {isSelected && !cell.completed && (
                            <path
                              d="M 50 0 L 100 28.87 L 100 86.13 L 50 115 L 0 86.13 L 0 28.87 Z"
                              fill="none"
                              stroke="#faa715"
                              strokeWidth="2"
                              strokeDasharray="6 4"
                              className="animate-pulse"
                            />
                          )}
                        </svg>

                        <div className="relative z-10 text-center px-2 select-none">
                          {cell.completed ? (
                            <Check className="w-6 h-6 text-white mx-auto stroke-[4] filter drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]" />
                          ) : isSelected ? (
                            <span className="text-[#e28800] font-mono text-[11px] font-bold">
                              ►
                            </span>
                          ) : null}
                          <span
                            className={`block text-[8.5px] truncate max-w-[70px] mt-1 ${cell.completed ? "text-white font-extrabold" : isSelected ? "text-[#e28800] font-extrabold" : "text-[#5c5449]"}`}
                          >
                            {cell.title}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Metric footer banner details */}
        <div className="pt-4 border-t border-[#ebdcb9]/45 flex items-center justify-between text-xs text-[#5c5449] flex-shrink-0">
          <span className="flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-[#e28800]" />
            <span>
              {language === "en" ? "Work Colony" : "Colonia de Trabajo"}:{" "}
              <strong className="text-[#e28800] font-bold">
                {language === "en" ? "Active Worker" : "Obrera Activa"}
              </strong>
            </span>
          </span>
          <span className="font-semibold text-[11px]">
            {cells.filter((c) => c.completed).length === cells.length && cells.length > 0
              ? t.timer.repleteNectar
              : t.timer.completeMinsGoal}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
