# Scan: tag units, store choice, confirm layout, tap to focus

Date: 2026-10-03. Status: approved by Bryan in chat.

## Why

A Save-On tag reading "Banana Plantain $1.27 lb / $2.81 kg" was checked as $1.27 **per kg**. The server only
detects "per lb" when the model puts it in `unitPriceText`/`sizeText`; here the model put `$2.81 kg` in
`unitPriceText`, so the per-lb price was treated as per-kg using the catalogue's unit. The app must take the
unit from the tag, never from the database. Other problems found in the same flow:

- The confirm sheet shows the catalogue's size list at the top and the scanned size at the bottom; the
  scanned size row only appears when it differs from the catalogue, so the amount is sometimes missing.
- The store is asked twice (chip on the camera screen, tiles on the confirm sheet) and the list has three
  chains that do not exist in BC (Metro, Voila, Galleria). There is no "Other" choice.
- The Replay button on the results page is not wanted.
- No tap to focus / expose on the camera.

Plantain vs banana: Bryan confirmed these count as the same item; matching is unchanged.

## 1. Tag amounts (`shared/units.ts`, new)

```ts
export type TagUnit = "g" | "kg" | "lb" | "oz" | "mL" | "L" | "each" | "dozen";
export interface TagAmount { qty: number; unit: TagUnit }   // what the printed price is for
```

Both are declared in `shared/types.ts` (so they are part of the API contract) and re-used by `shared/units.ts`.

`shared/units.ts` exports:

- `toItemUnits(amount: TagAmount, itemUnit: Unit): number | undefined`: converts to the catalogue unit.
  kg: g/1000, kg, lb×0.45359237, oz×0.028349523125. L: mL/1000, L. dozen: dozen, each/12. each: each,
  dozen×12. Anything else returns `undefined` (lb vs L).
- `compatibleUnits(itemUnit: Unit): TagUnit[]`: kg → g, kg, lb, oz; L → mL, L; each → each, dozen;
  dozen → dozen, each.
- `fromItemUnits(qty: number, itemUnit: Unit): TagAmount`: the catalogue size as a tag amount
  (0.454 kg → 454 g, 4 L → 4 L, 1 dozen → 1 dozen, 6 each → 6 each); g/mL below 1 kg/L.
- `formatTagAmount(a: TagAmount): string`: qty 1 → "per lb", "per kg", "per L", "each", "per dozen";
  otherwise "for 454 g", "for 1.89 L", "for 12 pack", "for 2 dozen" (quantities rounded to 2 decimals).
- `parseTagAmount(text: string): TagAmount | undefined`: reads "lb", "/lb", "per lb", "/kg", "kg",
  "100 g", "/100g", "454 g", "1.89 L", "ea", "each", "12 pack", "dozen", "oz". A bare unit means qty 1.

## 2. Contract changes (`shared/types.ts`)

- `RetailerId` drops `"metro" | "voila" | "galleria"`.
- `ScanResult.tagAmount?: TagAmount`: the amount the scanned price is for, as printed.
- `PriceCheckInput.retailerId` becomes **optional**; absent means the user picked "Other".
- `PriceCheckInput.tagAmount?: TagAmount`: the amount as the user confirmed it (for display). `sizeQty`
  keeps carrying the converted size in item units, so the engine math does not change.

## 3. Server scan (`server/scan.ts`)

- Prompt + schema gain `priceUnitText`: "The amount the main price is for, exactly as printed next to it,
  e.g. 'lb', '/kg', 'ea', '100 g', '454 g'. Null if nothing is printed next to the price."
- `postProcess` decides `tagAmount` in this order:
  1. `parseTagAmount(priceUnitText)`
  2. cross-check: if `unitPriceText` parses to `{ price: U, per: kg | lb | 100g | L | 100mL }` and
     `price / U` (converted) is within 3% of 1 lb, 1 kg, 100 g, 1 L or 100 mL, use that amount. This is what
     catches the plantain tag: 1.27 / 2.81 kg = 0.452 kg ≈ 1 lb.
  3. `parseTagAmount(sizeText)` (package size printed on the tag)
  4. otherwise undefined (the client falls back to the catalogue size and says so).
  Only amounts whose unit converts to the top candidate's unit are kept.
- The old "per-lb produce: convert price to per-kg" block is removed. `price` stays as printed.
- `sizeQty` = `toItemUnits(tagAmount, item.unit)` when a tagAmount was found (always set, not only when it
  differs by 2%).
- `mapRetailer` drops the three chains. Sample results get a `tagAmount` too.

## 4. Engine and API

