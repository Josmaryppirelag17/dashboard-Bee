"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/molecules/AuthModal";
import { LogIn, LogOut, User, Loader2 } from "lucide-react";

interface AuthButtonProps {
  collapsed?: boolean;
}

export default function AuthButton({ collapsed }: AuthButtonProps) {
  const { user, loading, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex items-center ${collapsed ? "justify-center" : "space-x-3"} p-2.5 rounded-2xl bg-white/60 border border-[#ebdcb9]/50`}
      >
        <Loader2 className="w-4 h-4 text-[#e28800] animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <>
        <div
          className={`p-2.5 rounded-2xl bg-white/60 border border-[#ebdcb9]/50 flex items-center ${collapsed ? "justify-center" : "space-x-3"}`}
        >
          <div className="relative w-8.5 h-8.5 rounded-xl bg-[#faf6ee] border border-[#e28800]/25 flex items-center justify-center text-[#e28800] shrink-0">
            <User className="w-4 h-4 stroke-[2]" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-black text-[#5c5449] uppercase tracking-wide block truncate">
                {user.name}
              </span>
              <span className="text-[8px] text-[#5c5449]/70 block truncate">{user.email}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-1.5 text-[#5c5449] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            aria-label="Sign out"
            title="Sign out"
          >
            {loggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`w-full flex items-center ${
          collapsed ? "justify-center" : "space-x-2 px-3.5"
        } py-2.5 bg-gradient-to-r from-amber-500 to-[#faa715] text-[#100f0d] font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(226,136,0,0.18)] hover:shadow-[0_4px_25px_rgba(226,136,0,0.3)] transition-all`}
        aria-label="Sign in or create an account"
      >
        <LogIn className="w-4 h-4" />
        {!collapsed && <span>Sign In</span>}
      </button>

      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
