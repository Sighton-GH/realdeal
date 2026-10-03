# DATA-01: Catalogue: 40 items + 12 store branches

| | |
|---|---|
| Suggested agent | any with web access (for real branches) |
| Paste with | `specs/context/CORE.md`, `specs/context/BACKEND.md` (or use the ready-made bundle `specs/bundles/DATA-01.md`) |
| Wave | 1: start now, no waiting on other tasks |

## Prompt

You are building one piece of RealDeal: task **DATA-01**. Many other agents are building the other pieces in parallel against the same frozen contracts. After this task sheet come the context packs (CORE, BACKEND) with the product, design system, types, helper code, and every contract you can import. Read everything before writing code.

Return the files listed under "Files you return" in the format described in CORE ("How to return your work"), complete and ready to drop in, then a NOTES section. Use copy from this sheet verbatim where it's given. Before you return, re-read DESIGN section 11 ("Never do this") and the Acceptance list below, and fix anything that doesn't match.

If you have direct access to the repo (Claude Code, Gemini CLI, Codex), write the files in place instead, touch nothing outside "Files you return", run `npm run typecheck && npm run lint && npm run test`, and finish with the report format from AGENTS.md.

## Files you return

Only these paths. Files named in the Contract are required; other listed paths are optional.

- `shared/seed/items.ts`
- `shared/seed/locations.ts`

## Goal
The catalogue: the 40 staple grocery items and 12 real store branches near SFU Burnaby.

