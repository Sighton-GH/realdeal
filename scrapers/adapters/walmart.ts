// STUB (SPEC-00). BE-04 replaces; keep `export const adapter: RetailerAdapter`.
import type { RetailerAdapter } from "../types";

export const adapter: RetailerAdapter = {
  retailerId: "walmart",
  async search() {
    return { status: "error", message: "Adapter not implemented yet", products: [] };
  },
};
