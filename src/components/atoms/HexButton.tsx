import React from "react";
import { THEME_CONFIG } from "@/theme.config";

interface HexButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

/**
 * Atom: HexButton
 *
 * DESIGN ARCHITECTURE BRIEF (Staff Frontend Engineer):
 * - SRP: Handles only rendering interactive states, keyboard outline management,
 *   and styling bindings. Does not know anything about application state.
 * - Testability: Spreads any custom input attribute (like data-testid or aria tags)
 *   and supports standard native click emitters.
 */
export const HexButton: React.FC<HexButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  // Resolve styles from Design Tokens dictionary
  const baseClasses = `flex items-center justify-center font-bold uppercase tracking-wider ${THEME_CONFIG.components.hoverTransition} ${THEME_CONFIG.components.focusRing} select-none motion-safe:active:scale-[0.98]`;

  const variantStyles = {
    primary: THEME_CONFIG.components.primaryButton,
    secondary: THEME_CONFIG.components.secondaryButton,
    danger:
      "bg-red-50 hover:bg-red-100 text-[#b91c1c] border border-red-200 font-bold rounded-xl text-xs uppercase tracking-wider hover:shadow-[0_4px_16px_rgba(185,28,28,0.15)]",
  };

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-[10px] rounded-lg",
    md: "px-5 py-2.5 text-xs rounded-xl",
    lg: "px-7 py-3 text-sm rounded-2xl",
  };

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
