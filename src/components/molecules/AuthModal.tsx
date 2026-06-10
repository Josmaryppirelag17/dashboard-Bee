"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { useHiveStore } from "@/store/useHiveStore";
import { X, Loader2, LogIn, UserPlus, Sparkles } from "lucide-react";
import Link from "next/link";

interface AuthTranslations {
  signIn: string;
  signUp: string;
  welcomeBack: string;
  joinSwarm: string;
  email: string;
  username: string;
  name: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  signingIn: string;
  creatingAccount: string;
  loginFailed: string;
  registrationFailed: string;
  emailPlaceholder: string;
  usernamePlaceholder: string;
  namePlaceholder: string;
  lastNamePlaceholder: string;
  passwordPlaceholder: string;
  confirmPlaceholder: string;
  passwordRequired: string;
  passwordMin: string;
  passwordsNoMatch: string;
  nameRequired: string;
  lastNameRequired: string;
  usernameMin: string;
  usernameRegex: string;
  invalidEmail: string;
  closeModal: string;
  passwordReqLength: string;
  passwordReqUppercase: string;
  passwordReqNumber: string;
  passwordReqSpecial: string;
  forgotPassword: string;
}

const translations: Record<"es" | "en", AuthTranslations> = {
  es: {
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    welcomeBack: "Bienvenido de vuelta a la colmena",
    joinSwarm: "Únete al enjambre",
    email: "Correo electrónico",
    username: "Usuario",
    name: "Nombre",
    lastName: "Apellidos",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    signingIn: "Iniciando sesión...",
    creatingAccount: "Creando cuenta...",
    loginFailed: "Inicio de sesión fallido",
    registrationFailed: "Registro fallido",
    emailPlaceholder: "tu@ejemplo.com",
    usernamePlaceholder: "tu_usuario",
    namePlaceholder: "Tu nombre",
    lastNamePlaceholder: "Tus apellidos",
    passwordPlaceholder: "Mínimo 8 caracteres",
    confirmPlaceholder: "Repite la contraseña",
    passwordRequired: "La contraseña es obligatoria",
    passwordMin: "Mínimo 8 caracteres",
    passwordsNoMatch: "Las contraseñas no coinciden",
    nameRequired: "El nombre es obligatorio",
    lastNameRequired: "Los apellidos son obligatorios",
    usernameMin: "Mínimo 3 caracteres",
    usernameRegex: "Solo letras, números y guiones bajos",
    invalidEmail: "Correo electrónico inválido",
    closeModal: "Cerrar modal",
    passwordReqLength: "8+ caracteres",
    passwordReqUppercase: "Una mayúscula",
    passwordReqNumber: "Un número",
    passwordReqSpecial: "Un carácter especial",
    forgotPassword: "¿Olvidaste tu contraseña?",
  },
  en: {
    signIn: "Sign In",
    signUp: "Sign Up",
    welcomeBack: "Welcome back to the hive",
    joinSwarm: "Join the swarm",
    email: "Email",
    username: "Username",
    name: "Name",
    lastName: "Last Name",
    password: "Password",
    confirmPassword: "Confirm Password",
    signingIn: "Signing in...",
    creatingAccount: "Creating account...",
    loginFailed: "Login failed",
    registrationFailed: "Registration failed",
    emailPlaceholder: "you@example.com",
    usernamePlaceholder: "your_username",
    namePlaceholder: "Your name",
    lastNamePlaceholder: "Your last name",
    passwordPlaceholder: "At least 8 characters",
    confirmPlaceholder: "Repeat password",
    passwordRequired: "Password is required",
    passwordMin: "Minimum 8 characters",
    passwordsNoMatch: "Passwords do not match",
    nameRequired: "Name is required",
    lastNameRequired: "Last name is required",
    usernameMin: "Minimum 3 characters",
    usernameRegex: "Only letters, numbers and underscores",
    invalidEmail: "Invalid email address",
    closeModal: "Close modal",
    passwordReqLength: "8+ characters",
    passwordReqUppercase: "One uppercase",
    passwordReqNumber: "One number",
    passwordReqSpecial: "One special character",
    forgotPassword: "Forgot password?",
  },
};

interface PasswordCheck {
  label: keyof AuthTranslations;
  key: string;
  test: (pw: string) => boolean;
}

