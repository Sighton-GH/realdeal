import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { Verdict } from "@shared/types";
import { play } from "@/lib/sfx";
import { createEffects, type Effects } from "./effects";

export type RevealPhase = "suspense" | "slam" | "result";

const SLAM_AT = 1200;
const SLAM_SOUND_DELAY = 150;
const RESULT_AFTER_SLAM = 800;
const SUSPICIOUS_AFTER = 700;

export interface RevealSequence {
  phase: RevealPhase;
  suspicious: boolean;
  runId: number;
  skip: () => void;
  replay: () => void;
}

/** Drives the reveal: suspense, slam, result. All timers are cancelled on replay and unmount. */
export function useRevealSequence(
  verdict: Verdict,
  reduced: boolean,
  canvasRef: RefObject<HTMLCanvasElement | null>,
): RevealSequence {
  const [phase, setPhase] = useState<RevealPhase>(reduced ? "result" : "suspense");
  const [suspicious, setSuspicious] = useState(false);
  const [runId, setRunId] = useState(0);
  const timers = useRef<number[]>([]);
  const effects = useRef<Effects | null>(null);
  const hasTricks = verdict.tricks.length > 0;
  const tier = verdict.tier;

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const getEffects = useCallback(() => {
    if (!effects.current && canvasRef.current) effects.current = createEffects(canvasRef.current);
    return effects.current;
  }, [canvasRef]);

  const enterSlam = useCallback(() => {
    clearTimers();
    setPhase("slam");
    later(() => play("slam"), SLAM_SOUND_DELAY);
    if (tier === "steal") {
      play("chaching");
      getEffects()?.fire("steal");
    } else if (tier === "good") {
      play("pop");
      getEffects()?.fire("good");
    } else if (tier === "normal") {
      play("pop");
    } else {
      play("buzzer");
    }
    if (hasTricks) later(() => setSuspicious(true), SUSPICIOUS_AFTER);
    later(() => setPhase("result"), RESULT_AFTER_SLAM);
  }, [clearTimers, later, getEffects, tier, hasTricks]);

  // Starts (and restarts, via runId) the timed run.
  useEffect(() => {
    if (reduced) return undefined;
    play("drumroll");
    later(enterSlam, SLAM_AT);
    return clearTimers;
  }, [runId, reduced, later, enterSlam, clearTimers]);

  // Cleans up confetti on unmount.
  useEffect(
    () => () => {
      clearTimers();
      effects.current?.reset();
      effects.current = null;
    },
    [clearTimers],
  );

  const skip = useCallback(() => {
    if (phase === "suspense") enterSlam();
  }, [phase, enterSlam]);

  const replay = useCallback(() => {
    clearTimers();
    effects.current?.reset();
    setSuspicious(false);
    setPhase(reduced ? "result" : "suspense");
    setRunId((n) => n + 1);
  }, [clearTimers, reduced]);

  return { phase, suspicious, runId, skip, replay };
}
