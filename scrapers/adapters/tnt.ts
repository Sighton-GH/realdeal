// STUB (SPEC-00). BE-05 replaces; keep `export const adapter: RetailerAdapter`.
import type { RetailerAdapter } from "../types";

export const adapter: RetailerAdapter = {
  retailerId: "tnt",
  async search() {
    return { status: "error", message: "Adapter not implemented yet", products: [] };
  },
};
