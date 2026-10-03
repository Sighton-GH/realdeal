// STUB (SPEC-00). BE-03 replaces; keep `export const adapter: RetailerAdapter`.
import type { RetailerAdapter } from "../types";

export const adapter: RetailerAdapter = {
  retailerId: "nofrills",
  async search() {
    return { status: "error", message: "Adapter not implemented yet", products: [] };
  },
};
