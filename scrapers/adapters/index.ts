// FROZEN
import type { RetailerId } from "../../shared/types";
import type { RetailerAdapter } from "../types";
import { adapter as saveon } from "./saveon";
import { adapter as nofrills } from "./nofrills";
import { adapter as walmart } from "./walmart";
import { adapter as tnt } from "./tnt";

export const ADAPTERS: Record<RetailerId, RetailerAdapter> = { saveon, nofrills, walmart, tnt };
