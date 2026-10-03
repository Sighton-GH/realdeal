import type { StoreLocation } from "../types";

export const LOCATIONS: StoreLocation[] = [
  // Save-On-Foods (3 branches)
  {
    id: "saveon-cameron",
    retailerId: "saveon",
    name: "Save-On-Foods Cameron",
    address: "3433 North Rd, Burnaby, BC V3J 0A9",
    lat: 49.2528,
    lng: -122.8933,
  },
  {
    id: "saveon-highgate",
    retailerId: "saveon",
    name: "Save-On-Foods Highgate Village",
    address: "7155 Kingsway, Burnaby, BC V5E 2V1",
    lat: 49.2188,
    lng: -122.9568,
  },
  {
    id: "saveon-madison",
    retailerId: "saveon",
    name: "Save-On-Foods Madison Centre",
    address: "4399 Lougheed Hwy, Burnaby, BC V5C 3Y7",
    lat: 49.267,
    lng: -123.0077,
  },

  // No Frills (3 branches)
  {
    id: "nofrills-hastings",
    retailerId: "nofrills",
    name: "Justin's No Frills Hastings",
    address: "4780 Hastings St, Burnaby, BC V5C 0P4",
    lat: 49.2808,
    lng: -122.9963,
  },
  {
    id: "nofrills-como-lake",
    retailerId: "nofrills",
    name: "Dennis' No Frills Como Lake",
    address: "1960 Como Lake Ave, Coquitlam, BC V3J 3R3",
    lat: 49.2626,
    lng: -122.8377,
  },
  {
    id: "nofrills-east-hastings",
    retailerId: "nofrills",
    name: "No Frills East Hastings",
    address: "1460 E Hastings St, Vancouver, BC V5L 1S3",
    lat: 49.281,
    lng: -123.0746,
  },

  // Walmart Supercentres (3 branches)
  {
    id: "walmart-lougheed",
    retailerId: "walmart",
    name: "Walmart Lougheed Supercentre",
    address: "9855 Austin Ave, Burnaby, BC V3J 1N4",
    lat: 49.2511,
    lng: -122.896,
  },
  {
    id: "walmart-metrotown",
    retailerId: "walmart",
    name: "Walmart Metrotown Supercentre",
    address: "4545 Central Blvd, Burnaby, BC V5H 4J1",
    lat: 49.2254,
    lng: -122.9999,
  },
  {
    id: "walmart-grandview",
    retailerId: "walmart",
    name: "Walmart Grandview Supercentre",
    address: "3585 Grandview Hwy, Vancouver, BC V5M 2G7",
    lat: 49.2592,
    lng: -123.027,
  },

  // T&T Supermarket (3 branches)
  {
    id: "tnt-metrotown",
    retailerId: "tnt",
    name: "T&T Supermarket Metrotown",
    address: "4800 Kingsway, Burnaby, BC V5H 4J2",
    lat: 49.2267,
    lng: -122.9998,
  },
  {
    id: "tnt-coquitlam",
    retailerId: "tnt",
    name: "T&T Supermarket Coquitlam Centre",
    address: "2740-2929 Barnet Hwy, Coquitlam, BC V3B 5R5",
    lat: 49.2747,
    lng: -122.7984,
  },
  {
    id: "tnt-first-ave",
    retailerId: "tnt",
    name: "T&T Supermarket 1st Avenue",
    address: "2800 E 1st Ave, Vancouver, BC V5M 4N8",
    lat: 49.2687,
    lng: -123.0456,
  },
];