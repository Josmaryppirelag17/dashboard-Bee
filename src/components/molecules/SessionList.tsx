"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Monitor, Smartphone, Globe, Clock, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHiveStore } from "@/store/useHiveStore";

interface AuthSession {
  id: number;
  userId: number;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
}

interface SessionListProps {
  open: boolean;
  onClose: () => void;
}

function getDeviceIcon(ua: string | null) {
  if (!ua) return <Monitor className="w-4 h-4" />;
  const lower = ua.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod/i.test(lower)) return <Smartphone className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
}

function formatRelativeTime(dateStr: string, lang: "es" | "en"): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return lang === "en" ? "just now" : "ahora";
  if (mins < 60) return lang === "en" ? `${mins}m ago` : `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return lang === "en" ? `${hrs}h ago` : `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return lang === "en" ? `${days}d ago` : `hace ${days}d`;
}

function truncateUA(ua: string | null, max = 50): string {
  if (!ua) return "Unknown";
  return ua.length > max ? ua.slice(0, max) + "…" : ua;
}

export default function SessionList({ open, onClose }: SessionListProps) {
  const { sessionId: currentSessionId } = useAuth();
  const language: "es" | "en" = useHiveStore((state) => state.language);
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/sessions");
      const json = await res.json();
      if (json.success) {
        setSessions(json.data.sessions ?? []);
      } else {
        setError(json.error?.message ?? "Failed to load sessions");
      }
    } catch {
      setError(language === "en" ? "Network error" : "Error de red");
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    if (open) fetchSessions();
  }, [open, fetchSessions]);

  const revokeSession = async (sessionId: number) => {
    setRevokingId(sessionId);
    try {
      await fetch(`/api/auth/sessions?sessionId=${sessionId}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      setError(language === "en" ? "Failed to revoke session" : "Error al revocar sesión");
    } finally {
      setRevokingId(null);
      setConfirmId(null);
    }
  };

  const revokeAllOthers = async () => {
    setRevokingId(-1);
    try {
      const others = sessions.filter((s) => s.id !== currentSessionId);
      await Promise.all(
        others.map((s) => fetch(`/api/auth/sessions?sessionId=${s.id}`, { method: "DELETE" })),
      );
      setSessions((prev) => prev.filter((s) => s.id === currentSessionId));
    } catch {
      setError(language === "en" ? "Failed to revoke sessions" : "Error al revocar sesiones");
    } finally {
      setRevokingId(null);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sessions-modal-title"
    >
      <div className="relative w-full max-w-lg mx-4 bg-[#faf6ee] border border-[#ebdcb9] rounded-3xl shadow-2xl overflow-hidden animate-fade-in max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#ebdcb9]/60 shrink-0">
          <div className="flex items-center justify-between">
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
                <h2
                  id="sessions-modal-title"
                  className="text-sm font-black text-[#100f0d] uppercase tracking-wider"
                >
                  {language === "en" ? "Active Sessions" : "Sesiones Activas"}
                </h2>
                <p className="text-[10px] text-[#5c5449] font-semibold">
                  {language === "en"
                    ? "Devices connected to your hive"
                    : "Dispositivos conectados a tu colmena"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#5c5449] hover:text-[#100f0d] hover:bg-[#ebdcb9]/40 rounded-xl transition-colors"
              aria-label={language === "en" ? "Close" : "Cerrar"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mx-6 mt-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-700 flex items-center gap-2"
            role="alert"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#e28800] animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-10 h-10 text-[#ebdcb9] mx-auto mb-3" />
              <p className="text-xs font-bold text-[#5c5449]">
                {language === "en" ? "No active sessions" : "No hay sesiones activas"}
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const isCurrent = session.id === currentSessionId;
              const isConfirming = confirmId === session.id;
              const isRevoking = revokingId === session.id;

              return (
                <div
                  key={session.id}
                  className={`bg-white border rounded-2xl p-4 transition-all ${
                    isCurrent ? "border-[#e28800] ring-1 ring-[#e28800]/20" : "border-[#ebdcb9]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? "bg-[#e28800]/10 text-[#e28800]"
                            : "bg-[#faf6ee] text-[#5c5449]"
                        }`}
                      >
                        {getDeviceIcon(session.userAgent)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-[#100f0d] truncate">
                            {truncateUA(session.userAgent)}
                          </span>
                          {isCurrent && (
                            <span className="text-[8px] font-extrabold text-white bg-[#e28800] px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {language === "en" ? "CURRENT" : "ACTUAL"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-[#5c5449] font-medium">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {session.ipAddress ?? "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(session.createdAt, language)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isCurrent && (
                      <div className="shrink-0">
                        {isConfirming ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => revokeSession(session.id)}
                              disabled={isRevoking}
                              className="px-2 py-1 bg-red-500 text-white text-[9px] font-extrabold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              {isRevoking ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : language === "en" ? (
                                "YES"
                              ) : (
                                "SÍ"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              className="px-2 py-1 bg-[#faf6ee] text-[#5c5449] text-[9px] font-extrabold rounded-lg hover:bg-[#ebdcb9] transition-colors"
                            >
                              {language === "en" ? "NO" : "NO"}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmId(session.id)}
                            className="p-1.5 text-[#5c5449] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title={language === "en" ? "Revoke session" : "Revocar sesión"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {sessions.length > 1 && (
          <div className="px-6 py-4 border-t border-[#ebdcb9]/60 shrink-0">
            <button
              type="button"
              onClick={revokeAllOthers}
              disabled={revokingId === -1}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-700 font-bold rounded-xl text-[10px] uppercase tracking-wider hover:bg-red-50 disabled:opacity-50 transition-all"
            >
              {revokingId === -1 ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              {language === "en" ? "Revoke all other sessions" : "Revocar todas las demás sesiones"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
