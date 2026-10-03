// STUB (SPEC-00). SCR-08 replaces. Contract used by RevealPage (SCR-07):
//   RevealResult({ verdict, onReplay }) renders the white result panel content (it scrolls inside the panel RevealPage provides).
import type { Verdict } from "@shared/types";
import { pennyLineFor } from "@/lib/tier";

export interface RevealResultProps { verdict: Verdict; onReplay: () => void }

export function RevealResult({ verdict }: RevealResultProps) {
  return <p className="p-5">{pennyLineFor(verdict)}</p>;
}