- `checkPrice` with no `retailerId`: compare against the all-store average as usual; `saleFreq12w` = 0;
  store history = []; `best` candidates = every retailer plus the input as `retailerId: undefined`.
  `Verdict.best.retailerId` becomes optional (undefined = the user's price is the best).
  `detectTricks` receives `retailer?: Retailer` and skips the store-history tricks when it is undefined.
- Server `POST /api/check`: `retailerId` optional, but if present it must be a known retailer. Pass
  `tagAmount` through after validating its shape.
- Consumers of `input.retailerId` / `best.retailerId` (`tier.ts`, `CheaperElsewhere`, `HistorySection`,
  `RevealResult` NearbyPrices `checkedPrice`) handle undefined.

## 5. Removing Metro, Voila, Galleria

`shared/retailers.ts`, `shared/types.ts`, `scrapers/import-hammer.ts` (skip those rows),
`server/scan.ts`, tests. `server/data.ts` and `src/api/mock.ts` filter out points and locations whose
`retailerId` is not in `RETAILERS` on load, so a stale `data/prices.json` cannot leak them.
`useAppStore` persist version 1 → 2 with a `migrate` that drops `hiddenStores` entries and
`recentChecks` that reference removed retailers. Theme tokens are left alone.

## 6. Confirm sheet (`src/pages/scan/ScanConfirmSheet.tsx`)

Order, top to bottom:

1. **Product**: item art + name only (no "Sizes: …" line), "Change" as now. `ItemRow` gets an optional
   `showSizes?: boolean` (default true).
2. **On the tag** (always shown): big price, and under it the amount, e.g. "per lb" or "for 454 g".
   If the scan found no amount, show the catalogue default from `fromItemUnits(item.sizeQty, item.unit)`
   with the note "Not on the tag. Check it matches." One **Edit** opens: Price field, Amount field
   (numeric) and unit chips from `compatibleUnits(item.unit)`; Done saves. Changing the item resets the
   amount if its unit is no longer compatible. Was price and multi-buy rows stay as they are now, below.
3. **Store**: if the nearest branch is within 300 m, it is preselected and shown as one line
   "At Save-On-Foods Cameron" with Change. Otherwise (or after Change) the store tiles are shown sorted by
   the distance to each chain's nearest branch, then an **Other** tile last. Nothing is preselected
   without GPS; Check price is disabled until a store or Other is chosen.
4. Check price / Retake.

On Check price: `sizeQty = toItemUnits(tagAmount, item.unit)`, `tagAmount`, `retailerId` (undefined for
Other).

## 7. Scanner (`ScanPage`, `Viewfinder`, `useCamera`)

- The `StoreHint` chip is removed from the viewfinder (file deleted). The scan's store and the GPS
  suggestion are passed to the confirm sheet.
- Location is requested once when the scanner opens, unless already granted or denied before.
- **Tap to focus and expose**: a tap on the video area (not on controls) maps the tap to normalised video
  coordinates (accounting for `object-cover` cropping) and calls `camera.focusAt({x, y})`, which applies
  `{ advanced: [{ pointsOfInterest: [{x, y}], focusMode: "single-shot" | "continuous", exposureMode:
  "continuous" }] }` using only the keys `getCapabilities()` reports. A ring is drawn at the tap point for
  ~700 ms (no scale animation with reduced motion). When the camera supports none of these, the tap does
  nothing and no ring is shown. Errors from `applyConstraints` are swallowed.

## 8. Results page

- `NumbersCard`: when `verdict.input.tagAmount` is set, "You'd pay" = `input.price` (effective price) with
  the tag amount label, "Usual price" = `avgUnitPrice × sizeQty` with the same label, and the 90-day range
  in the same terms. Example: "$1.27 per lb", usual "$1.18 per lb". Without a tagAmount, today's behaviour.
- Remove the Replay button (`onReplay` prop removed from `RevealResult`; `RevealPage` keeps its sequence).

## Testing

- `shared/units.test.ts`: conversions, compatible units, parse, format.
- `server/scan.test.ts`: the plantain tag (`price 1.27, priceUnitText "lb", unitPriceText "$2.81 kg"`)
  → `tagAmount {1, lb}`, `sizeQty ≈ 0.4536`, price 1.27; the same without `priceUnitText` (cross-check);
  a 454 g butter tag; removed chains no longer map.
- `shared/verdict.test.ts`: check without retailerId.
- `npm run typecheck && npm run lint && npm run test && npm run build`.
- Playwright screenshots of the confirm sheet (sample tags) and the results page at 390px and 1280px.

## Out of scope

- `scrapers/parse.ts` `parseSize` still maps "per lb" to 1 kg for scrapers; not used by the scan path
  after this change. Logged in BLOCKERS.md.
- "Other" in the manual entry flow (`/check`).
