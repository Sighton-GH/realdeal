import { describe, expect, it } from "vitest";
import { mondayOf } from "./week";

describe("mondayOf", () => {
  it("returns the same day for a Monday", () => {
    expect(mondayOf(new Date("2026-09-28"))).toBe("2026-09-28");
    expect(mondayOf(new Date("2026-10-05"))).toBe("2026-10-05");
  });
  it("maps Tuesday to Sunday onto the Monday before", () => {
    expect(mondayOf(new Date("2026-09-29"))).toBe("2026-09-28");
    expect(mondayOf(new Date("2026-10-03"))).toBe("2026-09-28");
    expect(mondayOf(new Date("2026-10-04"))).toBe("2026-09-28"); // Sunday belongs to the week before
  });
  it("crosses month and year boundaries", () => {
    expect(mondayOf(new Date("2026-01-01"))).toBe("2025-12-29");
    expect(mondayOf(new Date("2026-03-01"))).toBe("2026-02-23");
  });
  it("ignores the time of day", () => {
    expect(mondayOf(new Date("2026-09-30T23:59:59Z"))).toBe("2026-09-28");
    expect(mondayOf(new Date("2026-10-05T00:00:00Z"))).toBe("2026-10-05");
  });
});
