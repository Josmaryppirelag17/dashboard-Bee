import { describe, it, expect } from "vitest";
import { checkPassword, validatePassword, PASSWORD_RULES } from "@/lib/password-validation";

describe("checkPassword", () => {
  it("returns all checks met for a strong password", () => {
    const checks = checkPassword("Str0ng!Pass");
    expect(checks.every((c) => c.met)).toBe(true);
    expect(checks).toHaveLength(5);
  });

  it("fails min length for short password", () => {
    const checks = checkPassword("Ab1!");
    const min = checks.find((c) => c.key === "min");
    expect(min?.met).toBe(false);
  });

  it("fails uppercase when missing", () => {
    const checks = checkPassword("ab1!defg");
    const upper = checks.find((c) => c.key === "upper");
    expect(upper?.met).toBe(false);
  });

  it("fails lowercase when missing", () => {
    const checks = checkPassword("AB1!DEFG");
    const lower = checks.find((c) => c.key === "lower");
    expect(lower?.met).toBe(false);
  });

  it("fails digit when missing", () => {
    const checks = checkPassword("Abc!defg");
    const digit = checks.find((c) => c.key === "digit");
    expect(digit?.met).toBe(false);
  });

  it("fails symbol when missing", () => {
    const checks = checkPassword("Ab1cdefg");
    const symbol = checks.find((c) => c.key === "symbol");
    expect(symbol?.met).toBe(false);
  });

  it("checks for symbols like spaces", () => {
    const checks = checkPassword("Ab1 defg");
    const symbol = checks.find((c) => c.key === "symbol");
    expect(symbol?.met).toBe(true);
  });
});

describe("validatePassword", () => {
  it("returns valid for a strong password", () => {
    const result = validatePassword("Str0ng!Pass");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns errors for weak password", () => {
    const result = validatePassword("weak");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("detects common passwords", () => {
    const result = validatePassword("password1");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Esta contraseña es demasiado común");
  });

  it("detects common password regardless of case", () => {
    const result = validatePassword("Password1");
    expect(result.errors).toContain("Esta contraseña es demasiado común");
  });

  it("collects all errors together", () => {
    const result = validatePassword("12345678");
    const hasCommonError = result.errors.some((e) => e.includes("común"));
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
    expect(hasCommonError).toBe(true);
  });
});
