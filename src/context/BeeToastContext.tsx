"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { generateToastId } from "@/utils/id";

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "warning" | "info" | "honey";
  duration?: number;
}

interface ToastContextProps {
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useBeeToasts = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useBeeToasts must be used inside a BeeToastProvider");
  }
  return context;
};

export const BeeToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "honey", duration = 3000) => {
      const id = generateToastId();
      const newToast: Toast = { id, message, type, duration };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}

      {/* Floating Toasts Staging Area */}
      <div
        className="fixed bottom-6 right-6 z-55 flex flex-col space-y-3 max-w-sm w-full pointer-events-none"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            // Pick appropriate thematic bee design attributes
            let bgClass = "bg-[#100f0d] text-[#faf6ee] border-[#ebdcb9]";
            let icon = <Sparkles className="w-4 h-4 text-[#faa715] shrink-0" />;

            if (toast.type === "honey") {
              bgClass =
                "bg-gradient-to-br from-white to-[#faf6ee] text-[#100f0d] border-[#e28800] shadow-[0_12px_28px_rgba(226,136,0,0.12)]";
              icon = (
                <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-5 h-5 fill-[#e28800] filter drop-shadow-[0_0_3px_rgba(226,136,0,0.25)]"
                    aria-hidden="true"
                  >
                    <path d="M 50 5 L 91 29 L 91 71 L 50 95 L 9 71 L 9 29 Z" />
                  </svg>
                  <span className="absolute text-[9px] font-black text-white">B</span>
                </div>
              );
            } else if (toast.type === "success") {
              bgClass =
                "bg-emerald-950 text-white border-emerald-500/30 shadow-[0_12px_28px_rgba(16,185,129,0.1)]";
              icon = <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />;
            } else if (toast.type === "warning") {
              bgClass = "bg-amber-950 text-white border-amber-500/30";
              icon = <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0" />;
            } else if (toast.type === "info") {
              bgClass = "bg-stone-900 text-white border-stone-800";
              icon = <HelpCircle className="w-4.5 h-4.5 text-slate-300 shrink-0" />;
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 35, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className={`pointer-events-auto p-4 rounded-2xl border flex items-start space-x-3 shadow-lg select-none ${bgClass}`}
              >
                {icon}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold leading-relaxed">{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-stone-400 hover:text-white transition-colors text-[10px] uppercase font-black"
                  aria-label="Cerrar notificación"
                >
                  ✕
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
