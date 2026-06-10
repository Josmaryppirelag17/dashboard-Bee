import React from "react";
import { motion } from "motion/react";
import { Flame, TrendingUp, CheckCircle2, Clock, Zap, Trophy, Target } from "lucide-react";

export type ProgressHexIconType =
  | "flame"
  | "trending-up"
  | "check-cycle"
  | "clock"
  | "zap"
  | "trophy"
  | "target";

interface ProgressHexProps {
  progressPercent: number; // 0 to 100
  accentColor: string;
  iconName: ProgressHexIconType;
  className?: string;
  id?: string;
}

const renderHexIcon = (name: ProgressHexIconType, hexColor: string) => {
  const props = { className: "w-5 h-5 stroke-[2.2]", style: { color: hexColor } };
  switch (name) {
    case "flame":
      return <Flame {...props} />;
    case "trending-up":
      return <TrendingUp {...props} />;
    case "check-cycle":
      return <CheckCircle2 {...props} />;
    case "clock":
      return <Clock {...props} />;
    case "zap":
      return <Zap {...props} />;
    case "trophy":
      return <Trophy {...props} />;
    case "target":
      return <Target {...props} />;
    default:
      return <Flame {...props} />;
  }
};

/**
 * Atom: ProgressHex
 *
 * DESIGN ARCHITECTURE BRIEF (Staff Frontend Engineer):
 * - SRP: Handles geometry rendering of active progress in a closed hexagonal coordinate.
 * - Performance: Utilizes simple framer-motion anchors on the stroke dash-offset property,
 *   leveraging hardware acceleration instead of slow intervals on paths.
 */
export const ProgressHex: React.FC<ProgressHexProps> = ({
  progressPercent = 75,
  accentColor,
  iconName,
  className = "",
  id,
}) => {
  // Perimeter of the regular hexagon coordinate set roughly equals 272 units.
  const perimeter = 272;
  const strokeOffset = perimeter - (perimeter * Math.min(100, Math.max(0, progressPercent))) / 100;

  return (
    <div
      id={id}
      className={`relative w-11.5 h-11.5 flex items-center justify-center select-none shrink-0 ${className}`}
      role="progressbar"
      aria-valuenow={progressPercent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        className="absolute inset-0 w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        {/* Hexagon Track Background */}
        <path
          d="M 50 5 L 91 29 L 91 71 L 50 95 L 9 71 L 9 29 Z"
          fill="none"
          stroke="#f5eedd"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Progress path overlay */}
        <motion.path
          d="M 50 5 L 91 29 L 91 71 L 50 95 L 9 71 L 9 29 Z"
          fill="none"
          stroke={accentColor}
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ strokeDashoffset: perimeter }}
          animate={{ strokeDashoffset: strokeOffset }}
          transition={{ type: "spring", stiffness: 90, damping: 15 }}
          strokeDasharray={perimeter}
        />
      </svg>
      {/* Icon centered overlays */}
      <div
        className="relative z-10 filter drop-shadow-[0_2px_4px_rgba(226,136,0,0.15)]"
        aria-hidden="true"
      >
        {renderHexIcon(iconName, accentColor)}
      </div>
    </div>
  );
};
