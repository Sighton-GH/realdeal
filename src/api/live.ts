// PLACEHOLDER from SPEC-00. BE-07 replaces it; keep `export const liveApi: Api`.
import type { Api } from "@shared/types";

const notYet = (): never => { throw new Error("Live API not implemented yet"); };

export const liveApi: Api = {
  searchItems: async () => notYet(),
  getItem: async () => notYet(),
  getFeatured: async () => notYet(),
  checkPrice: async () => notYet(),
  scanImage: async () => notYet(),
  listTricks: async () => notYet(),
  getDataStatus: async () => notYet(),
  getNearbyPrices: async () => notYet(),
};
