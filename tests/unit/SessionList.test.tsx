import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SessionList from "@/components/molecules/SessionList";

const mockSessionId = 1;
let mockLanguage: "es" | "en" = "es";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ sessionId: mockSessionId }),
}));

vi.mock("@/store/useHiveStore", () => ({
  useHiveStore: (selector: (state: any) => any) => {
    const state = { language: mockLanguage };
    return selector(state);
  },
}));

function mockSessions() {
  return [
    { id: 1, userId: 1, ipAddress: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome/120", createdAt: new Date().toISOString(), expiresAt: new Date().toISOString() },
    { id: 2, userId: 1, ipAddress: "10.0.0.1", userAgent: "Mozilla/5.0 Firefox/121", createdAt: new Date(Date.now() - 3600000).toISOString(), expiresAt: new Date().toISOString() },
  ];
}

function mockFetchSuccess(data: any) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    json: () => Promise.resolve({ success: true, data: { sessions: data } }),
  } as Response);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLanguage = "es";
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SessionList", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<SessionList open={false} onClose={() => {}} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows loading state while fetching", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
    render(<SessionList open={true} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows error when fetch fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("Error de red")).toBeInTheDocument();
    });
  });

  it("shows error when fetch returns unsuccessfully", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: { message: "Unauthorized" } }),
    } as Response);
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("Unauthorized")).toBeInTheDocument();
    });
  });

  it("shows empty state when no sessions", async () => {
    mockFetchSuccess([]);
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("No hay sesiones activas")).toBeInTheDocument();
    });
  });

  it("renders session list with multiple sessions", async () => {
    mockFetchSuccess(mockSessions());
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("ACTUAL")).toBeInTheDocument();
      expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
      expect(screen.getByText("10.0.0.1")).toBeInTheDocument();
    });
  });

  it("does not show delete button for current session", async () => {
    mockFetchSuccess(mockSessions());
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      const deleteButtons = screen.queryAllByTitle("Revocar sesión");
      expect(deleteButtons).toHaveLength(1);
    });
  });

  it("shows confirmation dialog when revoke is clicked", async () => {
    mockFetchSuccess(mockSessions());
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      fireEvent.click(screen.getByTitle("Revocar sesión"));
    });
    expect(screen.getByText("SÍ")).toBeInTheDocument();
    expect(screen.getAllByText("NO")[0]).toBeInTheDocument();
  });

  it("cancels confirmation when NO is clicked", async () => {
    mockFetchSuccess(mockSessions());
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      fireEvent.click(screen.getByTitle("Revocar sesión"));
    });
    fireEvent.click(screen.getByText("NO"));
    expect(screen.queryByText("SÍ")).not.toBeInTheDocument();
  });

  it("revokes session when YES is clicked", async () => {
    mockFetchSuccess(mockSessions());
    const fetchMock = vi.spyOn(globalThis, "fetch");
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      fireEvent.click(screen.getByTitle("Revocar sesión"));
    });
    fireEvent.click(screen.getByText("SÍ"));
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/sessions?sessionId=2", { method: "DELETE" });
  });

  it("shows revoke all button when multiple sessions", async () => {
    mockFetchSuccess(mockSessions());
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("Revocar todas las demás sesiones")).toBeInTheDocument();
    });
  });

  it("revokes all other sessions", async () => {
    mockFetchSuccess(mockSessions());
    const fetchMock = vi.spyOn(globalThis, "fetch");
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      fireEvent.click(screen.getByText("Revocar todas las demás sesiones"));
    });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/sessions?sessionId=2", { method: "DELETE" });
    });
  });

  it("hides revoke all when only one session", async () => {
    mockFetchSuccess([mockSessions()[0]]);
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.queryByText("Revocar todas las demás sesiones")).not.toBeInTheDocument();
    });
  });

  it("shows error when revoke fails", async () => {
    let callCount = 0;
    const sessions = mockSessions();
    vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        const okResponse = {
          ok: true,
          json: () => Promise.resolve({ success: true, data: { sessions } }),
        };
        return Promise.resolve(okResponse);
      }
      return Promise.reject(new Error("fail"));
    });
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      fireEvent.click(screen.getByTitle("Revocar sesión"));
    });
    fireEvent.click(screen.getByText("SÍ"));
    await waitFor(() => {
      expect(screen.getByText("Error al revocar sesión")).toBeInTheDocument();
    });
  });

  it("calls onClose when close button is clicked", async () => {
    mockFetchSuccess(mockSessions());
    const onClose = vi.fn();
    render(<SessionList open={true} onClose={onClose} />);
    await waitFor(() => {
      fireEvent.click(screen.getByLabelText("Cerrar"));
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("truncates long user agent", async () => {
    const longUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0 ExtraLong";
    mockFetchSuccess([{ ...mockSessions()[0], userAgent: longUA }]);
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(longUA.slice(0, 50) + "…")).toBeInTheDocument();
    });
  });

  it("shows Unknown for null user agent", async () => {
    mockFetchSuccess([{ ...mockSessions()[0], userAgent: null }]);
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });
  });

  it("shows English texts when language is en", async () => {
    mockLanguage = "en";
    mockFetchSuccess([]);
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("No active sessions")).toBeInTheDocument();
    });
  });

  it("shows English text for session title", async () => {
    mockLanguage = "en";
    mockFetchSuccess(mockSessions());
    render(<SessionList open={true} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("CURRENT")).toBeInTheDocument();
    });
  });
});
