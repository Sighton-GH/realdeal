// FROZEN. Every screen gets data through `api`; never import mock.ts or live.ts directly.
import type { Api } from "@shared/types";
import { mockApi } from "./mock";
import { liveApi } from "./live";

export const API_MODE: "mock" | "live" = import.meta.env.VITE_API_MODE === "live" ? "live" : "mock";
export const api: Api = API_MODE === "live" ? liveApi : mockApi;
export type * from "@shared/types";
