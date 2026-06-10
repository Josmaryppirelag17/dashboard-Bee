import React, { useState, useEffect, useRef, lazy, Suspense, useMemo } from "react";
import {
  Calendar,
  HelpCircle,
  Clock,
  BookOpen,
  Search,
  Download,
  Upload,
  Loader2,
  Award,
  Sparkles,
  Flame,
  Trophy,
  Sparkle,
  CheckCircle,
  Zap,
  Inbox,
} from "lucide-react";
import type { Metric } from "@/types";
import Sidebar from "@/components/organisms/Sidebar";
import { MainTemplate } from "@/components/organisms/MainTemplate";
import { MetricCard } from "@/components/organisms/MetricCard";

const TaskBoard = lazy(() => import("@/components/organisms/TaskBoard"));
const FocusTimer = lazy(() => import("@/components/organisms/FocusTimer"));
const StatsChart = lazy(() => import("@/components/organisms/StatsChart"));
const HiveProjectionCard = lazy(() => import("@/components/organisms/HiveProjectionCard"));

import { useTasks } from "@/hooks/useTasks";
import { useBeeStats } from "@/hooks/useBeeStats";
import { useHiveStore } from "@/store/useHiveStore";
import { useBeeToasts } from "@/context/BeeToastContext";
import { useSessionTracker } from "@/hooks/useSessionTracker";
import { translations } from "@/utils/translations";
import { parseTasksCSV } from "@/utils/importer";

function SectionFallback() {
  const language = useHiveStore((s) => s.language);
  return (
    <div
      className="flex flex-col items-center justify-center p-20 min-h-[400px]"
      role="status"
      aria-label="Cargando sección"
    >
      <Loader2 className="w-8 h-8 text-[#e28800] animate-spin mb-3" aria-hidden="true" />
      <span className="text-xs text-[#5c5449] font-bold uppercase tracking-widest animate-pulse">
        {language === "en" ? "Pollinating Components..." : "Polinizando Componentes..."}
      </span>
    </div>
  );
}

