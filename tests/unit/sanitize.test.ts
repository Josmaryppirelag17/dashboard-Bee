import { describe, it, expect } from "vitest";
import { sanitizeInput } from "@/utils/sanitize";

describe("sanitizeInput", () => {
  it("returns empty string for empty input", () => {
    expect(sanitizeInput("")).toBe("");
    expect(sanitizeInput("   ")).toBe("");
    expect(sanitizeInput(null as any)).toBe("");
    expect(sanitizeInput(undefined as any)).toBe("");
  });

  it("trims whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("escapes HTML special characters", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;",
    );
    expect(sanitizeInput('"hello" & "world"')).toBe("&quot;hello&quot; &amp; &quot;world&quot;");
  });

  it("preserves safe text", () => {
    expect(sanitizeInput("normal text with numbers 123")).toBe("normal text with numbers 123");
    expect(sanitizeInput("añadir tarea importante")).toBe("añadir tarea importante");
  });
});
