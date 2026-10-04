// FROZEN
import type { RetailerId } from "../../shared/types";
import type { RetailerAdapter } from "../types";
import { adapter as saveon } from "./saveon";
import { adapter as nofrills } from "./nofrills";
import { adapter as walmart } from "./walmart";
import { adapter as tnt } from "./tnt";

/** Only the original four have (stub) adapters; loblaws is Hammer-only. */
export const ADAPTERS: Partial<Record<RetailerId, RetailerAdapter>> = { saveon, nofrills, walmart, tnt };
