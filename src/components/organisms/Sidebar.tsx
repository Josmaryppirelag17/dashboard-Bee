import React, { useMemo } from "react";
import {
  LayoutDashboard,
  Flame,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  Dice5,
  Globe,
  Award,
} from "lucide-react";
import { SidebarItem } from "@/types";
import { THEME } from "@/theme";
import { useHiveStore } from "@/store/useHiveStore";
import { translations } from "@/utils/translations";
import { secureRandomIndex } from "@/utils/random";
import AuthButton from "@/components/molecules/AuthButton";

interface SidebarProps {
  currentTab: string;
  onTabChange: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const BEE_PREFIXES_ES = [
  "Reina",
  "Obrera",
  "Abeja",
  "Zángano",
  "Exploradora",
  "Néctar",
  "Zumbadora",
  "Larva",
];
const BEE_SUFFIXES_ES = [
  "Mellifera",
  "Dorada",
  "Veloz",
  "Productiva",
  "Trabajadora",
  "Constante",
  "Gladiadora",
  "DeElite",
];

const BEE_PREFIXES_EN = ["Queen", "Worker", "Bee", "Drone", "Forager", "Nectar", "Buzzer", "Larva"];
const BEE_SUFFIXES_EN = [
  "Mellifera",
  "Golden",
  "Swift",
  "Productive",
  "Determined",
  "Steady",
  "Gladiator",
  "Elite",
];

export default function Sidebar({
  currentTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const language = useHiveStore((state) => state.language);
  const setLanguage = useHiveStore((state) => state.setLanguage);
  const t = translations[language];

  // Retrieve state and functions from store
  const userBeeName = useHiveStore((state) => state.userBeeName);
  const setUserBeeName = useHiveStore((state) => state.setUserBeeName);
  const level = useHiveStore((state) => state.level);
  const xp = useHiveStore((state) => state.xp);

  // Maximum XP needed for this level: level * 150
  const xpNeeded = useMemo(() => level * 150, [level]);
  const xpPercentage = useMemo(
    () => Math.min(Math.round((xp / xpNeeded) * 100), 100),
    [xp, xpNeeded],
  );

  const menuItems: SidebarItem[] = [
    { id: "dashboard", label: t.sidebar.dashboard, iconName: "panel" },
    { id: "focus", label: t.sidebar.focus, iconName: "focus", badge: t.sidebar.badgeActive },
    { id: "analytics", label: t.sidebar.analytics, iconName: "analytics" },
  ];

  const getMenuIcon = (name: string, active: boolean) => {
    const iconClass = `w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
      active
        ? "text-[#e28800] filter drop-shadow-[0_1.5px_3px_rgba(226,136,0,0.2)]"
        : "text-[#5c5449]"
    }`;
    switch (name) {
      case "panel":
        return <LayoutDashboard className={iconClass} />;
      case "focus":
        return <Flame className={iconClass} />;
      case "analytics":
        return <TrendingUp className={iconClass} />;
      default:
        return <LayoutDashboard className={iconClass} />;
    }
  };

  const handleRandomizeName = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prefixes = language === "en" ? BEE_PREFIXES_EN : BEE_PREFIXES_ES;
    const suffixes = language === "en" ? BEE_SUFFIXES_EN : BEE_SUFFIXES_ES;
    const randomPre = prefixes[secureRandomIndex(prefixes.length)];
    const randomSuf = suffixes[secureRandomIndex(suffixes.length)];
    const randomNum = secureRandomIndex(900) + 100;
    const newName = `${randomPre}_${randomSuf}_${randomNum}`;
    setUserBeeName(newName);
  };

  return (
    <div
      className={`relative h-screen bg-[#f9f5ec] border-r border-[#ebdcb9] flex flex-col justify-between transition-all duration-300 ease-out select-none flex-shrink-0 z-30 shadow-[4px_0_24px_rgba(110,80,45,0.02)]
        ${isCollapsed ? "w-[72px]" : "w-[245px]"}
      `}
    >
      {/* Upper Logo / Brand Section */}
      <div>
        <div
          className={`p-6 flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} border-b border-[#ebdcb9]/40`}
        >
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            {/* Double layered hexagon logo */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full fill-[#e28800] animate-pulse"
              aria-hidden="true"
            >
              <path
                d="M 50 0 L 93 25 L 93 75 L 50 100 L 7 75 L 7 25 Z"
                fillOpacity="0.12"
                stroke="#e28800"
                strokeWidth="4.5"
              />
            </svg>
            <div className="text-xs font-black text-[#e28800] tracking-tighter relative z-10 font-sans">
              BH
            </div>
          </div>

          {!isCollapsed && (
            <div className="animate-fade-in flex-1">
              <h1 className="text-sm font-black tracking-wider text-[#100f0d] uppercase flex items-center gap-1">
                BeeHive{" "}
                <Sparkles
                  className="w-3.5 h-3.5 text-[#e28800] animate-spin"
                  style={{ animationDuration: "6s" }}
                  aria-hidden="true"
                />
              </h1>
              <span className="text-[9px] text-[#e28800] tracking-widest font-extrabold uppercase block -mt-0.5">
                Productive
              </span>
            </div>
          )}
        </div>

        {/* Navigation Options */}
        <nav
          className="p-4 space-y-2 mt-4"
          aria-label={language === "en" ? "Main navigation" : "Navegación principal"}
        >
          {menuItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`w-full group relative flex items-center ${
                  isCollapsed ? "justify-center px-0" : "px-3.5 justify-between"
                } py-3 rounded-2xl transition-all duration-300 hover:scale-[1.01] focus:outline-none ${
                  THEME.cardStyles.focusOutline
                } ${
                  active
                    ? "bg-[#e28800]/8 text-[#100f0d] border-l-3 border-[#e28800] font-bold shadow-sm"
                    : "text-[#5c5449] hover:bg-[#faf6ee] hover:text-[#100f0d]"
                }
                `}
              >
                <div className="flex items-center space-x-3">
                  {getMenuIcon(item.iconName, active)}
                  {!isCollapsed && (
                    <span className="text-xs font-bold tracking-wide">{item.label}</span>
                  )}
                </div>

                {/* Badge rendering */}
                {item.badge && !isCollapsed && (
                  <span className="text-[9px] font-extrabold text-[#e28800] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip on collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-[76px] hidden group-hover:block bg-white text-[#100f0d] border border-[#ebdcb9] text-[10px] font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap shadow-md z-50 pointer-events-none">
                    {item.label}
                    {item.badge && (
                      <span className="ml-1.5 text-[8.5px] bg-[#e28800] text-white px-1 py-0.5 rounded font-bold">
                        LIVE
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile, dynamic XP progress bar, and language controllers */}
      <div className="p-4 border-t border-[#ebdcb9]/40 space-y-4">
        {/* Language Pill Selector */}
        {!isCollapsed ? (
          <div className="bg-[#faf6ee] border border-[#ebdcb9]/50 rounded-2xl p-1.5 flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#5c5449] uppercase tracking-wider pl-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#e28800]" />
              {language === "en" ? "Language" : "Idioma"}
            </span>
            <div className="flex bg-white border border-[#ebdcb9]/30 rounded-xl p-0.5">
              <button
                onClick={() => setLanguage("es")}
                className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition-colors cursor-pointer ${
                  language === "es"
                    ? "bg-[#e28800] text-white"
                    : "text-[#5c5449] hover:bg-amber-100/50"
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition-colors cursor-pointer ${
                  language === "en"
                    ? "bg-[#e28800] text-white"
                    : "text-[#5c5449] hover:bg-amber-100/50"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setLanguage(language === "es" ? "en" : "es")}
            className="w-full flex justify-center p-2 rounded-xl bg-[#faf6ee] border border-[#ebdcb9]/50 text-[#e28800] hover:bg-amber-100/50 cursor-pointer"
            title={language === "es" ? "Cambiar a Inglés" : "Switch to Spanish"}
          >
            <span className="text-[10px] font-bold uppercase">{language.toUpperCase()}</span>
          </button>
        )}

        {/* Dynamic Gamification Level Progress Box */}
        {!isCollapsed && (
          <div className="bg-gradient-to-br from-[#faf6ee] to-white border border-[#ebdcb9]/60 rounded-2xl p-3 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-extrabold text-[#5c5449] uppercase tracking-widest flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#e28800]" />
                {language === "en" ? "SWARM LEVEL" : "NIVEL ENJAMBRE"}
              </span>
              <span className="text-[11px] font-black text-[#e28800] bg-amber-50 border border-[#e28800]/20 px-2 py-0.5 rounded-lg">
                {level}
              </span>
            </div>

            {/* The XP Bar */}
            <div className="w-full bg-[#ebdcb9]/30 h-2.5 rounded-full overflow-hidden mb-1">
              <div
                className="bg-gradient-to-r from-[#e28800] to-[#faa715] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[8px] text-[#5c5449] font-bold uppercase">
              <span>{xp} XP</span>
              <span>{xpNeeded} XP</span>
            </div>
          </div>
        )}

        {/* Auth Button */}
        <AuthButton collapsed={isCollapsed} />

        {/* User Card */}
        <div
          className={`p-2.5 rounded-2xl bg-white/60 border border-[#ebdcb9]/50 flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}
        >
          <div className="relative w-8.5 h-8.5 rounded-xl bg-[#faf6ee] border border-[#e28800]/25 flex items-center justify-center text-[#e28800] shrink-0">
            <User className="w-4 h-4 stroke-[2]" />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-[#e28800] border-2 border-white rounded-full animate-bounce"
              title={language === "es" ? "Apicultor En Línea" : "Beekeeper Online"}
              aria-hidden="true"
            />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1 animate-fade-in select-none">
              <span className="text-[9px] font-black text-[#5c5449] flex items-center justify-between uppercase tracking-wide">
                <span>{t.sidebar.beekeeprTitle}</span>
                <button
                  onClick={handleRandomizeName}
                  className="text-[#ebdcb9] hover:text-[#e28800] transition-colors p-0.5 cursor-pointer"
                  aria-label={
                    language === "en" ? "Randomize bee name" : "Nombre de abeja aleatoria"
                  }
                  title={language === "en" ? "Randomize bee name" : "Nombre de abeja aleatoria"}
                >
                  <Dice5 className="w-3 h-3" />
                </button>
              </span>
              <span
                className="text-[10px] text-[#e28800] block truncate font-mono font-bold"
                title={userBeeName}
              >
                {userBeeName}
              </span>
            </div>
          )}
        </div>

        {/* Retract button trigger */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2.5 text-[#5c5449] hover:text-[#e28800] hover:bg-[#faf6ee] rounded-xl border border-transparent hover:border-[#ebdcb9]/40 transition-all duration-200 focus:outline-none"
          aria-label={isCollapsed ? t.sidebar.expand : t.sidebar.collapse}
          title={isCollapsed ? t.sidebar.expand : t.sidebar.collapse}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center space-x-2 text-[10.5px] font-bold uppercase tracking-wider">
              <ChevronLeft className="w-4 h-4" />
              <span>{t.sidebar.collapseMenu}</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
