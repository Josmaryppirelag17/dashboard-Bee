import React, { useState } from "react";
import { CalendarDays, Activity } from "lucide-react";
import { useHiveProjection } from "@/hooks/useHiveProjection";
import { THEME_CONFIG } from "@/theme.config";
import { useHiveStore } from "@/store/useHiveStore";
import { translations } from "@/utils/translations";

/**
 * Organism: HiveProjectionCard
 *
 * DESIGN ARCHITECTURE BRIEF (Senior Frontend Engineer):
 * - SRP: Exclusively handles rendering prediction logic and the interactive pace throttle.
 * - Reactive: Pulls from useHiveProjection which hooks into the Zustand + IndexedDB store.
 * - High Contrast: Soft cream background with clear text hierarchy and accessibility markings.
 */
export const HiveProjectionCard: React.FC = () => {
  const [dailyPace, setDailyPace] = useState<number>(2.0);
  const language = useHiveStore((state) => state.language);
  const t = translations[language];

  const { totalTasksCount, completedTasksCount, pendingTasksCount, remainingDays, advice } =
    useHiveProjection(dailyPace);

  // Compute percentage for progress bar
  const percent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className={`${THEME_CONFIG.components.glassCard} p-5 flex flex-col space-y-4`}>
      {/* 1. Module Title */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ebdcb9]/40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 flex items-center justify-center bg-[#faf6ee] border border-[#ebdcb9] rounded-xl text-[#e28800]">
            <CalendarDays className="w-4 h-4 stroke-[2]" aria-hidden="true" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#5c5449] block">
              {language === "en" ? "Prediction Algorithm" : "Algoritmo de Predicción"}
            </span>
            <h4 className="text-sm font-extrabold text-[#100f0d]">{t.projection.title}</h4>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 self-start">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" aria-hidden="true" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
            {language === "en" ? "LIVE CALC" : "FILO DIRECTO"}
          </span>
        </div>
      </div>

      {/* 2. Interactive Pace Slider */}
      <div className="bg-[#faf6ee]/50 border border-[#ebdcb9]/40 p-3.5 rounded-2xl flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="pace-slider" className="text-xs font-bold text-[#5c5449]">
            {t.projection.speedLabel}
          </label>
          <span className="text-xs font-mono font-extrabold text-[#e28800] bg-white border border-[#ebdcb9] px-2.5 py-1 rounded-xl">
            {dailyPace.toFixed(1)} {language === "en" ? "tasks / day" : "tareas / día"}
          </span>
        </div>
        <input
          id="pace-slider"
          type="range"
          min="0.5"
          max="5.0"
          step="0.5"
          value={dailyPace}
          onChange={(e) => setDailyPace(parseFloat(e.target.value))}
          className="w-full accent-[#e28800] h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer outline-none transition-all"
        />
        <div className="flex justify-between text-[9px] font-mono text-[#5c5449]/70 px-1">
          <span>{language === "en" ? "0.5 (Meticulous)" : "0.5 (Meticuloso)"}</span>
          <span>{language === "en" ? "5.0 (Relentless)" : "5.0 (Incombustible)"}</span>
        </div>
      </div>

      {/* 3. Numerical Prediction Output Block */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#faf6ee] border border-[#ebdcb9]/50 rounded-2xl p-3 text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#5c5449] block mb-1">
            {language === "en" ? "Remaining Days" : "Días Restantes"}
          </span>
          <span className="text-2xl font-black font-mono text-[#100f0d]">
            {pendingTasksCount === 0 ? "0" : remainingDays}
          </span>
          <span className="text-[9px] text-[#5c5449] block mt-1">
            {language === "en" ? "to clear tasks" : "para vaciar labores"}
          </span>
        </div>

        <div className="bg-[#faf6ee] border border-[#ebdcb9]/50 rounded-2xl p-3 text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#5c5449] block mb-1">
            {language === "en" ? "In Queue" : "En Cola"}
          </span>
          <span className="text-2xl font-black font-mono text-[#e28800]">{pendingTasksCount}</span>
          <span className="text-[9px] text-[#5c5449] block mt-1">
            {language === "en" ? "pending tasks" : "tareas pendientes"}
          </span>
        </div>
      </div>

      {/* 4. Advice Box */}
      <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-3.5 text-xs text-[#5c5449] leading-relaxed relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full filter blur-xl" />
        <p className="font-semibold relative z-10">{advice}</p>
      </div>

      {/* 5. Minimal Progress Indicator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-[#5c5449]">
          <span>{language === "en" ? "COLONY COMPLETION" : "COMPLETADO DE LA COLONIA"}</span>
          <span className="font-mono">{percent}%</span>
        </div>
        <div className="w-full bg-[#faf6ee] border border-[#ebdcb9]/50 rounded-full h-2 overflow-hidden shadow-inner flex">
          <div
            className="bg-gradient-to-r from-amber-500 to-[#faa715] h-full transition-all duration-500 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default HiveProjectionCard;
