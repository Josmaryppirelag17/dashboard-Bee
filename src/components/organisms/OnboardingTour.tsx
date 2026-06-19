"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, Sparkles } from "lucide-react";
import { useHiveStore } from "@/store/useHiveStore";

interface Step {
  target: string;
  title: string;
  description: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
}

const STEPS: Step[] = [
  {
    target: "",
    title: "onboarding_welcome_title",
    description: "onboarding_welcome_desc",
    placement: "center",
  },
  {
    target: "#sidebar-item-dashboard",
    title: "onboarding_sidebar_title",
    description: "onboarding_sidebar_desc",
    placement: "right",
  },
  {
    target: ".grid-cols-4",
    title: "onboarding_metrics_title",
    description: "onboarding_metrics_desc",
    placement: "bottom",
  },
  {
    target: '[role="region"]',
    title: "onboarding_kanban_title",
    description: "onboarding_kanban_desc",
    placement: "top",
  },
  {
    target: "#sidebar-item-focus",
    title: "onboarding_focus_title",
    description: "onboarding_focus_desc",
    placement: "right",
  },
  {
    target: "#sidebar-item-analytics",
    title: "onboarding_analytics_title",
    description: "onboarding_analytics_desc",
    placement: "right",
  },
  {
    target: "",
    title: "onboarding_done_title",
    description: "onboarding_done_desc",
    placement: "center",
  },
];

