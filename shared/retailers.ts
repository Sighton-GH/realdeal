import type { Retailer, RetailerId } from "./types";
export const RETAILERS: Retailer[] = [
  { id: "saveon",   name: "Save-On-Foods", shortName: "Save-On",   tile: "tangerine", website: "https://www.saveonfoods.com" },
  { id: "nofrills", name: "No Frills",     shortName: "No Frills", tile: "pink",      website: "https://www.nofrills.ca" },
  { id: "walmart",  name: "Walmart",       shortName: "Walmart",   tile: "teal",      website: "https://www.walmart.ca" },
  { id: "tnt",      name: "T&T Supermarket", shortName: "T&T",     tile: "violet",    website: "https://www.tntsupermarket.com" },
  { id: "loblaws",  name: "Loblaws",       shortName: "Loblaws",   tile: "berry",      website: "https://www.loblaws.ca" },
];
export const retailerById = (id: RetailerId): Retailer => RETAILERS.find(r => r.id === id)!;
