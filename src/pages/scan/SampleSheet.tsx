// STUB (SPEC-00). SCR-15 replaces. Contract used by ScanPage (SCR-14).
import { Sheet } from "@/components/ui";

export type SampleId = "sample-butter" | "sample-yogurt" | "sample-pasta";
export const SAMPLES: Array<{ id: SampleId; src: string; label: string }> = [
  { id: "sample-butter", src: "/samples/sample-butter.svg", label: "Butter sale tag" },
  { id: "sample-yogurt", src: "/samples/sample-yogurt.svg", label: "Greek yogurt tag" },
  { id: "sample-pasta", src: "/samples/sample-pasta.svg", label: "Spaghetti multi-buy tag" },
];

export interface SampleSheetProps { open: boolean; onClose: () => void; onPick: (id: SampleId, src: string) => void }

export function SampleSheet({ open, onClose, onPick }: SampleSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Try a sample tag">
      {SAMPLES.map((s) => <button key={s.id} type="button" className="block py-2" onClick={() => onPick(s.id, s.src)}>{s.label}</button>)}
    </Sheet>
  );
}
