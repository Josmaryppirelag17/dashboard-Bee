"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useHiveStore } from "@/store/useHiveStore";
import Link from "next/link";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";

const tMap = {
  es: {
    title: "Nueva Contraseña",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    passwordPlaceholder: "Mínimo 8 caracteres",
    confirmPlaceholder: "Repite la contraseña",
    submit: "Restablecer",
    submitting: "Procesando...",
    passwordMin: "Mínimo 8 caracteres",
    passwordsNoMatch: "Las contraseñas no coinciden",
    success:
      "Tu contraseña ha sido restablecida exitosamente. Todas las sesiones han sido cerradas.",
    error: "Error al restablecer",
    networkError: "Error de red",
    back: "Iniciar Sesión",
  },
  en: {
    title: "New Password",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    passwordPlaceholder: "At least 8 characters",
    confirmPlaceholder: "Repeat password",
    submit: "Reset",
    submitting: "Processing...",
    passwordMin: "Minimum 8 characters",
    passwordsNoMatch: "Passwords do not match",
    success: "Your password has been reset successfully. All sessions have been closed.",
    error: "Reset failed",
    networkError: "Network error",
    back: "Sign In",
  },
};

export default function ResetPasswordPage() {
  const language = useHiveStore((s) => s.language);
  const t = tMap[language];
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t.passwordMin);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordsNoMatch);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error?.message ?? t.error);
      }
    } catch {
      setError(t.networkError);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#faf6ee] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#b8d98c] shadow-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-[#b8d98c]/60">
            <div className="flex items-center space-x-3">
              <svg viewBox="0 0 100 100" className="w-8 h-8 fill-[#4a7c1a]" aria-hidden="true">
                <path
                  d="M 50 0 L 93 25 L 93 75 L 50 100 L 7 75 L 7 25 Z"
                  fillOpacity="0.15"
                  stroke="#4a7c1a"
                  strokeWidth="4"
                />
              </svg>
              <h1 className="text-sm font-black text-[#100f0d] uppercase tracking-wider">
                {t.title}
              </h1>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="bg-[#f0f7e8] border border-[#b8d98c] rounded-xl p-4">
              <p className="text-xs font-bold text-[#4a7c1a]">{t.success}</p>
            </div>
            <Link
              href="/"
              className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-[#faa715] text-[#100f0d] font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(226,136,0,0.18)] hover:shadow-[0_4px_25px_rgba(226,136,0,0.3)] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf6ee] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#ebdcb9] shadow-2xl overflow-hidden">
        <div className="relative px-6 pt-6 pb-4 border-b border-[#ebdcb9]/60">
          <div className="flex items-center space-x-3">
            <svg viewBox="0 0 100 100" className="w-8 h-8 fill-[#e28800]" aria-hidden="true">
              <path
                d="M 50 0 L 93 25 L 93 75 L 50 100 L 7 75 L 7 25 Z"
                fillOpacity="0.15"
                stroke="#e28800"
                strokeWidth="4"
              />
            </svg>
            <h1 className="text-sm font-black text-[#100f0d] uppercase tracking-wider">
              {t.title}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label
              htmlFor="bee-new-password"
              className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1.5"
            >
              {t.newPassword}
            </label>
            <input
              id="bee-new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              minLength={8}
              maxLength={128}
              required
              className="w-full bg-white border border-[#ebdcb9] rounded-xl px-3 py-2.5 text-xs text-[#100f0d] placeholder-[#5c5449]/50 outline-none focus:border-[#e28800] focus:ring-1 focus:ring-[#e28800]/30 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="bee-confirm-password"
              className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1.5"
            >
              {t.confirmPassword}
            </label>
            <input
              id="bee-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.confirmPlaceholder}
              maxLength={128}
              required
              className="w-full bg-white border border-[#ebdcb9] rounded-xl px-3 py-2.5 text-xs text-[#100f0d] placeholder-[#5c5449]/50 outline-none focus:border-[#e28800] focus:ring-1 focus:ring-[#e28800]/30 transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <p className="text-[11px] font-bold text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-[#faa715] text-[#100f0d] font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(226,136,0,0.18)] hover:shadow-[0_4px_25px_rgba(226,136,0,0.3)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{submitting ? t.submitting : t.submit}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