## Contract
- `shared/seed/items.ts` exports `SEED_ITEMS: SeedItem[]` (all 40, in the table's order) and `ITEMS: Item[] = SEED_ITEMS.map(s => s.item)`.
- `shared/seed/locations.ts` exports `LOCATIONS: StoreLocation[]`.
- `SeedItem` is `{ item: Item; basePrice: number; seasonal?: boolean; saleProfile?: Partial<Record<RetailerId, "rare" | "normal" | "perpetual">> }` from `shared/seed/types.ts` (don't redefine).

## Items
Every item needs `id`, `name`, `category`, `sizeQty`, `unit`, `sizeLabel`, `artKey`, `aliases` (2–5 lowercase search words, e.g. butter: `["butter", "salted butter", "butter brick"]`), and `searchQuery` (what a shopper would type into a store's search box, e.g. "salted butter 454 g", "large eggs 12"). Sizes in kg and L are decimals (454 g = 0.454 kg; 500 mL = 0.5 L). Per-kg produce: `sizeQty: 1`, `unit: "kg"`, `sizeLabel: "per kg"`. `seasonal: true` for strawberries and blueberries. `saleProfile: { saveon: "perpetual" }` for butter. No brands (store-brand-agnostic).

| id | name | cat | size / unit | label | art | base $ |
|---|---|---|---|---|---|---|
| milk-2pct-4l | 2% milk | dairy | 4 L | 4 L | milk | 6.39 |
| milk-homo-2l | Homogenized milk | dairy | 2 L | 2 L | milk | 4.79 |
| butter-salted-454g | Salted butter | dairy | 0.454 kg | 454 g | butter | 6.10 |
| eggs-large-12 | Large eggs | dairy | 1 dozen | dozen | eggs | 4.60 |
| cheddar-old-400g | Old cheddar | dairy | 0.4 kg | 400 g | cheese | 7.49 |
| mozzarella-340g | Mozzarella | dairy | 0.34 kg | 340 g | cheese | 5.99 |
| greek-yogurt-plain | Plain Greek yogurt | dairy | 0.5 kg (current) | 500 g | yogurt | 6.10 (at 650 g) |
| yogurt-vanilla-650g | Vanilla yogurt | dairy | 0.65 kg | 650 g | yogurt | 4.49 |
| sour-cream-500ml | Sour cream | dairy | 0.5 L | 500 mL | sourcream | 3.49 |
| cream-cheese-250g | Cream cheese | dairy | 0.25 kg | 250 g | butter | 4.29 |
| flour-ap-10kg | All-purpose flour | bakery | 10 kg | 10 kg | flour | 18.50 |
| flour-ap-2-5kg | All-purpose flour | bakery | 2.5 kg | 2.5 kg | flour | 6.49 |
| flour-ww-2-5kg | Whole wheat flour | bakery | 2.5 kg | 2.5 kg | flour | 6.99 |
| bread-white-675g | White sandwich bread | bakery | 0.675 kg | 675 g | bread | 3.29 |
| bread-ww-675g | Whole wheat bread | bakery | 0.675 kg | 675 g | bread | 3.49 |
| sugar-2kg | Granulated sugar | bakery | 2 kg | 2 kg | sugar | 3.99 |
| oats-1kg | Large flake oats | bakery | 1 kg | 1 kg | oats | 3.79 |
| bagels-6 | Plain bagels | bakery | 6 each | 6 pack | bagel | 3.99 |
| spaghetti-900g | Spaghetti | pantry | 0.9 kg | 900 g | pasta | 2.55 |
| penne-900g | Penne | pantry | 0.9 kg | 900 g | pasta | 2.55 |
| rice-long-8kg | Long grain rice | pantry | 8 kg | 8 kg | rice | 17.99 |
| rice-jasmine-8kg | Jasmine rice | pantry | 8 kg | 8 kg | rice | 19.99 |
| canola-oil-3l | Canola oil | pantry | 3 L | 3 L | oil | 9.99 |
| peanut-butter-1kg | Peanut butter | pantry | 1 kg | 1 kg | jar | 6.49 |
| tomatoes-canned-796ml | Diced tomatoes | pantry | 0.796 L | 796 mL | can | 1.99 |
| black-beans-540ml | Black beans | pantry | 0.54 L | 540 mL | can | 1.49 |
| pasta-sauce-650ml | Tomato pasta sauce | pantry | 0.65 L | 650 mL | jar | 2.99 |
| chicken-broth-900ml | Chicken broth | pantry | 0.9 L | 900 mL | carton | 2.49 |
| bananas-kg | Bananas | produce | 1 kg | per kg | banana | 1.70 |
| apples-gala-kg | Gala apples | produce | 1 kg | per kg | apple | 4.39 |
| carrots-907g | Carrots | produce | 0.907 kg | 2 lb bag | carrot | 2.49 |
| potatoes-russet-4-54kg | Russet potatoes | produce | 4.54 kg | 10 lb bag | potato | 5.99 |
| onions-yellow-1-36kg | Yellow onions | produce | 1.36 kg | 3 lb bag | onion | 3.49 |
| tomatoes-roma-kg | Roma tomatoes | produce | 1 kg | per kg | tomato | 4.39 |
| romaine-3 | Romaine hearts | produce | 3 each | 3 pack | lettuce | 4.49 |
| strawberries-454g | Strawberries | produce | 0.454 kg | 454 g | berries | 4.60 (seasonal) |
| blueberries-510g | Blueberries | produce | 0.51 kg | 510 g | berries | 5.99 (seasonal) |
| broccoli-kg | Broccoli crowns | produce | 1 kg | per kg | broccoli | 4.39 |
| cucumber-english | English cucumber | produce | 1 each | each | cucumber | 1.79 |
| avocados-4 | Avocados | produce | 4 each | 4 pack | avocado | 4.99 |

Note: `greek-yogurt-plain` is currently 500 g (`sizeQty: 0.5`, `sizeLabel: "500 g"`) because it shrank from 650 g; set `basePrice: 6.10` (the old 650 g price). The generator handles the shrink.

## Locations
**3 real branches per chain (12 total) within about 15 km of SFU Burnaby (49.2781, -122.9199)**: Save-On-Foods, No Frills, Walmart (Supercentres that sell groceries), and T&T Supermarket, in Burnaby, Vancouver, New Westminster, or Coquitlam.
- `id`: `"<retailerId>-<short-slug>"`, e.g. `"saveon-kingsway-edmonds"`.
- `name`: the branch name as the chain shows it; `address`: street address with city; `lat`/`lng` to 4 decimals.
- Leave `scrapeStoreId` undefined.
- If you can browse the web, take these from each chain's store locator. **If you cannot verify real branches, do not guess real addresses.** Use clearly fake placeholders (`name: "Save-On-Foods (placeholder 1)"`, `address: "Burnaby, BC"`, coordinates spread 2–12 km around SFU), and say so in NOTES so a human fills them in.

## Acceptance
- [ ] 40 items with valid `ArtKey`s and units; ids exactly as in the table.
- [ ] 12 locations, 3 per retailer, real or clearly labelled placeholders.
