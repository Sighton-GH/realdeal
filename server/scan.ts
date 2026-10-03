// STUB (SPEC-00). BE-08 replaces; keep the signature. Used by server routes (BE-07).
import type { PriceStore, ScanResult } from "../shared/types";

export interface ScanImageInput { data: Buffer; mimeType: string }

export async function scanWithGemini(image: ScanImageInput | null, sampleId: string | undefined, store: PriceStore): Promise<ScanResult> {
  void image; void sampleId; void store;
  return { status: "error", candidates: [], message: "Scanning isn't set up on this server." };
}
