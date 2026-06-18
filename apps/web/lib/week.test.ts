import { describe, expect, it } from "vitest";
import { addWeeks, formatWeekRange, getWeekEnd, getWeekStart } from "./week";

describe("getWeekStart", () => {
  it("returns Monday for a mid-week date", () => {
    expect(getWeekStart("2024-06-12")).toBe("2024-06-10"); // Wed → Mon
  });

  it("returns same day when already Monday", () => {
    expect(getWeekStart("2024-06-10")).toBe("2024-06-10");
  });

  it("returns previous Monday for Sunday (not next Monday)", () => {
    expect(getWeekStart("2024-06-16")).toBe("2024-06-10"); // Sun → Mon of same week
  });

  it("returns correct Monday at year boundary", () => {
    expect(getWeekStart("2025-01-01")).toBe("2024-12-30"); // Wed Jan 1 2025 → Mon Dec 30 2024
  });
});

describe("getWeekEnd", () => {
  it("returns Sunday 6 days after the Monday", () => {
    expect(getWeekEnd("2024-06-10")).toBe("2024-06-16");
  });
});

describe("addWeeks", () => {
  it("advances by one week", () => {
    expect(addWeeks("2024-06-10", 1)).toBe("2024-06-17");
  });

  it("goes back by one week", () => {
    expect(addWeeks("2024-06-10", -1)).toBe("2024-06-03");
  });

  it("returns same date with delta 0", () => {
    expect(addWeeks("2024-06-10", 0)).toBe("2024-06-10");
  });
});

describe("formatWeekRange", () => {
  it("formats a week range correctly", () => {
    expect(formatWeekRange("2024-06-10")).toBe("Jun 10 – Jun 16");
  });

  it("formats a range that spans two months", () => {
    expect(formatWeekRange("2024-06-24")).toBe("Jun 24 – Jun 30");
  });
});
