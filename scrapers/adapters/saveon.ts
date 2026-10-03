// STUB (SPEC-00). BE-02 replaces; keep `export const adapter: RetailerAdapter`.
import type { RetailerAdapter } from "../types";

export const adapter: RetailerAdapter = {
  retailerId: "saveon",
  async search() {
    return { status: "error", message: "Adapter not implemented yet", products: [] };
  },
};