const PASSWORD_CHECKS: PasswordCheck[] = [
  { label: "passwordReqLength", key: "length", test: (pw) => pw.length >= 8 },
  { label: "passwordReqUppercase", key: "upper", test: (pw) => /[A-Z]/.test(pw) },
  { label: "passwordReqNumber", key: "number", test: (pw) => /\d/.test(pw) },
  { label: "passwordReqSpecial", key: "special", test: (pw) => /[^a-zA-Z0-9]/.test(pw) },
];

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    email: z.string().email("Invalid email"),
    username: z
      .string()
      .min(3, "Minimum 3 characters")
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),
    name: z.string().min(1, "Name is required"),
    lastName: z.string().min(1, "Last name is required"),
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const language: "es" | "en" = useHiveStore((state) => state.language);
  const t = translations[language];

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      name: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchPassword = registerForm.watch("password");

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        const firstInput = modalRef.current?.querySelector("input");
        firstInput?.focus();
      }, 100);
    } else {
      previousActiveElement.current?.focus();
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const switchTab = (newTab: "login" | "register") => {
    setTab(newTab);
    setError(null);
    loginForm.clearErrors();
    registerForm.clearErrors();
  };

  const handleLogin = async (data: LoginForm) => {
    setSubmitting(true);
    setError(null);
    const result = await login(data.email, data.password);
    setSubmitting(false);
    if (result.success) {
      onClose();
    } else {
      setError(result.error ?? t.loginFailed);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setSubmitting(true);
    setError(null);
    const result = await register(
      data.email,
      data.username,
      data.name,
      data.lastName,
      data.password,
    );
    setSubmitting(false);
    if (result.success) {
      onClose();
    } else {
      setError(result.error ?? t.registrationFailed);
    }
  };

  const allPass = !watchPassword || PASSWORD_CHECKS.every((c) => c.test(watchPassword ?? ""));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 bg-[#faf6ee] border border-[#ebdcb9] rounded-3xl shadow-2xl overflow-hidden animate-fade-in"
      >
        {/* Decorative hexagon header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-[#ebdcb9]/60">
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
                  id="auth-modal-title"
                  className="text-sm font-black text-[#100f0d] uppercase tracking-wider"
                >
                  {tab === "login" ? t.signIn : t.signUp}
                </h2>
                <p className="text-[10px] text-[#5c5449] font-semibold">
                  {tab === "login" ? t.welcomeBack : t.joinSwarm}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#5c5449] hover:text-[#100f0d] hover:bg-[#ebdcb9]/40 rounded-xl transition-colors"
              aria-label={t.closeModal}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab switcher */}
          <div
            className="flex mt-4 bg-white border border-[#ebdcb9]/60 rounded-xl p-0.5"
            role="tablist"
            aria-label="Authentication method"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "login"}
              aria-controls="auth-panel"
              onClick={() => switchTab("login")}
              className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                tab === "login"
                  ? "bg-[#e28800] text-white shadow-sm"
                  : "text-[#5c5449] hover:text-[#100f0d]"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.signIn}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "register"}
              aria-controls="auth-panel"
              onClick={() => switchTab("register")}
              className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                tab === "register"
                  ? "bg-[#e28800] text-white shadow-sm"
                  : "text-[#5c5449] hover:text-[#100f0d]"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.signUp}</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mx-6 mt-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Forms */}
        <div id="auth-panel" className="p-6" role="tabpanel">
          {tab === "login" && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1"
                >
                  {t.email}
                </label>
                <input
                  id="login-email"
                  type="text"
                  autoComplete="email"
                  {...loginForm.register("email")}
                  className="w-full bg-white border border-[#ebdcb9] rounded-xl px-3 py-2.5 text-xs text-[#100f0d] placeholder-[#5c5449]/50 outline-none focus:border-[#e28800] focus:ring-1 focus:ring-[#e28800]/30 transition-all"
                  placeholder={t.emailPlaceholder}
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-[10px] font-bold text-red-600">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1"
                >
                  {t.password}
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  {...loginForm.register("password")}
                  className="w-full bg-white border border-[#ebdcb9] rounded-xl px-3 py-2.5 text-xs text-[#100f0d] placeholder-[#5c5449]/50 outline-none focus:border-[#e28800] focus:ring-1 focus:ring-[#e28800]/30 transition-all"
                  placeholder="••••••••"
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-[10px] font-bold text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
                {/* Forgot password link */}
                <div className="mt-1.5 text-right">
                  <Link
                    href="/auth/forgot-password"
                    className="text-[10px] font-bold text-[#e28800] hover:text-[#d47800] underline underline-offset-2 transition-colors"
                  >
                    {t.forgotPassword}
                  </Link>
                </div>
              </div>
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
                <span>{submitting ? t.signingIn : t.signIn}</span>
              </button>
            </form>
          )}

          {tab === "register" && (
            <form
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="space-y-4"
              noValidate
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="reg-name"
                    className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1"
                  >
                    {t.name}
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="given-name"
                    {...registerForm.register("name")}
                    className="w-full bg-white border border-[#ebdcb9] rounded-xl px-3 py-2.5 text-xs text-[#100f0d] placeholder-[#5c5449]/50 outline-none focus:border-[#e28800] focus:ring-1 focus:ring-[#e28800]/30 transition-all"
                    placeholder={t.namePlaceholder}
                  />
                  {registerForm.formState.errors.name && (
                    <p className="mt-1 text-[10px] font-bold text-red-600">
                      {registerForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="reg-lastName"
                    className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1"
                  >
                    {t.lastName}
                  </label>
                  <input
                    id="reg-lastName"
                    type="text"
                    autoComplete="family-name"
                    {...registerForm.register("lastName")}
                    className="w-full bg-white border border-[#ebdcb9] rounded-xl px-3 py-2.5 text-xs text-[#100f0d] placeholder-[#5c5449]/50 outline-none focus:border-[#e28800] focus:ring-1 focus:ring-[#e28800]/30 transition-all"
                    placeholder={t.lastNamePlaceholder}
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="mt-1 text-[10px] font-bold text-red-600">
                      {registerForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="reg-username"
                  className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1"
                >
                  {t.username}
                </label>
                <input
                  id="reg-username"
                  type="text"
                  autoComplete="username"
                  {...registerForm.register("username")}
                  className="w-full bg-white border border-[#ebdcb9] rounded-xl px-3 py-2.5 text-xs text-[#100f0d] placeholder-[#5c5449]/50 outline-none focus:border-[#e28800] focus:ring-1 focus:ring-[#e28800]/30 transition-all"
                  placeholder={t.usernamePlaceholder}
                />
                {registerForm.formState.errors.username && (
                  <p className="mt-1 text-[10px] font-bold text-red-600">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1"
                >
                  {t.email}
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  {...registerForm.register("email")}
                  className="w-full bg-white border border-[#ebdcb9] rounded-xl px-3 py-2.5 text-xs text-[#100f0d] placeholder-[#5c5449]/50 outline-none focus:border-[#e28800] focus:ring-1 focus:ring-[#e28800]/30 transition-all"
                  placeholder={t.emailPlaceholder}
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-[10px] font-bold text-red-600">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1"
                >
                  {t.password}
                </label>
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  {...registerForm.register("password")}
                  className="w-full bg-white border border-[#ebdcb9] rounded-xl px-3 py-2.5 text-xs text-[#100f0d] placeholder-[#5c5449]/50 outline-none focus:border-[#e28800] focus:ring-1 focus:ring-[#e28800]/30 transition-all"
                  placeholder={t.passwordPlaceholder}
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-[10px] font-bold text-red-600">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
                {/* Dynamic password requirements checklist */}
                {watchPassword && watchPassword.length > 0 && (
                  <div className="mt-2 bg-white border border-[#ebdcb9] rounded-xl p-3 space-y-1.5">
                    <p className="text-[9px] font-black text-[#5c5449] uppercase tracking-wider mb-1">
                      REQUISITOS:
                    </p>
                    {PASSWORD_CHECKS.map((check) => {
                      const passed = check.test(watchPassword ?? "");
                      return (
                        <div key={check.key} className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold ${passed ? "text-[#4a7c1a]" : "text-[#b8a98c]"}`}
                          >
                            {passed ? "[✓]" : "[ ]"}
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${passed ? "text-[#4a7c1a]" : "text-[#5c5449]"}`}
                          >
                            {t[check.label]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="reg-confirm"
                  className="block text-[10px] font-bold text-[#5c5449] uppercase tracking-wider mb-1"
                >
                  {t.confirmPassword}
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  autoComplete="new-password"
                  {...registerForm.register("confirmPassword")}
                  className="w-full bg-white border border-[#ebdcb9] rounded-xl px-3 py-2.5 text-xs text-[#100f0d] placeholder-[#5c5449]/50 outline-none focus:border-[#e28800] focus:ring-1 focus:ring-[#e28800]/30 transition-all"
                  placeholder={t.confirmPlaceholder}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-[10px] font-bold text-red-600">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting || (watchPassword ? !allPass : false)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-[#faa715] text-[#100f0d] font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(226,136,0,0.18)] hover:shadow-[0_4px_25px_rgba(226,136,0,0.3)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{submitting ? t.creatingAccount : t.signUp}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