export default function App() {
  const language = useHiveStore((state) => state.language);
  const t = translations[language];

  const activeTab = useHiveStore((state) => state.activeTab);
  const setActiveTab = useHiveStore((state) => state.setActiveTab);
  const isSidebarCollapsed = useHiveStore((state) => state.isSidebarCollapsed);
  const setIsSidebarCollapsed = useHiveStore((state) => state.setSidebarCollapsed);
  const selectedMetricId = useHiveStore((state) => state.selectedMetricId);
  const setSelectedMetricId = useHiveStore((state) => state.setSelectedMetricId);
  const inAppHelpOpen = useHiveStore((state) => state.inAppHelpOpen);
  const setInAppHelpOpen = useHiveStore((state) => state.setInAppHelpOpen);
  const userBeeName = useHiveStore((state) => state.userBeeName);
  const level = useHiveStore((state) => state.level);
  const xp = useHiveStore((state) => state.xp);
  const unlockedAchievements = useHiveStore((state) => state.unlockedAchievements);
  const importTasks = useHiveStore((state) => state.importTasks);
  const hydrate = useHiveStore((state) => state.hydrate);

  // Deferred hydration — localStorage reads happen in idle time
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const setSearchQuery = useHiveStore((state) => state.setSearchQuery);
  const tasks = useHiveStore((state) => state.tasks);

  const [searchVal, setSearchVal] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useBeeToasts();
  const session = useSessionTracker();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (activeElement) {
        const tagName = activeElement.tagName.toUpperCase();
        const isEditable =
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true";
        if (isEditable) return;
      }
      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadTasks = useHiveStore((state) => state.loadTasks);
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const {
    completedTasksCount,
    totalTasksCount,
    taskCompletionRate,
    totalPollenProduced,
    clearCompletedTasks,
  } = useTasks();

  const { totalFocusMins, streakCount, recordFocusSession, hiveRank, activeStatusText } =
    useBeeStats();

  const xpNeeded = useMemo(() => level * 150, [level]);
  const xpPercentage = useMemo(
    () => Math.min(Math.round((xp / xpNeeded) * 100), 100),
    [xp, xpNeeded],
  );

  const handleSessionComplete = (minutes?: number) => {
    const mins = typeof minutes === "number" ? minutes : 25;
    recordFocusSession(mins);
    showToast(
      language === "en"
        ? `Focus session complete! You earned ${mins * 8} XP and registered ${mins} minutes of extra pollen.`
        : `¡Sesión de foco completada! Has ganado ${mins * 8} XP y registrado ${mins} minutos de polen extra.`,
      "success",
    );
  };

  const handleExportCSV = async () => {
    if (tasks.length === 0) {
      showToast(
        language === "en"
          ? "No tasks in the hive to export"
          : "No hay labores en el panal para exportar",
        "warning",
      );
      return;
    }
    setIsExporting(true);
    try {
      const { exportToCSV } = await import("./utils/exporter");
      await exportToCSV(tasks);
      showToast(
        language === "en"
          ? "Cells exported to CSV successfully!"
          : "¡Celdas exportadas a CSV con éxito!",
        "success",
      );
      useHiveStore.getState().unlockAchievement("honey-exporter");
    } catch (err) {
      console.error("CSV Extraction failed:", err);
      showToast(
        language === "en"
          ? "Error processing CSV export"
          : "Error al procesar la exportación del CSV",
        "warning",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0]!;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsedTasks = parseTasksCSV(text);
        if (parsedTasks.length === 0) {
          showToast(
            language === "en"
              ? "No valid tasks found in the uploaded file."
              : "No se encontraron labores válidas en el archivo subido.",
            "warning",
          );
          return;
        }
        await importTasks(parsedTasks);
        showToast(
          language === "en"
            ? `Successfully imported ${parsedTasks.length} tasks! (+150 XP)`
            : `¡Se ingresaron ${parsedTasks.length} labores correctamente! (+150 XP)`,
          "success",
        );
      } catch (err) {
        console.error("CSV Import parse failure:", err);
        showToast(
          language === "en"
            ? "Format issue - could not parse CSV."
            : "Error de compatibilidad - No se pudo procesar el CSV.",
          "warning",
        );
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleClearCompleted = async () => {
    await clearCompletedTasks();
    showToast(
      language === "en"
        ? "Cleared harvested tasks from the hive"
        : "Se han vaciado las labores recolectadas del panal",
      "success",
    );
  };

  const claimedQuests = useHiveStore((state) => state.claimedQuests);
  const claimQuest = useHiveStore((state) => state.claimQuest);
  const addXP = useHiveStore((state) => state.addXP);

  interface QuestDef {
    id: string;
    title: string;
    desc: string;
    condition: boolean;
    xpReward: number;
    progress: { current: number; target: number };
  }

  const quests = useMemo<QuestDef[]>(() => {
    const all: QuestDef[] = [
      {
        id: "q-create-1",
        title: language === "en" ? "Wax Sculptor" : "Escultor de Cera",
        desc: language === "en" ? "Create 1 task" : "Crea 1 labor",
        condition: totalTasksCount >= 1,
        xpReward: 30,
        progress: { current: Math.min(totalTasksCount, 1), target: 1 },
      },
      {
        id: "q-focus-1",
        title: language === "en" ? "First Flight" : "Primer Vuelo",
        desc: language === "en" ? "Accumulate 25 focus minutes" : "Acumula 25 minutos de foco",
        condition: totalFocusMins >= 25,
        xpReward: 50,
        progress: { current: Math.min(totalFocusMins, 25), target: 25 },
      },
      {
        id: "q-complete-1",
        title: language === "en" ? "Honeycomb Harvest" : "Cosecha de Panal",
        desc: language === "en" ? "Complete 1 task" : "Completa 1 labor",
        condition: completedTasksCount >= 1,
        xpReward: 40,
        progress: { current: Math.min(completedTasksCount, 1), target: 1 },
      },
    ];
    if (level >= 2) {
      all.push({
        id: "q-create-5",
        title: language === "en" ? "Cell Builder" : "Constructora de Celdas",
        desc: language === "en" ? "Create 5 tasks" : "Crea 5 labores",
        condition: totalTasksCount >= 5,
        xpReward: 60,
        progress: { current: Math.min(totalTasksCount, 5), target: 5 },
      });
      all.push({
        id: "q-complete-5",
        title: language === "en" ? "Nectar Collector" : "Recolectora de Néctar",
        desc: language === "en" ? "Complete 5 tasks" : "Completa 5 labores",
        condition: completedTasksCount >= 5,
        xpReward: 100,
        progress: { current: Math.min(completedTasksCount, 5), target: 5 },
      });
      all.push({
        id: "q-focus-100",
        title: language === "en" ? "Deep Worker" : "Trabajo Profundo",
        desc: language === "en" ? "Accumulate 100 focus minutes" : "Acumula 100 minutos de foco",
        condition: totalFocusMins >= 100,
        xpReward: 120,
        progress: { current: Math.min(totalFocusMins, 100), target: 100 },
      });
    }
    if (level >= 3) {
      all.push({
        id: "q-complete-15",
        title: language === "en" ? "Master Forager" : "Maestra del Panal",
        desc: language === "en" ? "Complete 15 tasks" : "Completa 15 labores",
        condition: completedTasksCount >= 15,
        xpReward: 200,
        progress: { current: Math.min(completedTasksCount, 15), target: 15 },
      });
      all.push({
        id: "q-focus-300",
        title: language === "en" ? "Focus Guru" : "Gurú del Foco",
        desc: language === "en" ? "Accumulate 300 focus minutes" : "Acumula 300 minutos de foco",
        condition: totalFocusMins >= 300,
        xpReward: 250,
        progress: { current: Math.min(totalFocusMins, 300), target: 300 },
      });
    }
    return all;
  }, [language, totalTasksCount, totalFocusMins, completedTasksCount, level]);

  const handleClaimQuest = (quest: QuestDef) => {
    if (!quest.condition || claimedQuests.includes(quest.id)) return;
    claimQuest(quest.id);
    addXP(quest.xpReward);
    showToast(
      language === "en"
        ? `Quest completed! +${quest.xpReward} XP`
        : `¡Misión completada! +${quest.xpReward} XP`,
      "success",
    );
  };

  const getFormattedDate = () => {
    const date = new Date("2026-06-05T22:53:11Z");
    return date.toLocaleDateString(language === "en" ? "en-US" : "es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const metricsList = useMemo(
    (): Metric[] => [
      {
        id: "focus-time",
        title: t.metrics.focusMins,
        value: `${totalFocusMins}m`,
        changeValue: "+15.2%",
        changeDirection: "up",
        iconName: "clock",
        subtext: language === "en" ? "Daily performance" : "Rendimiento diario",
        historyData: [120, 180, 150, 240, 200, 90, totalFocusMins],
        accentColor: "#e28800",
      },
      {
        id: "tasks-ratio",
        title: language === "en" ? "Completed Tasks" : "Labores Completadas",
        value: `${completedTasksCount}/${totalTasksCount}`,
        changeValue: `${taskCompletionRate}%`,
        changeDirection: taskCompletionRate > 50 ? "up" : "stable",
        iconName: "check-cycle",
        subtext: language === "en" ? "Goals percentage" : "Porcentaje de metas",
        historyData: [2, 4, 3, 5, 4, 6, completedTasksCount],
        accentColor: "#faa715",
      },
      {
        id: "pollen-produced",
        title: language === "en" ? "Harvested Pollen" : "Polen Cosechado",
        value: `${totalPollenProduced}u`,
        changeValue: language === "en" ? "Consistent" : "Consistente",
        changeDirection: "up",
        iconName: "zap",
        subtext: language === "en" ? "Accumulated effort" : "Esfuerzo acumulado",
        historyData: [15, 20, 22, 30, 28, 35, totalPollenProduced || 5],
        accentColor: "#e28800",
      },
      {
        id: "colony-streak",
        title: language === "en" ? "Colony Streak" : "Racha de la Colonia",
        value: language === "en" ? `${streakCount} days` : `${streakCount} días`,
        changeValue: language === "en" ? "Consistent" : "Consistente",
        changeDirection: "stable",
        iconName: "flame",
        subtext: language === "en" ? "Last active period" : "Último periodo activo",
        historyData: [1, 2, 3, 4, 4, 5, streakCount],
        accentColor: "#faa715",
      },
    ],
    [
      language,
      totalFocusMins,
      completedTasksCount,
      totalTasksCount,
      taskCompletionRate,
      totalPollenProduced,
      streakCount,
      t.metrics.focusMins,
    ],
  );

  const sidebarSlot = (
    <Sidebar
      currentTab={activeTab}
      onTabChange={setActiveTab}
      isCollapsed={isSidebarCollapsed}
      onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
    />
  );

  const headerSlot = (
    <header className="h-[72px] bg-white/70 backdrop-blur-md border-b border-[#ebdcb9]/60 px-4 sm:px-8 flex items-center justify-between flex-shrink-0 z-20">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <span className="text-[#e28800] bg-[#faf6ee] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[10px] sm:text-xs font-mono font-bold border border-[#ebdcb9]/60">
          {language === "en" ? "HIVE UTC" : "PANAL UTC"}
        </span>
        <div className="hidden lg:flex items-center space-x-2 text-xs text-[#5c5449] font-bold">
          <Calendar className="w-4 h-4 text-[#e28800]" />
          <span className="capitalize">{getFormattedDate()}</span>
        </div>
        <div className="flex items-center space-x-1.5 ml-2">
          <span
            className={`w-2 h-2 rounded-full ${session.isOnline ? "bg-emerald-500 animate-pulse" : "bg-stone-300"}`}
          />
          <span
            className="text-[9px] font-mono text-[#5c5449] font-bold hidden xl:inline"
            title={`ID: ${session.deviceId}`}
          >
            {session.formattedDuration}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-3 flex-1 max-w-sm mx-2 sm:mx-4">
        <div className="relative flex items-center w-full">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={language === "en" ? "Search task or note..." : "Buscar labor o nota..."}
            value={searchVal}
            onChange={(e) => {
              const val = e.target.value;
              setSearchVal(val);
              setSearchQuery(val);
            }}
            className="bg-[#faf6ee]/50 border border-[#ebdcb9]/60 focus:border-[#e28800] focus:bg-white rounded-xl pl-9 pr-8 py-1.5 text-xs text-[#100f0d] outline-none placeholder-stone-400/80 w-full transition-all shadow-inner"
            aria-label="Buscar labores"
          />
          <kbd className="absolute right-2.5 text-[9px] font-mono bg-white border border-[#ebdcb9]/75 text-stone-400 px-1 py-0.5 rounded-md pointer-events-none shadow-xs select-none">
            /
          </kbd>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-[#5c5449] hover:text-[#e28800] bg-white border border-[#ebdcb9] rounded-xl hover:bg-[#faf6ee] transition-all cursor-pointer focus:outline-none flex items-center space-x-1 text-xs font-bold"
          aria-label={language === "en" ? "Import tasks from CSV" : "Importar labores desde CSV"}
          title={
            language === "en" ? "Import tasks from CSV backup" : "Importar labores desde backup CSV"
          }
        >
          <Upload className="w-4 h-4 text-[#e28800]" />
          <span className="hidden sm:inline">
            {language === "en" ? "Import CSV" : "Importar CSV"}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImportCSV}
          className="hidden"
        />
        <button
          type="button"
          disabled={isExporting}
          onClick={handleExportCSV}
          className="p-2 text-[#5c5449] hover:text-[#e28800] bg-white border border-[#ebdcb9] rounded-xl hover:bg-[#faf6ee] transition-all cursor-pointer focus:outline-none flex items-center space-x-1 text-xs font-bold"
          aria-label={language === "en" ? "Export data to CSV" : "Exportar datos a CSV"}
          title={language === "en" ? "Export data to CSV" : "Exportar datos a CSV"}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#e28800]" />
          ) : (
            <Download className="w-4 h-4 text-[#e28800]" />
          )}
          <span className="hidden sm:inline">
            {language === "en" ? "Export CSV" : "Exportar CSV"}
          </span>
        </button>
        <button
          type="button"
          className="p-2 text-[#5c5449] hover:text-[#e28800] bg-white border border-[#ebdcb9] rounded-xl hover:bg-[#faf6ee] transition-all cursor-pointer focus:outline-none"
          aria-label={language === "en" ? "Beekeeper's Manual" : "Manual del Apicultor"}
          title={language === "en" ? "Beekeeper's Manual" : "Manual del Apicultor"}
          onClick={() => setInAppHelpOpen(!inAppHelpOpen)}
        >
          <HelpCircle className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );

  return (
    <MainTemplate sidebar={sidebarSlot} header={headerSlot}>
      {inAppHelpOpen && (
        <div className="mb-6 bg-white/95 border border-[#e28800] p-5 rounded-2xl shadow-md z-30 relative select-none animate-fade-in text-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-[#e28800] flex items-center gap-1.5 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              {language === "en" ? "Chief Beekeeper Manual" : "Manual del Apicultor Jefe"}
            </h4>
            <button
              onClick={() => setInAppHelpOpen(false)}
              className="text-xs text-[#5c5449] hover:text-stone-800 font-bold"
            >
              {language === "en" ? "Close" : "Cerrar"}
            </button>
          </div>
          {language === "en" ? (
            <>
              <p className="text-xs text-[#5c5449] leading-relaxed">
                Welcome to <strong>BeeHive Productivity</strong>! Maximize your yield:
              </p>
              <ul className="text-xs text-[#5c5449] list-disc ml-5 mt-2 space-y-1">
                <li>
                  <strong>Swarm Progression</strong>: Complete chores and run timer flights to level
                  up your Hive. Randomize bee personas anytime in the lower profile dashboard.
                </li>
                <li>
                  <strong>CSV Backups</strong>: Safeguard your tasks via "Export CSV" and restore
                  datasets fluidly anytime through the newly integrated "Import CSV" module!
                </li>
                <li>
                  <strong>Core Metrics</strong>: Real-time monitoring of your status through
                  hexagons with animated progress bars.
                </li>
                <li>
                  <strong>Task Depot (Kanban)</strong>: Fluidly manage daily targets by dragging
                  items between columns.
                </li>
                <li>
                  <strong>Smart Search</strong>: Filter chores instantly by entering search queries
                  in the top bar (shortcut: press{" "}
                  <code className="bg-stone-100 border border-[#ebdcb9] px-1 rounded">/</code>).
                </li>
                <li>
                  <strong>Markdown Notes</strong>: Click any task title or journal icon to expand a
                  rich text editor with hotkeys and live preview.
                </li>
              </ul>
            </>
          ) : (
            <>
              <p className="text-xs text-[#5c5449] leading-relaxed">
                ¡Bienvenido a <strong>BeeHive Productivity</strong>! Maximiza la producción de tu
                jornada:
              </p>
              <ul className="text-xs text-[#5c5449] list-disc ml-5 mt-2 space-y-1">
                <li>
                  <strong>Progresión de la Colmena</strong>: Completa labores y temporizadores para
                  subir de nivel. Modifica tu nombre de abeja en la parte inferior cuando gustes.
                </li>
                <li>
                  <strong>Backups de Datos</strong>: Guarda tus labores vía "Exportar CSV" y
                  restáuralas en cualquier momento con el nuevo cargador "Importar CSV" del panel
                  general.
                </li>
                <li>
                  <strong>Celdas Principales</strong>: Supervisa en tiempo real tus métricas con los
                  hexágonos con barras de progreso animadas.
                </li>
                <li>
                  <strong>Depósito de Labores (KanBan)</strong>: Gestiona objetivos diarios
                  arrastrando las tareas entre columnas de forma fluida.
                </li>
                <li>
                  <strong>Búsqueda Inteligente</strong>: Filtra tareas o notas al instante
                  escribiendo en la barra superior (atajo: presiona la tecla{" "}
                  <code className="bg-stone-100 border border-[#ebdcb9] px-1 rounded">/</code>).
                </li>
                <li>
                  <strong>Notas Markdown</strong>: Haz clic en el título de cualquier tarea o su
                  icono de diario para expandir un editor de texto con accesos rápidos y
                  previsualizador en tiempo real.
                </li>
              </ul>
            </>
          )}
        </div>
      )}

      <Suspense fallback={<SectionFallback />}>
        {activeTab === "dashboard" && (
          <div className="space-y-6 relative z-10">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-white via-white/90 to-[#faf6ee]/30 border border-[#ebdcb9] rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-[0_4px_25px_rgba(110,80,45,0.03)]">
              <div className="space-y-1.5 relative z-10">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] bg-gradient-to-r from-[#e28800] to-[#faa715] text-white font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <Award className="w-3 h-3" aria-hidden="true" />
                    {language === "en" ? `LEVEL ${level} FORAGER` : `OBRERA NIVEL ${level}`}
                  </span>
                  <span className="text-xs text-[#5c5449] font-semibold">{userBeeName}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#100f0d]">
                  {language === "en" ? "Welcome to the swarm, " : "¡Bienvenido al enjambre, "}
                  <span className="text-[#e28800]">{userBeeName}!</span>
                </h2>
                <div className="max-w-md my-2.5">
                  <div className="flex justify-between items-center text-[10px] text-[#5c5449] font-bold uppercase mb-1">
                    <span>{language === "en" ? "Hive Progression" : "Progresión de Vuelo"}</span>
                    <span>
                      {xp} / {xpNeeded} XP
                    </span>
                  </div>
                  <div className="w-full bg-[#ebdcb9]/40 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#e28800] to-[#faa715] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(226,136,0,0.3)]"
                      style={{ width: `${xpPercentage}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-[#5c5449] max-w-xl leading-relaxed">
                  {language === "en" ? (
                    <>
                      Your hive tasks are organized. Rank:{" "}
                      <strong className="text-[#e28800]">{hiveRank}</strong>. Completion rate:{" "}
                      <strong className="text-[#e28800]">{taskCompletionRate}%</strong> and you have
                      harvested <strong className="text-[#e28800]">{totalPollenProduced}u</strong>{" "}
                      of fresh pollen.
                    </>
                  ) : (
                    <>
                      Tus labores del panal están organizadas. Categoría actual:{" "}
                      <strong className="text-[#e28800]">{hiveRank}</strong>. Eficiencia de metas:{" "}
                      <strong className="text-[#e28800]">{taskCompletionRate}%</strong> y has
                      cosechado <strong className="text-[#e28800]">{totalPollenProduced}u</strong>{" "}
                      de polen fresco.
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-3 shrink-0 relative z-10">
                <button
                  type="button"
                  onClick={() => setActiveTab("focus")}
                  className="flex items-center space-x-2 px-4.5 py-2.5 bg-gradient-to-r from-amber-500 to-[#faa715] text-[#100f0d] font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(226,136,0,0.18)] hover:shadow-[0_4px_25px_rgba(226,136,0,0.3)] hover:scale-[1.01] cursor-pointer"
                >
                  <Clock className="w-4.5 h-4.5 stroke-[2.5]" />
                  <span>{language === "en" ? "Launch Flight" : "Iniciar Vuelo"}</span>
                </button>
                {completedTasksCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCompleted}
                    className="px-4 py-2.5 bg-white hover:bg-stone-50 text-[#5c5449] hover:text-[#100f0d] border border-[#ebdcb9] rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                  >
                    {language === "en" ? "Clear Completed" : "Limpiar Completados"}
                  </button>
                )}
              </div>
            </div>

            {/* Daily Buzz Quests + Royal Badges section */}
            <div data-cv="auto" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-6 bg-[#faf6ee]/70 border border-[#ebdcb9] rounded-3xl p-6.5 flex flex-col shadow-[0_4px_20px_rgba(110,80,45,0.02)]">
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#ebdcb9]/60 shrink-0">
                    <h3 className="text-xs font-extrabold text-[#e28800] uppercase tracking-widest flex items-center gap-2">
                      <Flame className="w-5 h-5 animate-pulse" aria-hidden="true" />
                      {language === "en" ? "Daily Buzz Quests" : "Misiones de Vuelo Diario"}
                    </h3>
                    <span className="text-[9px] bg-[#e28850]/10 text-[#e28800] font-black px-2.5 py-1 rounded-full border border-[#ebdcb9]/40">
                      {language === "en" ? "Active" : "Activas"}
                    </span>
                  </div>
                  <div className="space-y-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
                    {quests.map((q) => {
                      const qProgress = Math.min(
                        Math.round((q.progress.current / q.progress.target) * 100),
                        100,
                      );
                      const isClaimed = claimedQuests.includes(q.id);
                      const canClaim = q.condition && !isClaimed;
                      return (
                        <div
                          key={q.id}
                          className={`bg-white/80 border rounded-2xl p-3.5 flex items-start gap-3 shadow-xs ${isClaimed ? "border-emerald-300/40 opacity-70" : "border-[#ebdcb9]/40"}`}
                        >
                          <div className="mt-1 w-4.5 h-4.5 shrink-0 rounded-lg flex items-center justify-center text-[9px] font-black border border-[#ebdcb9] bg-[#faf6ee]">
                            <span
                              className={`${q.condition ? "text-[#e28800]" : "text-stone-300"}`}
                            >
                              {isClaimed ? "✓" : q.condition ? "!" : q.progress.current}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h4
                                className={`text-xs font-black truncate ${isClaimed ? "text-emerald-700 line-through" : q.condition ? "text-[#100f0d]" : "text-[#5c5449]"}`}
                              >
                                {q.title}
                              </h4>
                              <span className="text-[10px] text-emerald-700 font-bold font-mono">
                                +{q.xpReward} XP
                              </span>
                            </div>
                            <p className="text-[10px] text-[#5c5449] leading-tight mb-2">
                              {q.desc}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-[#ebdcb9]/30 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${isClaimed ? "bg-emerald-400" : q.condition ? "bg-[#e28800]" : "bg-amber-400"}`}
                                  style={{ width: `${qProgress}%` }}
                                />
                              </div>
                              {canClaim ? (
                                <button
                                  type="button"
                                  onClick={() => handleClaimQuest(q)}
                                  className="text-[9px] font-extrabold text-white bg-[#e28800] hover:bg-[#d07a00] px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 uppercase tracking-wider"
                                >
                                  {language === "en" ? "Claim" : "Reclamar"}
                                </button>
                              ) : (
                                <span className="text-[9px] font-bold text-stone-500 font-mono shrink-0">
                                  {isClaimed
                                    ? language === "en"
                                      ? "Done!"
                                      : "¡Hecho!"
                                    : `${q.progress.current}/${q.progress.target}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-[9px] text-[#5c5449]/70 font-semibold italic text-center mt-4 shrink-0">
                  {language === "en"
                    ? "Complete quests to earn XP and level up. Harder quests unlock at higher levels!"
                    : "Completa misiones para ganar XP y subir de nivel. ¡Misiones más difíciles se desbloquean en niveles superiores!"}
                </div>
              </div>

              <div className="lg:col-span-6 bg-white border border-[#ebdcb9] rounded-3xl p-6.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(110,80,45,0.02)]">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#ebdcb9]/60">
                    <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" aria-hidden="true" />
                      {language === "en" ? "Royal Badge Pavilion" : "Pabellón de Medallas"}
                    </h3>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-55 px-2 py-0.5 rounded-full border border-amber-200">
                      {unlockedAchievements.length} / 6
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      const achievementsList = [
                        {
                          id: "first-tasks",
                          title: language === "en" ? "First Drop" : "Primera Gota",
                          desc:
                            language === "en"
                              ? "Seed initial tasks list in IndexDB"
                              : "Inicializa tus primeras labores en IndexedDB",
                          icon: <Sparkle className="w-5 h-5 text-amber-500" />,
                        },
                        {
                          id: "wax-creator",
                          title: language === "en" ? "Wax Sculptor" : "Constructor de Celdas",
                          desc:
                            language === "en"
                              ? "Enter a custom task to the active hive"
                              : "Ingresa una tarea personalizada al panal",
                          icon: <CheckCircle className="w-5 h-5 text-amber-500" />,
                        },
                        {
                          id: "harvest-honey",
                          title: language === "en" ? "Honey Collector" : "Recolector de Miel",
                          desc:
                            language === "en"
                              ? "Harvest tasks into completed cells"
                              : "Muda las labores a celdas colmadas de miel",
                          icon: <Trophy className="w-5 h-5 text-amber-500" />,
                        },
                        {
                          id: "pomodoro-first",
                          title: language === "en" ? "Initial Flight" : "Primer Vuelo",
                          desc:
                            language === "en"
                              ? "Complete 1 focus session flight"
                              : "Realiza tu primera sesión de vuelo de concentración",
                          icon: <Flame className="w-5 h-5 text-orange-500" />,
                        },
                        {
                          id: "mighty-forager",
                          title: language === "en" ? "Mighty Forager" : "Súper Polinizador",
                          desc:
                            language === "en"
                              ? "Register a task with 5-effort workload"
                              : "Completa una labor de alta demanda (5 polen)",
                          icon: <Zap className="w-5 h-5 text-amber-500" />,
                        },
                        {
                          id: "honey-exporter",
                          title: language === "en" ? "Swarm Exporter" : "Sindicato de Exportadoras",
                          desc:
                            language === "en"
                              ? "Execute a backup data CSV shipment"
                              : "Transfiere un cargamento de datos a formato CSV",
                          icon: <Download className="w-5 h-5 text-emerald-600" />,
                        },
                      ];

                      return achievementsList.map((ach) => {
                        const isUnlocked = unlockedAchievements.includes(ach.id);
                        return (
                          <div
                            key={ach.id}
                            className={`relative border rounded-2xl p-2.5 transition-all flex items-center gap-3.5 ${
                              isUnlocked
                                ? "bg-gradient-to-br from-white to-amber-50/20 border-amber-300 shadow-sm"
                                : "bg-stone-50/50 border-stone-200/60 opacity-60"
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isUnlocked ? "bg-amber-100/60" : "bg-stone-100"
                              }`}
                            >
                              {isUnlocked ? ach.icon : <Inbox className="w-4 h-4 text-stone-300" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[10px] font-black text-[#100f0d] truncate">
                                {ach.title}
                              </h4>
                              <p
                                className="text-[8.5px] text-[#5c5449] truncate leading-tight"
                                title={ach.desc}
                              >
                                {ach.desc}
                              </p>
                            </div>
                            {isUnlocked && (
                              <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-[#e28800] rounded-full animate-ping" />
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
                <div className="mt-4 bg-[#faf6ee] rounded-xl p-2.5 border border-[#ebdcb9]/40 text-center text-[9px] font-bold text-[#e28800] uppercase tracking-wide">
                  {language === "en"
                    ? "🏆 UNLOCK ACHIEVEMENTS TO HARVEST +100 XP REWARDS!"
                    : "🏆 ¡DESBLOQUEA LOGROS PARA COSECHAR BONOS DE +100 XP!"}
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div>
              <div className="flex items-center space-x-1.5 mb-3.5 select-none">
                <Sparkles className="w-4 h-4 text-[#e28800]" aria-hidden="true" />
                <h4 className="text-[10px] font-bold text-[#5c5449] uppercase tracking-widest">
                  {language === "en"
                    ? "Production Hive Metrics"
                    : "Métricas del Panal de Producción"}
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
                {metricsList.map((metric) => (
                  <MetricCard
                    key={metric.id}
                    metric={metric}
                    isSelected={selectedMetricId === metric.id}
                    onSelect={(id) => setSelectedMetricId(id)}
                    progressPercent={
                      metric.id === "focus-time"
                        ? Math.min(100, (totalFocusMins / 600) * 100)
                        : metric.id === "tasks-ratio"
                          ? taskCompletionRate
                          : metric.id === "pollen-produced"
                            ? Math.min(100, (totalPollenProduced / 50) * 100)
                            : metric.id === "colony-streak"
                              ? Math.min(100, (streakCount / 10) * 100)
                              : 75
                    }
                  />
                ))}
              </div>
            </div>

            {/* Below-fold heavy sections */}
            <div data-cv="auto" className="grid grid-cols-1 gap-6">
              <div className="w-full">
                <Suspense fallback={<SectionFallback />}>
                  <TaskBoard />
                </Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7">
                  <Suspense fallback={<SectionFallback />}>
                    <StatsChart />
                  </Suspense>
                </div>
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <Suspense fallback={<SectionFallback />}>
                    <HiveProjectionCard />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "focus" && (
          <div className="animate-fade-in">
            <FocusTimer onSessionComplete={handleSessionComplete} />
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-white/75 backdrop-blur-md border border-[#ebdcb9]/60 rounded-3xl p-6.5 shadow-[0_10px_35px_rgba(110,80,45,0.03)]">
              <div className="mb-6 select-none">
                <h3 className="text-lg font-bold text-[#100f0d]">
                  {language === "en"
                    ? "Consolidated Collection Report"
                    : "Informe de Acopio Consolidado"}
                </h3>
                <p className="text-xs text-[#5c5449]">
                  {language === "en"
                    ? "Complete analysis of nectar yield generated by the swarm daily"
                    : "Análisis completo del rendimiento de néctar generado por el enjambre diario"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <Suspense fallback={<SectionFallback />}>
                  <StatsChart />
                </Suspense>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#5c5449] uppercase tracking-widest pb-2 border-b border-[#ebdcb9]">
                    {language === "en"
                      ? "Completed Work Milestones"
                      : "Hitos de Trabajo Completados"}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-[#faf6ee] p-3.5 rounded-2xl border border-[#ebdcb9] text-xs font-semibold text-[#100f0d]">
                      <span>
                        {language === "en" ? "Consistency Status" : "Grado de Constancia"}
                      </span>
                      <span className="font-mono text-[#e28800] font-bold">{activeStatusText}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#faf6ee] p-3.5 rounded-2xl border border-[#ebdcb9] text-xs font-semibold text-[#100f0d]">
                      <span>{language === "en" ? "Queen Rank" : "Rango de la Reina"}</span>
                      <span className="font-mono text-emerald-700 font-bold">{hiveRank}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#faf6ee] p-3.5 rounded-2xl border border-[#ebdcb9] text-xs font-semibold text-[#100f0d]">
                      <span>
                        {language === "en" ? "Total Focus Sessions" : "Sesión de Foco Total"}
                      </span>
                      <span className="font-mono text-[#e28800] font-bold">
                        {totalFocusMins}m / {streakCount} {language === "en" ? "Streaks" : "Rachas"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Suspense>
    </MainTemplate>
  );
}
