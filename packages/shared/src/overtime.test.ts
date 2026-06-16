import { describe, expect, it } from "vitest";
import { calculateWeeklyPay } from "./overtime";

describe("calculateWeeklyPay", () => {
  it("no overtime below 40h", () => {
    const result = calculateWeeklyPay(32, 18);
    expect(result.regularHours).toBe(32);
    expect(result.overtimeHours).toBe(0);
    expect(result.regularPay).toBe(576);
    expect(result.overtimePay).toBe(0);
    expect(result.totalPay).toBe(576);
  });

  it("exactly 40h produces no overtime", () => {
    const result = calculateWeeklyPay(40, 22.5);
    expect(result.regularHours).toBe(40);
    expect(result.overtimeHours).toBe(0);
    expect(result.regularPay).toBe(900);
    expect(result.overtimePay).toBe(0);
    expect(result.totalPay).toBe(900);
  });

  it("calculates overtime correctly when exceeding 40h", () => {
    const result = calculateWeeklyPay(45.5, 22.5);
    expect(result.regularHours).toBe(40);
    expect(result.overtimeHours).toBe(5.5);
    expect(result.regularPay).toBe(900);
    expect(result.overtimePay).toBe(185.63);
    expect(result.totalPay).toBe(1085.63);
  });

  it("handles decimal hours correctly", () => {
    const result = calculateWeeklyPay(40.25, 20);
    expect(result.regularHours).toBe(40);
    expect(result.overtimeHours).toBe(0.25);
    expect(result.regularPay).toBe(800);
    expect(result.overtimePay).toBe(7.5);
    expect(result.totalPay).toBe(807.5);
  });

  it("handles zero hours", () => {
    const result = calculateWeeklyPay(0, 25);
    expect(result.regularHours).toBe(0);
    expect(result.overtimeHours).toBe(0);
    expect(result.totalPay).toBe(0);
  });

  it("rounds pay to 2 decimal places", () => {
    const result = calculateWeeklyPay(41, 15.33);
    // 1h overtime * 15.33 * 1.5 = 22.995, rounds to 23
    expect(result.overtimePay).toBe(23);
    expect(Number.isFinite(result.totalPay)).toBe(true);
  });

  it("totalHours reflects the input", () => {
    const result = calculateWeeklyPay(48, 20);
    expect(result.totalHours).toBe(48);
  });
});
