// STUB (SPEC-00). SCR-13 replaces. Contract used by ScanPage (SCR-14).
import { useRef, useState, type RefObject } from "react";

export type CameraState = "idle" | "starting" | "live" | "denied" | "unavailable" | "insecure";

export interface UseCamera {
  videoRef: RefObject<HTMLVideoElement | null>;
  state: CameraState;
  start: () => Promise<void>;
  stop: () => void;
  torchSupported: boolean;
  torchOn: boolean;
  toggleTorch: () => Promise<void>;
  canSwitch: boolean;
  switchCamera: () => Promise<void>;
}

export function useCamera(): UseCamera {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state] = useState<CameraState>("unavailable");
  return { videoRef, state, start: async () => undefined, stop: () => undefined, torchSupported: false, torchOn: false, toggleTorch: async () => undefined, canSwitch: false, switchCamera: async () => undefined };
}
