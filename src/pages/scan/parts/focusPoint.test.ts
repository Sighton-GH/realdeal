import { describe, expect, it } from "vitest";
import { tapToVideoPoint } from "./focusPoint";

describe("tapToVideoPoint", () => {
  const box = { left: 0, top: 0, width: 390, height: 844 };
  it("maps the centre to the centre", () => {
    const p = tapToVideoPoint({ x: 195, y: 422 }, box, { width: 1920, height: 1080 });
    expect(p?.x).toBeCloseTo(0.5, 5);
    expect(p?.y).toBeCloseTo(0.5, 5);
  });
  it("accounts for object-cover cropping of a landscape stream in a portrait box", () => {
    // scale = max(390/1920, 844/1080) = 0.78148; shown width = 1500.4, cropped (1500.4-390)/2 = 555.2 each side
    const p = tapToVideoPoint({ x: 0, y: 0 }, box, { width: 1920, height: 1080 });
    expect(p?.x).toBeCloseTo(555.2 / 1500.4, 3);
    expect(p?.y).toBeCloseTo(0, 5);
  });
  it("respects the box offset and clamps to 0..1", () => {
    const p = tapToVideoPoint({ x: 10, y: 2000 }, { left: 20, top: 0, width: 400, height: 400 }, { width: 400, height: 400 });
    expect(p).toEqual({ x: 0, y: 1 });
  });
  it("returns undefined before the video has a size", () => {
    expect(tapToVideoPoint({ x: 1, y: 1 }, box, { width: 0, height: 0 })).toBeUndefined();
  });
});