interface TooltipPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function OnboardingTour() {
  const language = useHiveStore((s) => s.language);
  const showOnboarding = useHiveStore((s) => s.showOnboarding);
  const setOnboardingCompleted = useHiveStore((s) => s.setOnboardingCompleted);
  const setShowOnboarding = useHiveStore((s) => s.setShowOnboarding);


  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TooltipPosition | null>(null);
  const tourRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const step = STEPS[currentStep];
    if (!step || !step.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [currentStep]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition]);

  const t = (key: string): string => {
    const dict: Record<string, Partial<Record<string, string>>> = {
      es: {
        onboarding_welcome_title: "¡Bienvenido a BeeHive!",
        onboarding_welcome_desc:
          "Este tour rápido te mostrará las secciones principales de la colmena. Puedes saltarlo en cualquier momento.",
        onboarding_sidebar_title: "Navegación",
        onboarding_sidebar_desc:
          "Usa la barra lateral para moverte entre el panel principal, el temporizador de foco y las estadísticas.",
        onboarding_metrics_title: "Métricas del Panal",
        onboarding_metrics_desc:
          "Monitorea tu productividad en tiempo real: minutos de foco, tareas completadas, polen cosechado y racha activa.",
        onboarding_kanban_title: "Tablero Kanban",
        onboarding_kanban_desc:
          "Organiza tus labores arrastrándolas entre columnas: Por Hacer, En Progreso y Completado.",
        onboarding_focus_title: "Temporizador de Foco",
        onboarding_focus_desc:
          "Usa el Pomodoro para mantener la concentración. Ajusta la duración y asocia tareas para completar.",
        onboarding_analytics_title: "Estadísticas",
        onboarding_analytics_desc:
          "Revisa informes consolidados de tus sesiones de foco y progreso de tareas completadas.",
        onboarding_done_title: "¡Todo listo!",
        onboarding_done_desc:
          "Ya conoces lo básico. Empieza a crear labores y a usar el temporizador para ser más productivo. ¡La colmena te espera!",
        skip: "Saltar tour",
        next: "Siguiente",
        prev: "Anterior",
        done: "¡Empezar!",
      },
      en: {
        onboarding_welcome_title: "Welcome to BeeHive!",
        onboarding_welcome_desc:
          "This quick tour will show you the main sections of the hive. You can skip it anytime.",
        onboarding_sidebar_title: "Navigation",
        onboarding_sidebar_desc:
          "Use the sidebar to switch between Dashboard, Focus Timer, and Analytics.",
        onboarding_metrics_title: "Hive Metrics",
        onboarding_metrics_desc:
          "Monitor your productivity in real-time: focus minutes, completed tasks, harvested pollen, and active streak.",
        onboarding_kanban_title: "Kanban Board",
        onboarding_kanban_desc:
          "Organize tasks by dragging them between columns: To Do, In Progress, and Completed.",
        onboarding_focus_title: "Focus Timer",
        onboarding_focus_desc:
          "Use the Pomodoro timer to stay focused. Adjust durations and link tasks to auto-complete.",
        onboarding_analytics_title: "Analytics",
        onboarding_analytics_desc:
          "Review consolidated reports of your focus sessions and task completion progress.",
        onboarding_done_title: "You're all set!",
        onboarding_done_desc:
          "You know the basics. Start creating tasks and using the timer to be more productive. The hive awaits!",
        skip: "Skip tour",
        next: "Next",
        prev: "Previous",
        done: "Get Started!",
      },
    };
    return dict[language]?.[key] ?? dict["en"]?.[key] ?? key;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      finish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const finish = () => {
    setShowOnboarding(false);
    setOnboardingCompleted(true);
  };

  if (!showOnboarding) return null;

  const step = STEPS[currentStep];
  if (!step) return null;
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const isCenter = step.placement === "center";

  const tooltipStyle = (() => {
    if (!targetRect || isCenter || !step) return {};
    const g = 12;
    switch (step.placement) {
      case "top":
        return { bottom: window.innerHeight - targetRect.top + g, left: targetRect.left, maxWidth: Math.min(targetRect.width + 40, 400) };
      case "bottom":
        return { top: targetRect.top + targetRect.height + g, left: targetRect.left, maxWidth: Math.min(targetRect.width + 40, 400) };
      case "right":
        return { top: targetRect.top, left: targetRect.left + targetRect.width + g, maxWidth: 320 };
      case "left":
        return { top: targetRect.top, right: window.innerWidth - targetRect.left + g, maxWidth: 320 };
      default:
        return {};
    }
  })();

  return (
    <div
      ref={tourRef}
      className="fixed inset-0 z-[9999]"
      style={{ pointerEvents: "none" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Highlight ring on target */}
      {targetRect && !isCenter && (
        <div
          className="absolute border-2 border-[#e28800] rounded-2xl shadow-[0_0_0_4px_rgba(226,136,0,0.15),0_0_20px_rgba(226,136,0,0.2)] transition-all duration-300"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute z-10"
        style={{
          ...tooltipStyle,
          ...(isCenter ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" } : {}),
          pointerEvents: "auto",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-[#ebdcb9] rounded-3xl shadow-2xl p-6 max-w-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#e28800]" />
                <span className="text-[10px] font-black text-[#e28800] uppercase tracking-widest">
                  {currentStep + 1} / {STEPS.length}
                </span>
                <span className="sr-only" aria-live="polite">
                  {t(step.title)} — {t(step.description)}
                </span>
              </div>
              <button
                type="button"
                onClick={finish}
                className="p-1 text-[#5c5449] hover:text-[#100f0d] hover:bg-[#ebdcb9]/40 rounded-xl transition-colors"
                aria-label={t("skip")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title */}
            <h3 className="text-sm font-black text-[#100f0d] mb-2">{t(step.title)}</h3>

            {/* Description */}
            <p className="text-xs text-[#5c5449] leading-relaxed mb-5">{t(step.description)}</p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={isFirst ? finish : handlePrev}
                className="px-3 py-1.5 text-[10px] font-bold text-[#5c5449] hover:text-[#100f0d] hover:bg-[#faf6ee] rounded-xl border border-[#ebdcb9] transition-all uppercase tracking-wider"
              >
                {isFirst ? t("skip") : t("prev")}
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 text-[10px] font-black text-white bg-gradient-to-r from-amber-500 to-[#faa715] rounded-xl hover:shadow-[0_4px_16px_rgba(226,136,0,0.3)] transition-all uppercase tracking-wider flex items-center gap-1"
              >
                {isLast ? t("done") : t("next")}
                {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
