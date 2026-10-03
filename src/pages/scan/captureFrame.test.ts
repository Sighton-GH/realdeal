import { describe, expect, it } from "vitest";
import { mapRectToVideo } from "./captureFrame";

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 5);

describe("mapRectToVideo", () => {
  it("crops horizontally for a 4:3 video in a 9:16 element", () => {
    // element 360x640, video 1280x960: scale = max(0.28125, 0.6667) = 0.6667
    // scaled video is 853.33 wide, offsetX = (360 - 853.33) / 2 = -246.67
    const r = mapRectToVideo({ x: 0, y: 0, width: 360, height: 640 }, { width: 360, height: 640 }, { width: 1280, height: 960 });
    close(r.x, 370);
    close(r.y, 0);
    close(r.width, 540);
    close(r.height, 960);
  });

  it("crops horizontally for a 16:9 video in a 9:16 element", () => {
    // element 360x640, video 1920x1080: scale = 640/1080, visible width = 360 / scale = 607.5
    const r = mapRectToVideo({ x: 0, y: 0, width: 360, height: 640 }, { width: 360, height: 640 }, { width: 1920, height: 1080 });
    close(r.x, (1920 - 607.5) / 2);
    close(r.y, 0);
    close(r.width, 607.5);
    close(r.height, 1080);
  });

  it("maps a guide inside a 16:9 video in a 9:16 element", () => {
    const scale = 640 / 1080;
    const r = mapRectToVideo({ x: 60, y: 160, width: 240, height: 320 }, { width: 360, height: 640 }, { width: 1920, height: 1080 });
    const offsetX = (360 - 1920 * scale) / 2;
    close(r.x, (60 - offsetX) / scale);
    close(r.y, 160 / scale);
    close(r.width, 240 / scale);
    close(r.height, 320 / scale);
  });

  it("is a straight scale when the aspect ratios match", () => {
    const r = mapRectToVideo({ x: 100, y: 50, width: 200, height: 100 }, { width: 400, height: 300 }, { width: 1600, height: 1200 });
    expect(r).toEqual({ x: 400, y: 200, width: 800, height: 400 });
  });

  it("clamps rects that spill past the element edges", () => {
    const r = mapRectToVideo({ x: -50, y: -20, width: 600, height: 400 }, { width: 400, height: 300 }, { width: 1600, height: 1200 });
    expect(r).toEqual({ x: 0, y: 0, width: 1600, height: 1200 });
  });

  it("clamps a rect that sits fully outside the video", () => {
    const r = mapRectToVideo({ x: 500, y: 400, width: 50, height: 50 }, { width: 400, height: 300 }, { width: 1600, height: 1200 });
    expect(r.width).toBe(0);
    expect(r.height).toBe(0);
    expect(r.x).toBe(1600);
    expect(r.y).toBe(1200);
  });
});
