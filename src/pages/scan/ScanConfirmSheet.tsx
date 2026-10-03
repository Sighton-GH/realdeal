// STUB (SPEC-00). SCR-15 replaces. Contract used by ScanPage (SCR-14).
import type { RetailerId, ScanResult } from "@shared/types";
import { Button, Sheet } from "@/components/ui";

export interface ScanConfirmSheetProps {
  open: boolean;
  result: ScanResult;
  /** store preselected from the store hint when the scan didn't detect one */
  fallbackRetailerId?: RetailerId;
  onRetake: () => void;
  onClose: () => void;
}

export function ScanConfirmSheet({ open, onRetake, onClose }: ScanConfirmSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Is this right?">
      <Button variant="secondary" fullWidth onClick={onRetake}>Retake</Button>
    </Sheet>
  );
}
