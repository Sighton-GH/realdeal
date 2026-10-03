// FROZEN API (SPEC-00). Runs a price check, saves it, and navigates to the reveal.
import { useState } from "react";
import { useNavigate } from "react-router";
import type { PriceCheckInput, Verdict } from "@shared/types";
import { api } from "@/api/client";
import { useAppStore } from "@/store/useAppStore";

export function useRunCheck(): { run: (input: PriceCheckInput) => Promise<Verdict | undefined>; running: boolean; error: string | null } {
  const navigate = useNavigate();
  const addCheck = useAppStore((s) => s.addCheck);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (input: PriceCheckInput) => {
    setRunning(true);
    setError(null);
    try {
      const verdict = await api.checkPrice(input);
      addCheck(verdict);
      navigate(`/reveal/${verdict.checkId}`);
      return verdict;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't check that price.");
      return undefined;
    } finally {
      setRunning(false);
    }
  };
  return { run, running, error };
}
