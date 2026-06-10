"use client";

import { useState } from "react";
import { useHiveStore } from "@/store/useHiveStore";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

const tMap = {
  es: {
    title: "Restablecer Contraseña",
    subtitle: "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.",
    email: "Correo electrónico",
    emailPlaceholder: "tu@ejemplo.com",
    send: "Enviar enlace",
    sending: "Enviando...",
    success: "Te hemos enviado un enlace de restauración. Revisa tu correo.",
    error: "Error",
    networkError: "Error de red",
    back: "Volver al inicio",
    devLink: "[DEV] Enlace de restauración:",
  },
  en: {
    title: "Reset Password",
    subtitle: "Enter your email and we'll send you a link to reset your password.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    send: "Send reset link",
    sending: "Sending...",
    success: "We've sent you a reset link. Check your email.",
    error: "Error",
    networkError: "Network error",
    back: "Back to home",
    devLink: "[DEV] Reset link:",
  },
};

export default function ForgotPasswordPage() {
  const language = useHiveStore((s) => s.language);
  const t = tMap[language];
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setResetUrl(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(t.success);
        setResetUrl(data.data?.resetUrl ?? null);
      } else {
        setError(data.error?.message ?? t.error);
      }
    } catch {
      setError(t.networkError);
    } finally {
      setSubmitting(false);
    }
  };

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
            <div>
              <h1 className="text-sm font-black text-[#100f0d] uppercase tracking-wider">
                {t.title}
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!message && (
            <>
              <p className="text-[12px] text-[#5c5449] leading-relaxed font-semibold">
                {t.subtitle}
              </p>
              <div>
                <label
                  htmlFor="bee-reset-email"
                  className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1.5"
                >
                  {t.email}
                </label>
                <input
                  id="bee-reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  className="w-full bg-white border border-[#ebdcb9] rounded-xl px-3 py-2.5 text-xs text-[#100f0d] placeholder-[#5c5449]/50 outline-none focus:border-[#e28800] focus:ring-1 focus:ring-[#e28800]/30 transition-all"
                />
              </div>
            </>
          )}

          {message && (
            <div className="space-y-4">
              <div className="bg-[#f0f7e8] border border-[#b8d98c] rounded-xl p-4">
                <p className="text-xs font-bold text-[#4a7c1a]">{message}</p>
              </div>
              {resetUrl && (
                <div className="bg-[#fff8e7] border border-[#ebdcb9] rounded-xl p-3">
                  <p className="text-[10px] font-bold text-[#5c5449] mb-1">{t.devLink}</p>
                  <a
                    href={resetUrl}
                    className="text-[11px] text-[#e28800] underline break-all hover:text-[#d47800] font-semibold"
                  >
                    {resetUrl}
                  </a>
                </div>
              )}
              <Link
                href="/"
                className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-[#faa715] text-[#100f0d] font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(226,136,0,0.18)] hover:shadow-[0_4px_25px_rgba(226,136,0,0.3)] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.back}</span>
              </Link>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <p className="text-[11px] font-bold text-red-700">{error}</p>
            </div>
          )}

          {!message && (
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
              <span>{submitting ? t.sending : t.send}</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
