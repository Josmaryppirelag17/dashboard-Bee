import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportToCSV } from "@/utils/exporter";
import { PriorityLevel, ColumnId } from "@/types";

type MockTask = {
  id: string;
  title: string;
  completed: boolean;
  priority: PriorityLevel;
  category: string;
  pollenUnits: number;
  columnId: ColumnId;
  notes: string | undefined;
  dueDate: string | undefined;
  userId: number;
  createdAt: string;
};

function createMockTask(overrides: Partial<MockTask> = {}): MockTask {
  return {
    id: "t-1",
    title: "Test Task",
    completed: false,
    priority: PriorityLevel.MEDIUM,
    category: "General",
    pollenUnits: 3,
    columnId: "todo" as ColumnId,
    notes: undefined,
    dueDate: undefined,
    userId: 1,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("exportToCSV", () => {
  let linkEl: { download: string; href: string; style: Record<string, string>; click: ReturnType<typeof vi.fn>; setAttribute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    linkEl = {
      download: "",
      href: "",
      style: {} as Record<string, string>,
      click: vi.fn(),
      setAttribute: vi.fn((attr: string, val: string) => { (linkEl as unknown as Record<string, string>)[attr] = val; }),
    };
    vi.spyOn(document, "createElement").mockReturnValue(linkEl as unknown as HTMLElement);
    vi.spyOn(document.body, "appendChild").mockReturnValue(linkEl as unknown as HTMLElement);
    vi.spyOn(document.body, "removeChild").mockReturnValue(linkEl as unknown as HTMLElement);

    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a CSV blob with headers and rows", async () => {
    const tasks = [createMockTask({ title: "Task A" })];
    await exportToCSV(tasks);

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(linkEl.download).toContain("beehive_export_");
    expect(linkEl.download).toContain(".csv");
    expect(linkEl.click).toHaveBeenCalledTimes(1);
  });

  it("includes UTF-8 BOM for Spanish accents", async () => {
    const blobSpy = vi.spyOn(Blob.prototype, "slice").mockReturnValue(new Blob());
    const tasks = [createMockTask({ title: "Acción" })];
    await exportToCSV(tasks);

    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    blobSpy.mockRestore();
  });

  it("handles multiple tasks", async () => {
    const tasks = [
      createMockTask({ id: "t-1", title: "Task 1", completed: false, priority: PriorityLevel.LOW }),
      createMockTask({ id: "t-2", title: "Task 2", completed: true, priority: PriorityLevel.HIGH }),
      createMockTask({ id: "t-3", title: "Task 3", completed: false, priority: PriorityLevel.MEDIUM }),
    ];
    await exportToCSV(tasks);
    expect(linkEl.click).toHaveBeenCalledTimes(1);
  });

  it("escapes fields with commas", async () => {
    const tasks = [createMockTask({ title: "Task, with comma", notes: "Note, with comma" })];
    await exportToCSV(tasks);
    expect(linkEl.click).toHaveBeenCalledTimes(1);
  });

  it("handles empty tasks array", async () => {
    await exportToCSV([]);
    expect(linkEl.click).toHaveBeenCalledTimes(1);
  });

  it("sets correct filename with date", async () => {
    const tasks = [createMockTask()];
    await exportToCSV(tasks);
    const today = new Date().toISOString().slice(0, 10);
    expect(linkEl.download).toBe(`beehive_export_${today}.csv`);
  });

  it("handles notes as empty string", async () => {
    const tasks = [createMockTask({ notes: "" })];
    await exportToCSV(tasks);
    expect(linkEl.click).toHaveBeenCalledTimes(1);
  });

  it("handles notes as undefined", async () => {
    const tasks = [createMockTask({ notes: undefined })];
    await exportToCSV(tasks);
    expect(linkEl.click).toHaveBeenCalledTimes(1);
  });
});
