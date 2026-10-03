import { Sheet } from "@/components/ui";

export type SampleId = "sample-butter" | "sample-yogurt" | "sample-pasta";

export const SAMPLES: Array<{ id: SampleId; src: string; label: string }> = [
  { id: "sample-butter", src: "/samples/sample-butter.svg", label: "Salted butter" },
  { id: "sample-yogurt", src: "/samples/sample-yogurt.svg", label: "Greek yogurt" },
  { id: "sample-pasta", src: "/samples/sample-pasta.svg", label: "Spaghetti" },
];

export interface SampleSheetProps {
  open: boolean;
  onClose: () => void;
  onPick: (id: SampleId, src: string) => void;
}

export function SampleSheet({ open, onClose, onPick }: SampleSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Try a sample tag">
      <ul className="grid grid-cols-3 gap-3">
        {SAMPLES.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => {
                onPick(s.id, s.src);
                onClose();
              }}
              className="flex w-full flex-col items-stretch gap-2 text-left"
            >
              <img
                src={s.src}
                alt={`${s.label} shelf tag`}
                className="lifted aspect-[4/3] w-full rounded-md bg-sunken object-cover"
              />
              <span className="text-small font-extrabold text-ink">{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
