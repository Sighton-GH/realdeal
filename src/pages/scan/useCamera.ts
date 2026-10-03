import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

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

interface TorchCapabilities {
  torch?: boolean;
}

interface TorchConstraintSet {
  advanced: Array<{ torch: boolean }>;
}

function errorName(err: unknown): string {
  return err instanceof DOMException || err instanceof Error ? err.name : "";
}

export function useCamera(): UseCamera {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(false);
  // Bumped on every start/stop so a slow getUserMedia result can tell it was superseded.
  const requestRef = useRef(0);
  const wantLiveRef = useRef(false);
  const deviceIdsRef = useRef<string[]>([]);
  const deviceIndexRef = useRef(-1);
  const torchOnRef = useRef(false);

  const [state, setState] = useState<CameraState>("idle");
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [canSwitch, setCanSwitch] = useState(false);

  const invalidateRequests = useCallback(() => {
    requestRef.current++;
  }, []);

  const releaseStream = useCallback(() => {
    const stream = streamRef.current;
    streamRef.current = null;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    const video = videoRef.current;
    if (video) video.srcObject = null;
  }, []);

  const resetTorch = useCallback(() => {
    torchOnRef.current = false;
    setTorchOn(false);
    setTorchSupported(false);
  }, []);

  const open = useCallback(
    async (deviceId?: string): Promise<void> => {
      if (!window.isSecureContext) {
        setState("insecure");
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setState("unavailable");
        return;
      }

      const request = ++requestRef.current;
      releaseStream();
      resetTorch();
      wantLiveRef.current = true;
      setState("starting");

      const video: MediaTrackConstraints = deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        : { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
      } catch (err) {
        if (request !== requestRef.current || !mountedRef.current) return;
        wantLiveRef.current = false;
        const name = errorName(err);
        setState(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
        return;
      }

      // Superseded, stopped, or unmounted while the permission prompt was open: don't leak the stream.
      if (request !== requestRef.current || !mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      const el = videoRef.current;
      if (el) {
        el.playsInline = true;
        el.muted = true;
        el.srcObject = stream;
        try {
          await el.play();
        } catch {
          // Autoplay can reject if the element was swapped out mid-start; the stream is still attached.
        }
        if (request !== requestRef.current || !mountedRef.current) return;
      }

      const track = stream.getVideoTracks()[0];
      const caps = track?.getCapabilities?.() as TorchCapabilities | undefined;
      setTorchSupported(Boolean(caps?.torch));
      setState("live");

      // Device labels and ids are only reliable after permission has been granted.
      try {
        const devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput");
        if (request !== requestRef.current || !mountedRef.current) return;
        deviceIdsRef.current = devices.map((d) => d.deviceId);
        const activeId = track?.getSettings().deviceId;
        const idx = activeId ? deviceIdsRef.current.indexOf(activeId) : -1;
        deviceIndexRef.current = idx;
        setCanSwitch(devices.length > 1);
      } catch {
        setCanSwitch(false);
      }
    },
    [releaseStream, resetTorch],
  );

  const start = useCallback(() => open(), [open]);

  const stop = useCallback(() => {
    invalidateRequests();
    wantLiveRef.current = false;
    releaseStream();
    resetTorch();
    if (mountedRef.current) setState("idle");
  }, [releaseStream, resetTorch, invalidateRequests]);

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOnRef.current;
    const constraints: TorchConstraintSet = { advanced: [{ torch: next }] };
    try {
      await track.applyConstraints(constraints as unknown as MediaTrackConstraints);
      torchOnRef.current = next;
      setTorchOn(next);
    } catch {
      // Torch refused (hardware busy or unsupported): leave the state as it was.
    }
  }, []);

  const switchCamera = useCallback(async () => {
    const ids = deviceIdsRef.current;
    if (ids.length < 2) return;
    const nextIndex = (deviceIndexRef.current + 1) % ids.length;
    deviceIndexRef.current = nextIndex;
    await open(ids[nextIndex]);
  }, [open]);

  // Mount/unmount. Setting mountedRef in the effect (not at init) keeps StrictMode's
  // mount, cleanup, mount sequence correct.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      invalidateRequests();
      wantLiveRef.current = false;
      releaseStream();
    };
  }, [releaseStream, invalidateRequests]);

  // Release the camera when the tab is hidden; restart when it comes back if it was live.
  useEffect(() => {
    let resumeOnVisible = false;
    let resumeDeviceId: string | undefined;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (wantLiveRef.current) {
          resumeOnVisible = true;
          resumeDeviceId = deviceIdsRef.current[deviceIndexRef.current];
          stop();
        }
      } else if (resumeOnVisible) {
        resumeOnVisible = false;
        void open(resumeDeviceId);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [open, stop]);

  return { videoRef, state, start, stop, torchSupported, torchOn, toggleTorch, canSwitch, switchCamera };
}
