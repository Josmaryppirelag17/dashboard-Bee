import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OnboardingTour from "@/components/organisms/OnboardingTour";

const mockSetOnboardingCompleted = vi.fn();
const mockSetShowOnboarding = vi.fn();
let mockShowOnboarding = true;
let mockLanguage: "es" | "en" = "es";

vi.mock("@/store/useHiveStore", () => ({
  useHiveStore: (selector: (state: any) => any) => {
    const state = {
      language: mockLanguage,
      showOnboarding: mockShowOnboarding,
      setOnboardingCompleted: mockSetOnboardingCompleted,
      setShowOnboarding: mockSetShowOnboarding,
    };
    return selector(state);
  },
}));

vi.mock("motion/react", () => {
  const el = (tag: string) =>
    ({ children, ...props }: any) =>
      React.createElement(tag, props, children);
  return {
    motion: {
      div: el("div"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("lucide-react", () => ({
  X: () => <span data-testid="icon-x">x</span>,
  ChevronRight: () => <span data-testid="icon-chevron">chevron</span>,
  Sparkles: () => <span data-testid="icon-sparkles">sparkles</span>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockShowOnboarding = true;
  mockLanguage = "es";
});

describe("OnboardingTour", () => {
  it("returns null when showOnboarding is false", () => {
    mockShowOnboarding = false;
    const { container } = render(<OnboardingTour />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the first step with welcome message", () => {
    render(<OnboardingTour />);
    expect(screen.getByText("¡Bienvenido a BeeHive!")).toBeTruthy();
    expect(screen.getByText("Saltar tour")).toBeTruthy();
    expect(screen.getByText("Siguiente")).toBeTruthy();
  });

  it("shows skip button on first step which calls finish", () => {
    render(<OnboardingTour />);
    fireEvent.click(screen.getByText("Saltar tour"));
    expect(mockSetShowOnboarding).toHaveBeenCalledWith(false);
    expect(mockSetOnboardingCompleted).toHaveBeenCalledWith(true);
  });

  it("navigates to next step and shows prev button", () => {
    render(<OnboardingTour />);
    fireEvent.click(screen.getByText("Siguiente"));
    expect(screen.getByText("Anterior")).toBeTruthy();
  });

  it("shows done button on last step", () => {
    render(<OnboardingTour />);
    const steps = 7;
    for (let i = 0; i < steps - 1; i++) {
      fireEvent.click(screen.getByText("Siguiente"));
    }
    expect(screen.getByText("¡Empezar!")).toBeTruthy();
  });

  it("calls finish when done is clicked on last step", () => {
    render(<OnboardingTour />);
    const steps = 7;
    for (let i = 0; i < steps - 1; i++) {
      fireEvent.click(screen.getByText("Siguiente"));
    }
    fireEvent.click(screen.getByText("¡Empezar!"));
    expect(mockSetShowOnboarding).toHaveBeenCalledWith(false);
    expect(mockSetOnboardingCompleted).toHaveBeenCalledWith(true);
  });

  it("navigates back with prev button", () => {
    render(<OnboardingTour />);
    fireEvent.click(screen.getByText("Siguiente"));
    fireEvent.click(screen.getByText("Anterior"));
    expect(screen.getByText("¡Bienvenido a BeeHive!")).toBeTruthy();
  });

  it("renders step counter", () => {
    render(<OnboardingTour />);
    expect(screen.getByText("1 / 7")).toBeTruthy();
    fireEvent.click(screen.getByText("Siguiente"));
    expect(screen.getByText("2 / 7")).toBeTruthy();
  });

  it("closes tour when X button is clicked", () => {
    render(<OnboardingTour />);
    fireEvent.click(screen.getByTestId("icon-x").parentElement!);
    expect(mockSetShowOnboarding).toHaveBeenCalledWith(false);
    expect(mockSetOnboardingCompleted).toHaveBeenCalledWith(true);
  });

  it("renders in English when language is en", () => {
    mockLanguage = "en";
    render(<OnboardingTour />);
    expect(screen.getByText("Welcome to BeeHive!")).toBeTruthy();
    expect(screen.getByText("Skip tour")).toBeTruthy();
    expect(screen.getByText("Next")).toBeTruthy();
  });

  it("renders backdrop overlay", () => {
    render(<OnboardingTour />);
    const headings = screen.getAllByText(/Bienvenido|Welcome/);
    const backdrop = headings[0].closest(".fixed");
    expect(backdrop?.querySelector(".bg-black\\/40")).toBeTruthy();
    expect(backdrop).toBeTruthy();
  });

  it("renders tooltip with correct structure", () => {
    render(<OnboardingTour />);
    const tooltipText = screen.getByText("Este tour rápido te mostrará las secciones principales de la colmena. Puedes saltarlo en cualquier momento.");
    expect(tooltipText).toBeTruthy();
  });
});
