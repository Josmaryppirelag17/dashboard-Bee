import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "@/components/molecules/TaskCard";
import { Task, PriorityLevel } from "@/types";

vi.mock("motion/react", () => {
  const MockDiv = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  return {
    motion: {
      div: MockDiv,
      button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      path: (props: any) => <path {...props} />,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("lucide-react", () => ({
  Check: () => <span>check-icon</span>,
  Trash2: () => <span>trash-icon</span>,
  GripVertical: () => <span>grip-icon</span>,
  FileText: () => <span>file-text-icon</span>,
  Loader2: () => <span>loader-icon</span>,
}));

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Test Task",
    completed: false,
    priority: PriorityLevel.MEDIUM,
    category: "General",
    pollenUnits: 2,
    columnId: "todo",
    ...overrides,
  };
}

describe("TaskCard", () => {
  describe("container", () => {
    it("renders children", () => {
      render(
        <TaskCard task={createTask()} onToggle={() => {}} onDelete={() => {}}>
          <TaskCard.Body />
        </TaskCard>,
      );
      expect(screen.getByText("Test Task")).toBeInTheDocument();
    });

    it("shows completed styling when task is done", () => {
      render(
        <TaskCard task={createTask({ completed: true })} onToggle={() => {}} onDelete={() => {}}>
          <TaskCard.Body />
        </TaskCard>,
      );
      const title = screen.getByText("Test Task");
      expect(title.className).toContain("line-through");
    });
  });

  describe("Checkbox", () => {
    it("calls onToggle when clicked", () => {
      const onToggle = vi.fn();
      render(
        <TaskCard task={createTask()} onToggle={onToggle} onDelete={() => {}}>
          <TaskCard.Checkbox />
        </TaskCard>,
      );
      fireEvent.click(screen.getByLabelText("Completar labor del panal"));
      expect(onToggle).toHaveBeenCalledOnce();
    });

    it("shows check icon when completed", () => {
      render(
        <TaskCard task={createTask({ completed: true })} onToggle={() => {}} onDelete={() => {}}>
          <TaskCard.Checkbox />
        </TaskCard>,
      );
      expect(screen.getByLabelText("Marcar labor como incompleta")).toBeInTheDocument();
    });
  });

  describe("Body", () => {
    it("renders title, category, and priority badge", () => {
      render(
        <TaskCard
          task={createTask({ priority: PriorityLevel.HIGH, category: "Development" })}
          onToggle={() => {}}
          onDelete={() => {}}
        >
          <TaskCard.Body />
        </TaskCard>,
      );
      expect(screen.getByText("Test Task")).toBeInTheDocument();
      expect(screen.getByText("Development")).toBeInTheDocument();
      expect(screen.getByText("Prioridad Alta")).toBeInTheDocument();
    });

    it("toggles notes when title is clicked", () => {
      render(
        <TaskCard task={createTask()} onToggle={() => {}} onDelete={() => {}}>
          <TaskCard.Body />
        </TaskCard>,
      );
      fireEvent.click(screen.getByText("Test Task"));
      expect(screen.getByText("Cargando editor del panal...")).toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("calls onDelete when delete button clicked", () => {
      const onDelete = vi.fn();
      render(
        <TaskCard task={createTask()} onToggle={() => {}} onDelete={onDelete}>
          <TaskCard.Actions />
        </TaskCard>,
      );
      fireEvent.click(screen.getByLabelText("Eliminar labor"));
      expect(onDelete).toHaveBeenCalledOnce();
    });

    it("opens notes when notes button is clicked", () => {
      render(
        <TaskCard
          task={createTask({ notes: "some notes" })}
          onToggle={() => {}}
          onDelete={() => {}}
        >
          <TaskCard.Actions />
        </TaskCard>,
      );
      fireEvent.click(screen.getByLabelText("Ver notas de labor"));
      expect(screen.getByText("Cargando editor del panal...")).toBeInTheDocument();
    });

    it("shows notes indicator dot when task has notes", () => {
      render(
        <TaskCard task={createTask({ notes: "has notes" })} onToggle={() => {}} onDelete={() => {}}>
          <TaskCard.Actions />
        </TaskCard>,
      );
      const activeDot = document.querySelector(".animate-pulse");
      expect(activeDot).toBeInTheDocument();
    });
  });

  describe("Pollen", () => {
    it("renders pollen indicator", () => {
      const { container } = render(
        <TaskCard task={createTask({ pollenUnits: 3 })} onToggle={() => {}} onDelete={() => {}}>
          <TaskCard.Pollen />
        </TaskCard>,
      );
      expect(container.querySelector(".hidden")).toBeInTheDocument();
    });
  });

  describe("DragHandle", () => {
    it("renders with aria-label", () => {
      render(
        <TaskCard task={createTask()} onToggle={() => {}} onDelete={() => {}}>
          <TaskCard.DragHandle />
        </TaskCard>,
      );
      expect(screen.getByLabelText("Manija para ordenar labor")).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("throws when sub-component used outside TaskCard", () => {
      expect(() => render(<TaskCard.Body />)).toThrow(
        "TaskCard compound elements must be encapsulated inside a <TaskCard> container.",
      );
    });
  });
});
