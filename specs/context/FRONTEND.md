# CONTEXT: FRONTEND (paste with every UI, ART and SCR task)

Barrels: import components from `@/components/ui`, `@/components/layout`, `@/components/penny`, `@/components/art`, `@/components/domain` (each re-exports every file in its folder). Inside the folder that owns a component, import siblings by relative path to avoid cycles.

Many components below are still simple stubs while other agents polish them. **Use them anyway**: their props are final.

## DESIGN: DESIGN.md: RealDeal design system

Every agent reads this before writing UI. It is the single source of truth for look, feel, motion, copy, and the shared component contract.

### 1. The idea

**A game show for grocery prices.** Two references, used deliberately:

- **Duolingo** gives us the tactility: chunky rounded type, bright flat colour, buttons with a solid "lip" that physically press down, a friendly mascot that reacts to you, encouraging plain-spoken copy.
- **Kahoot** gives us the drama: a deep purple stage, big coloured answer tiles, a countdown, and a reveal that slams onto the screen.

**Spend boldness in one place: the verdict reveal** (SCR-07). Everything else is calm, clean, white, and disciplined so the reveal hits hard. When in doubt, remove decoration.

The mascot is **Penny**, a copper coin. Canada retired the penny in 2013, so she found a new job: checking prices. She is how the app shows emotion. UI text stays plain; Penny carries the personality.

### 2. Colour

Flat colour only. Every pressable coloured surface has a **face** colour and a darker **lip** colour.

| Token | Hex | Use |
|---|---|---|
| grape-50 | #F1ECFF | selected backgrounds, subtle brand tint |
| grape-100 | #E2D8FF | hover on tinted surfaces |
| grape-400 | #8A63F2 | focus ring, secondary brand accents |
| grape-500 | #6A3BE4 | primary brand: primary buttons, active nav, links |
| grape-700 | #4A21B0 | lip for grape-500 |
| grape-900 | #2B1466 | the "stage": reveal background, landing bands, desktop page background |
| ink | #241B35 | all primary text |
| ink-soft | #5E5670 | secondary text |
| line | #E6E1EF | borders |
| line-strong | #D6CFE3 | lip for white surfaces and cards |
| canvas | #FFFFFF | app background, cards |
| sunken | #F6F4FA | inputs, inset areas, skeletons |

Verdict colours (face / lip / tint):

| Tier | Face | Lip | Tint | Text on face |
|---|---|---|---|---|
| steal | #22A93F | #17802E | #E2F7E6 | white, bold, 18px+ only |
| good | #1890E0 | #0E6DAD | #E1F1FC | white, bold, 18px+ only |
| normal | #FFC21A | #D69A00 | #FFF4D1 | **ink** (never white) |
| high | #F23D3D | #C22424 | #FFE4E4 | white, bold, 18px+ only |

Smaller text about a verdict uses ink on the tint colour, with a face-coloured icon or dot.

Store tile colours (Kahoot-style answer tiles; deliberately not verdict colours):

| Store | Tile | Face | Lip |
|---|---|---|---|
| Save-On-Foods | tangerine | #FF7A1A | #D45A00 |
| No Frills | pink | #F2428F | #C21F6B |
| Walmart | teal | #12A89E | #0B7F77 |
| T&T | violet | #8A5CF6 | #6337D6 |

Penny only: copper #E0793C, copper-shade #B5561F, copper-light #FFB37D, cheek #FF8FA3, eye white #FFFFFF, pupil = ink.

### 3. Tailwind v4 theme (SPEC-00 copies this verbatim into `src/styles/theme.css`)

```css
@import "tailwindcss";

@theme {
  --font-display: "Fredoka", "Nunito", ui-rounded, system-ui, sans-serif;
  --font-body: "Nunito", ui-rounded, system-ui, sans-serif;

  --color-grape-50: #F1ECFF;
  --color-grape-100: #E2D8FF;
  --color-grape-400: #8A63F2;
  --color-grape-500: #6A3BE4;
  --color-grape-700: #4A21B0;
  --color-grape-900: #2B1466;

  --color-ink: #241B35;
  --color-ink-soft: #5E5670;
  --color-line: #E6E1EF;
  --color-line-strong: #D6CFE3;
  --color-canvas: #FFFFFF;
  --color-sunken: #F6F4FA;

  --color-steal: #22A93F;
  --color-steal-lip: #17802E;
  --color-steal-tint: #E2F7E6;
  --color-good: #1890E0;
  --color-good-lip: #0E6DAD;
  --color-good-tint: #E1F1FC;
  --color-normal: #FFC21A;
  --color-normal-lip: #D69A00;
  --color-normal-tint: #FFF4D1;
  --color-high: #F23D3D;
  --color-high-lip: #C22424;
  --color-high-tint: #FFE4E4;

  --color-tangerine: #FF7A1A;
  --color-tangerine-lip: #D45A00;
  --color-pink: #F2428F;
  --color-pink-lip: #C21F6B;
  --color-teal: #12A89E;
  --color-teal-lip: #0B7F77;
  --color-violet: #8A5CF6;
  --color-violet-lip: #6337D6;

  --color-copper: #E0793C;
  --color-copper-shade: #B5561F;
  --color-copper-light: #FFB37D;

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;

  --text-verdict: 3.5rem;
  --text-verdict--line-height: 0.95;
  --text-display: 2.5rem;
  --text-display--line-height: 1.05;
  --text-h1: 1.875rem;
  --text-h1--line-height: 1.1;
  --text-h2: 1.375rem;
  --text-h2--line-height: 1.2;
  --text-h3: 1.125rem;
  --text-h3--line-height: 1.3;
  --text-body: 1rem;
  --text-body--line-height: 1.5;
  --text-small: 0.875rem;
  --text-small--line-height: 1.45;
  --text-micro: 0.75rem;
  --text-micro--line-height: 1.4;
}

@layer base {
  html { font-family: var(--font-body); color: var(--color-ink); font-weight: 600; -webkit-font-smoothing: antialiased; }
  body { background: var(--color-canvas); }
  h1, h2, .font-display { font-family: var(--font-display); }
  :focus-visible { outline: 3px solid var(--color-grape-400); outline-offset: 2px; border-radius: 6px; }
  .tabular { font-variant-numeric: tabular-nums; }
}

@layer components {
  /* The lip: set --lip on the element, add .press */
  .press { box-shadow: 0 4px 0 var(--lip, var(--color-line-strong)); transition: transform 90ms ease-out, box-shadow 90ms ease-out, filter 120ms; }
  .press:hover { filter: brightness(1.05); }
  .press:active { transform: translateY(4px); box-shadow: 0 0 0 var(--lip, var(--color-line-strong)); }
  .press:disabled { transform: none; filter: none; }
  /* Resting raised surface (cards) */
  .lifted { border: 2px solid var(--color-line); border-bottom-width: 4px; }
}
```

Usage example: `className="press bg-grape-500 [--lip:var(--color-grape-700)] text-white rounded-md"`.

### 4. Typography

- **Fredoka** (600, 700) for headlines, prices, verdict words, button labels, the logo.
- **Nunito** (600 default, 800 for emphasis) for everything else. Never use Nunito 400; it reads thin and generic.
- Prices always use `font-display tabular`.

| Role | Class | Font / weight |
|---|---|---|
| Verdict word (reveal) | `text-verdict` (3.5rem; 4.5rem at md+) | Fredoka 700 |
| Display (landing hero) | `text-display` (2.5rem; 4rem at md+) | Fredoka 700 |
| Screen title | `text-h1` | Fredoka 700 |
| Section title | `text-h2` | Fredoka 600 |
| Card title | `text-h3` | Nunito 800 |
| Body | `text-body` | Nunito 600 |
| Secondary / meta | `text-small text-ink-soft` | Nunito 700 |
| Badges | `text-micro` | Nunito 800 |

Rules:
- Sentence case everywhere. **The only uppercase text is 3D button labels** (Fredoka 600, `tracking-[0.04em]`), a direct Duolingo nod.
- No small-caps eyebrow labels above headings. No colouring or italicising one word of a headline.
- Body text max width `max-w-[60ch]`. Left-aligned by default. Centre only on the reveal, empty states, and the landing hero on mobile.

### 5. Shape and depth

- Radii: `rounded-sm` (10) inputs and chips, `rounded-md` (16) buttons and cards, `rounded-lg` (24) sheets and hero cards, `rounded-xl` (32) the desktop app column, `rounded-full` pills, nav button, avatars.
- **No blurred shadows anywhere.** Depth comes only from the lip (`.press`) and the thick bottom border (`.lifted`).
- Pressed state: moves down 4px, lip disappears. Disabled: `bg-sunken text-ink-soft [--lip:var(--color-line-strong)]`, no press.
- Modal and sheet backdrop: `bg-ink/55`, no backdrop blur.
- Spacing on a 4px grid. Screen padding `px-5`. Gap between sections `gap-7` (28px). Card padding `p-4` or `p-5`. Primary buttons are 56px tall (`h-14`), secondary 48px (`h-12`).

### 6. Layout

**App screens** live in a phone-width column (`max-w-[460px] mx-auto min-h-dvh bg-canvas`).
- On screens 768px and up, the page behind the column is `bg-grape-900` with a faint repeating pattern (`/pattern.svg`, tiny coins and price tags at 7% white opacity), and the column gets `rounded-xl my-6 overflow-hidden` with a 4px `grape-700` bottom lip. On a projector it reads as "an app" immediately.
- Top bar 56px: back button or logo on the left, optional title centred, sound toggle on the right.
- Bottom nav 72px: **Check** (Phosphor `Tag`), a raised centre **Scan** button (64px grape circle with lip, Phosphor `Scan`), **Tricks** (Phosphor `Detective`). Active item: grape-500, `fill` weight icon, label in Nunito 800.

**Landing** is the only full-width page (content `max-w-[1120px] mx-auto px-5`).

**Reveal** is full-bleed inside the column, no top or bottom nav.

Wireframes (mobile):

```
CHECK HOME (/check)               PRICE ENTRY (/check/:itemId)     REVEAL (/reveal/:checkId)
+--------------------------+      +--------------------------+     +--------------------------+
| [logo]            [snd]  |      | [x]  ====-------  (1/3)  |     |   (tier colour floods)   |
| Penny  "What are we      |      | [art] Salted butter 454g |     |                          |
|  checking today?"        |      |                          |     |        STEAL!            |
| [ search milk, eggs... ] |      | Where are you shopping?  |     |      [Penny celebrate]   |
| [   SCAN A PRICE TAG   ] |      | +----------+----------+  |     | 31% below the 90-day avg |
| (Dairy)(Produce)(Bakery) |      | | SAVE-ON  | NO FRILLS|  |     | +----------------------+ |
| Flyer deals to check     |      | +----------+----------+  |     | | $4.12/kg vs $5.98/kg | |
| [card][card][card] -->   |      | | WALMART  |   T&T    |  |     | | [steal|good|norm|hi] | |
| Your recent checks       |      | +----------+----------+  |     | |        ^ marker      | |
| [row: butter  Normal  ]  |      |                          |     | +----------------------+ |
| [row: flour   Steal   ]  |      |                          |     | Penny noticed: (tricks)  |
|--------------------------|      |                          |     | [CHECK ANOTHER]          |
|  Check   (SCAN)  Tricks  |      |                          |     | See price history        |
+--------------------------+      +--------------------------+     +--------------------------+
```

### 7. Icons

`@phosphor-icons/react`, 24px, weight `bold` by default, `fill` for active or selected states. **Never use emoji as icons or decoration**, anywhere.

### 8. Illustration style (Penny and item art)

- Flat vector, **no outlines**, no gradients.
- Each object uses at most 3 tones: base, shade, highlight. Shading is a hard-edged shape (crescent or band), not a blur.
- Chunky, slightly squat proportions, generous rounded corners.
- Penny and item art must look like they come from the same hand.

### 9. Motion

Use `motion/react`. Shared transition presets live in `src/lib/motion.ts` (created by SPEC-00):

```ts
export const spring = {
  press: { type: "spring", stiffness: 700, damping: 30 },
  pop:   { type: "spring", stiffness: 420, damping: 22 },  // things appearing: scale 0.6 -> 1
  slam:  { type: "spring", stiffness: 300, damping: 14 },  // verdict word: scale 2.2 -> 1
  sheet: { type: "spring", stiffness: 380, damping: 36 },
} as const;
```

Rules:
- **The reveal is the only orchestrated sequence in the app.** Elsewhere, motion only answers a user action: a press, a step change, a sheet opening, an item being added.
- No fade-up-on-scroll for sections. No hover animations on every card. No looping decorative motion except Penny's idle bob and blink.
- Step changes in flows slide horizontally (x: 40 to 0, opacity 0 to 1, 200ms).
- `prefers-reduced-motion`: replace movement with 150ms opacity fades, no shake, no confetti (show a static sparkle burst instead), Penny holds a still pose.

**Sound** (optional, BE-11 provides the files): `src/lib/sfx.ts` exposes `play(name)` for `"tap" | "drumroll" | "slam" | "chaching" | "buzzer" | "pop"`. It silently does nothing if the file is missing or sound is off. Sound toggle lives in the top bar and the zustand store.

### 10. Voice and copy

- UI labels are plain and specific. Penny speaks in short first-person lines inside a SpeechBubble.
- Buttons say exactly what happens: "Check price", "Check another", "See price history", "Scan a price tag", "Try a sample tag". The same action keeps the same name throughout.
- Verdict words: **Steal!**, **Good deal**, **Normal price**, **Overpriced**.
- Errors say what happened and how to fix it, no apology, no "Oops": "Penny couldn't find a price in that photo. Try a closer shot of the tag, or type it in."
- Empty states invite action: "No checks yet. Pick a flyer deal below or scan a tag."
- Canadian spelling, CAD, "per kg" not "/kg" in sentences (the `/kg` short form is fine inside price chips).

### 11. Never do this (generic-AI tells)

- Gradients of any kind (backgrounds, text, buttons). Glassmorphism or backdrop blur.
- Soft blurred shadows (`shadow-lg`, `rgba(0,0,0,.1)`). Depth is lips and thick bottom borders only.
- Inter, Roboto, Poppins, or system-default font stacks as the visible font. Monospace for data labels.
- Uppercase eyebrow labels above headings. One coloured or italic word inside a headline.
- `→` or `↗` appended to button or link text. Middle-dot meta strings like "A · B · C".
- Emoji as icons. Sparkle emoji. Lucide icons.
- Identical rounded cards in a 3-column "features" grid. A big stat number with a tiny label as a hero.
- Lorem ipsum or placeholder copy like "Lorem", "Feature one", "Your text here".
- Cream (#F4F1EA-ish) backgrounds or terracotta accents (copper is for Penny only).
- Pure-black or near-black (#111) backgrounds. Our dark is grape-900.
- Installing shadcn/ui, MUI, Chakra, DaisyUI, or any component library.

### 12. Shared component contract

Every file below already exists as a working **stub with these exact props** (built in SPEC-00). The owning task replaces the stub with the polished version and must keep the props identical. Everyone else imports and uses them freely. Owners: Button/LinkButton/IconButton UI-01; Card/Chip/VerdictBadge/Section UI-02; ProgressBar/PriceText/Skeleton UI-03; TextField/SearchField/Stepper/Toggle UI-04; Sheet/Toast UI-05; SpeechBubble/StoreTile/EmptyState UI-06; layout UI-07; Penny/PennyFace ART-01; Logo ART-02; ItemArt ART-05; ItemRow/FlyerDealCard/DataFreshness SCR-04; PriceGauge/TrickCard SCR-09; PriceHistoryChart SCR-11; NearbyPrices/SaleStreak SCR-12; SpeakButton BE-10.

All components accept `className?: string` (merged with `cn()` from `src/lib/cn.ts`) unless noted.

### `src/components/ui/`, exported from `src/components/ui/index.ts`

```ts
type Tone = "brand" | VerdictTier;

Button(props: {
  variant?: "primary" | "secondary" | "ghost" | "steal" | "good" | "normal" | "high"; // default "primary"
  size?: "md" | "lg";          // md = h-12, lg = h-14; default "lg"
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  loading?: boolean;           // shows Penny-free spinner (3 bouncing dots), keeps width
} & React.ButtonHTMLAttributes<HTMLButtonElement>)

LinkButton(props: same visual props as Button + { to: string })   // react-router Link styled as Button

IconButton(props: { icon: React.ReactNode; label: string; variant?: "plain" | "raised"; size?: 40 | 48; onClick?: () => void })

Card(props: { children: React.ReactNode; interactive?: boolean; tone?: "default" | "sunken" | VerdictTier; onClick?: () => void; as?: "div" | "button" | "li" })

Chip(props: { children: React.ReactNode; selected?: boolean; icon?: React.ReactNode; onClick?: () => void })

VerdictBadge(props: { tier: VerdictTier; size?: "sm" | "md" })     // tint bg, face-colour icon, label from tierMeta

ProgressBar(props: { value: number /* 0..1 */; tone?: Tone; height?: 12 | 16; label?: string })

PriceText(props: { amount: number; unit?: Unit; size?: "sm" | "md" | "lg" | "xl"; strike?: boolean })

TextField(props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; inputMode?: "text" | "decimal" | "numeric"; prefix?: string; suffix?: string; error?: string })

SearchField(props: { value: string; onChange: (v: string) => void; onSubmit?: () => void; placeholder?: string; autoFocus?: boolean })

Stepper(props: { value: number; min: number; max: number; onChange: (v: number) => void; label: string })

Toggle(props: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string })

Sheet(props: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode })

SpeechBubble(props: { children: React.ReactNode; tail?: "left" | "bottom" })

StoreTile(props: { retailer: Retailer; selected?: boolean; onClick?: () => void; size?: "md" | "lg" })

EmptyState(props: { mood: PennyMood; title: string; body?: string; action?: React.ReactNode })

Skeleton(props: { className?: string })                               // sunken block with soft pulse

Section(props: { title: string; action?: React.ReactNode; children: React.ReactNode })

useToast(): { show: (opts: { message: string; tone?: Tone }) => void }  // ToastProvider mounted in AppShell
```

### `src/components/layout/`

```ts
AppShell()                                  // AppColumn + TopBar + <Outlet/> + BottomNav + ToastProvider; provides TopBarContext
AppColumn(props: { children; className? })  // phone column on the grape stage; id="app-column" (Sheet portals here)
useTopBar(config: { title?; back?; right?; hidden? })  // pages configure the shell's top bar
TopBar(props: { title?: string; back?: boolean; right?: React.ReactNode })
BottomNav()
```

### `src/components/penny/`

```ts
type PennyMood = "idle" | "wave" | "thinking" | "happy" | "celebrate" | "meh" | "suspicious" | "shocked" | "sad";  // in types.ts
Penny(props: { mood: PennyMood; size?: number /* px, default 120 */; className?: string })
PennyFace(props: { mood?: PennyMood; size?: number })   // head only, for small spots (24–48px)
Logo(props: { size?: "sm" | "md" | "lg"; onDark?: boolean })
```

### `src/components/art/`

```ts
ItemArt(props: { artKey: ArtKey; size?: number /* px, default 64 */; className?: string })
```

### `src/components/domain/`

```ts
ItemRow(props: { item: Item; right?: React.ReactNode; onClick?: () => void })
FlyerDealCard(props: { deal: FeaturedDeal; onCheck: (deal: FeaturedDeal) => void; loading?: boolean })
PriceGauge(props: { pctVsAvg: number; tier: VerdictTier; animate?: boolean; compact?: boolean })
TrickCard(props: { trick: TrickFlag; index?: number; compact?: boolean })
PriceHistoryChart(props: { detail: ItemDetail; mode: "unit" | "package"; focusRetailer?: RetailerId; compact?: boolean; markPrice?: number /* in the current mode */; markTier?: VerdictTier })
SaleStreak(props: { points: PricePoint[] /* one retailer, oldest first */; weeks?: number })
NearbyPrices(props: { itemId: string; checkedPrice?: { retailerId: RetailerId; unitPrice: number }; limit?: number; title?: string })  // nearest stores with prices
DataFreshness(props: { compact?: boolean })   // "Prices updated 2 hours ago" from api.getDataStatus()
SpeakButton(props: { text: string })           // plays Penny's voice line; renders nothing unless voice is enabled
```

### Helpers (frozen, read-only for everyone)

- `src/lib/brand.ts`: `BRAND_NAME = "RealDeal"`, `MASCOT_NAME = "Penny"`, `TAGLINE = "Is that sale actually a deal?"`
- `src/lib/format.ts`: `formatMoney(n)` → "$5.99"; `formatUnitPrice(n, unit)` → "$1.32/kg"; `formatPct(p)` → "31% below" / "12% above" / "about average"; `formatSize(qty, unit)` → "454 g", "4 L", "per kg", "12 pack"
- `src/lib/tier.ts`: `tierMeta[tier]` → `{ label, shortLabel, mood, bgClass, tintClass, textOnFaceClass, lipVar, icon }` and `headlineFor(verdict)` / `sublineFor(verdict)`
- `src/lib/motion.ts` (`spring`, `stepSlide`), `src/lib/sfx.ts` (`play`), `src/lib/cn.ts` (`cn`), `formatWeek` and `formatDistance` in `format.ts`
- `src/pages/check/useRunCheck.ts`: `useRunCheck()` → `{ run(input), running, error }` runs a check, saves it, navigates to the reveal
- `src/store/useAppStore.ts`: `recentChecks: Verdict[]`, `addCheck(v)`, `getCheck(id)`, `soundOn`, `toggleSound()`, `location`, `setLocation()`, persisted to localStorage
- `src/lib/useUserLocation.ts`: `useUserLocation()` for the user's position with an SFU Burnaby fallback


## Helper code (complete files, frozen)

#### `src/lib/brand.ts`
```ts
export const BRAND_NAME = "RealDeal";
export const MASCOT_NAME = "Penny";
export const TAGLINE = "Is that sale actually a deal?";
```

#### `src/lib/cn.ts`
```ts
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["verdict", "display", "h1", "h2", "h3", "body", "small", "micro"] }] } },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

#### `src/lib/format.ts`
```ts
import type { Unit } from "@shared/types";

const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 5.99 -> "$5.99" */
export function formatMoney(n: number): string {
  return money.format(n);
}

/** (13.2, "kg") -> "$13.20/kg" */
export function formatUnitPrice(n: number, unit: Unit): string {
  return `${formatMoney(n)}/${unit}`;
}

/** -0.31 -> "31% below average", 0.12 -> "12% above average", 0.001 -> "right at average" */
export function formatPct(p: number): string {
  if (p < -0.005) return `${Math.round(Math.abs(p) * 100)}% below average`;
  if (p > 0.005) return `${Math.round(p * 100)}% above average`;
  return "right at average";
}

/** (0.454, "kg") -> "454 g", (4, "L") -> "4 L", (6, "each") -> "6 pack", (1, "dozen") -> "dozen" */
export function formatSize(qty: number, unit: Unit): string {
  const trim = (n: number) => String(Math.round(n * 100) / 100);
  switch (unit) {
    case "kg": return qty < 1 ? `${Math.round(qty * 1000)} g` : `${trim(qty)} kg`;
    case "L": return qty < 1 ? `${Math.round(qty * 1000)} mL` : `${trim(qty)} L`;
    case "each": return qty > 1 ? `${trim(qty)} pack` : "each";
    case "dozen": return qty === 1 ? "dozen" : `${trim(qty)} dozen`;
  }
}

/** ISO -> "just now", "12 minutes ago", "2 hours ago", "3 days ago" */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const secs = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** "2026-09-21" -> "Week of Sep 21" */
export function formatWeek(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  return `Week of ${d.toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" })}`;
}

/** 1.23 km -> "1.2 km", 0.35 -> "350 m", 12.4 -> "12 km" */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000 / 10) * 10} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
```

#### `src/lib/motion.ts`
```ts
export const spring = {
  press: { type: "spring", stiffness: 700, damping: 30 },
  pop: { type: "spring", stiffness: 420, damping: 22 },
  slam: { type: "spring", stiffness: 300, damping: 14 },
  sheet: { type: "spring", stiffness: 380, damping: 36 },
} as const;

export const stepSlide = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
} as const;
```

#### `src/lib/sfx.ts`
```ts
import { useAppStore } from "@/store/useAppStore";

export type SfxName = "tap" | "drumroll" | "slam" | "chaching" | "buzzer" | "pop";
const cache = new Map<SfxName, HTMLAudioElement>();

/** Plays /sfx/<name>.mp3 if sound is on. Silently does nothing on any failure (missing file, autoplay block). */
export function play(name: SfxName): void {
  try {
    if (!useAppStore.getState().soundOn) return;
    let audio = cache.get(name);
    if (!audio) {
      audio = new Audio(`/sfx/${name}.mp3`);
      audio.volume = 0.6;
      cache.set(name, audio);
    }
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  } catch {
    /* ignore */
  }
}
```

#### `src/lib/tier.ts`
```ts
import type { Icon } from "@phosphor-icons/react";
import { Equals, Lightning, ThumbsUp, WarningCircle } from "@phosphor-icons/react";
import type { Verdict, VerdictTier } from "@shared/types";
import { retailerById } from "@shared/retailers";
import type { PennyMood } from "@/components/penny/types";
import { formatMoney } from "./format";

export interface TierMeta {
  label: string;
  shortLabel: string;
  mood: PennyMood;
  bgClass: string;
  tintClass: string;
  textClass: string;
  textOnFaceClass: string;
  borderClass: string;
  lipVar: string;
  icon: Icon;
}

export const tierMeta: Record<VerdictTier, TierMeta> = {
  steal: { label: "Steal!", shortLabel: "Steal", mood: "celebrate", bgClass: "bg-steal", tintClass: "bg-steal-tint", textClass: "text-steal-lip", textOnFaceClass: "text-white", borderClass: "border-steal", lipVar: "var(--color-steal-lip)", icon: Lightning },
  good: { label: "Good deal", shortLabel: "Good", mood: "happy", bgClass: "bg-good", tintClass: "bg-good-tint", textClass: "text-good-lip", textOnFaceClass: "text-white", borderClass: "border-good", lipVar: "var(--color-good-lip)", icon: ThumbsUp },
  normal: { label: "Normal price", shortLabel: "Normal", mood: "meh", bgClass: "bg-normal", tintClass: "bg-normal-tint", textClass: "text-normal-lip", textOnFaceClass: "text-ink", borderClass: "border-normal", lipVar: "var(--color-normal-lip)", icon: Equals },
  high: { label: "Overpriced", shortLabel: "Overpriced", mood: "shocked", bgClass: "bg-high", tintClass: "bg-high-tint", textClass: "text-high-lip", textOnFaceClass: "text-white", borderClass: "border-high", lipVar: "var(--color-high-lip)", icon: WarningCircle },
};

export const TIER_ORDER: VerdictTier[] = ["steal", "good", "normal", "high"];

/** Penny's one-line reaction to a verdict. */
export function pennyLineFor(v: Verdict): string {
  const tricks = v.tricks.map((t) => t.type);
  let line: string;
  switch (v.tier) {
    case "steal":
      line = "Grab it. This is about as cheap as it gets.";
      break;
    case "good":
      line = "Nice find. That's below what it usually costs.";
      break;
    case "normal":
      line = tricks.includes("perpetual_sale")
        ? "That 'sale' is the everyday price. Don't let the tag rush you."
        : "That's just what it usually costs.";
      break;
    case "high":
      line = v.best.retailerId !== v.input.retailerId
        ? `Put it back. ${retailerById(v.best.retailerId).name} has it for ${formatMoney(v.best.price)}.`
        : "Put it back. You can do better.";
      break;
  }
  if ((v.tier === "steal" || v.tier === "good") && tricks.length > 0) line += " Mind the fine print, though.";
  return line;
}
```

#### `src/lib/useUserLocation.ts`
```ts
import { useCallback, useState } from "react";
import { useAppStore, type UserLocation } from "@/store/useAppStore";

export type LocationStatus = "idle" | "locating" | "granted" | "denied" | "unavailable";

/** The user's position, with an SFU Burnaby fallback. Never prompts until request() is called. Needs HTTPS or localhost. */
export function useUserLocation(): UserLocation & { status: LocationStatus; request: () => void } {
  const location = useAppStore((s) => s.location);
  const setLocation = useAppStore((s) => s.setLocation);
  const [status, setStatus] = useState<LocationStatus>(location.source === "gps" ? "granted" : "idle");

  const request = useCallback(() => {
    if (!("geolocation" in navigator) || !window.isSecureContext) {
      setStatus("unavailable");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ point: { lat: pos.coords.latitude, lng: pos.coords.longitude }, label: "Your location", source: "gps" });
        setStatus("granted");
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
      { timeout: 8000, maximumAge: 300_000 },
    );
  }, [setLocation]);

  return { ...location, status, request };
}
```

#### `src/store/useAppStore.ts`
```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GeoPoint, Verdict } from "@shared/types";

export interface UserLocation { point: GeoPoint; label: string; source: "gps" | "default" }
export const DEFAULT_LOCATION: UserLocation = { point: { lat: 49.2781, lng: -122.9199 }, label: "SFU Burnaby", source: "default" };

interface AppState {
  recentChecks: Verdict[];
  addCheck: (v: Verdict) => void;
  getCheck: (id: string) => Verdict | undefined;
  clearChecks: () => void;
  soundOn: boolean;
  toggleSound: () => void;
  location: UserLocation;
  setLocation: (loc: UserLocation) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      recentChecks: [],
      addCheck: (v) => set((s) => ({ recentChecks: [v, ...s.recentChecks.filter((c) => c.checkId !== v.checkId)].slice(0, 20) })),
      getCheck: (id) => get().recentChecks.find((c) => c.checkId === id),
      clearChecks: () => set({ recentChecks: [] }),
      soundOn: true,
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      location: DEFAULT_LOCATION,
      setLocation: (location) => set({ location }),
    }),
    { name: "realdeal", version: 1 },
  ),
);
```

#### `src/api/client.ts`
```ts
// FROZEN. Every screen gets data through `api`; never import mock.ts or live.ts directly.
import type { Api } from "@shared/types";
import { mockApi } from "./mock";
import { liveApi } from "./live";

export const API_MODE: "mock" | "live" = import.meta.env.VITE_API_MODE === "live" ? "live" : "mock";
export const api: Api = API_MODE === "live" ? liveApi : mockApi;
export type * from "@shared/types";
```

#### `src/components/layout/TopBarContext.tsx`
```tsx
// FROZEN API (SPEC-00). Pages call useTopBar({ title, back, right }) to configure the shell's top bar.
import { createContext, useContext, useEffect, type ReactNode } from "react";

export interface TopBarConfig { title?: string; back?: boolean; right?: ReactNode; hidden?: boolean }
export const TopBarContext = createContext<(c: TopBarConfig) => void>(() => undefined);

export function useTopBar(config: TopBarConfig): void {
  const set = useContext(TopBarContext);
  const { title, back, right, hidden } = config;
  useEffect(() => {
    set({ title, back, right, hidden });
    return () => set({});
  }, [set, title, back, right, hidden]);
}
```

#### `src/components/layout/AppColumn.tsx`
```tsx
// FROZEN API (SPEC-00). The phone-width column on a grape stage (desktop). Used by AppShell and by full-bleed pages (Reveal, Scan).
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AppColumn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-dvh md:bg-grape-900 md:bg-[url('/pattern.svg')] md:py-6">
      <div
        id="app-column"
        className={cn(
          "relative mx-auto flex h-dvh w-full max-w-[460px] flex-col overflow-hidden bg-canvas md:h-[calc(100dvh-48px)] md:rounded-xl md:shadow-[0_4px_0_var(--color-grape-700)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
```

#### `src/components/penny/types.ts`
```ts
// FROZEN
export type PennyMood = "idle" | "wave" | "thinking" | "happy" | "celebrate" | "meh" | "suspicious" | "shocked" | "sad";
```

#### `src/pages/check/useRunCheck.ts`
```ts
// FROZEN API (SPEC-00). Runs a price check, saves it, and navigates to the reveal.
import { useState } from "react";
import { useNavigate } from "react-router";
import type { PriceCheckInput, Verdict } from "@shared/types";
import { api } from "@/api/client";
import { useAppStore } from "@/store/useAppStore";

export function useRunCheck(): { run: (input: PriceCheckInput) => Promise<Verdict | undefined>; running: boolean; error: string | null } {
  const navigate = useNavigate();
  const addCheck = useAppStore((s) => s.addCheck);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (input: PriceCheckInput) => {
    setRunning(true);
    setError(null);
    try {
      const verdict = await api.checkPrice(input);
      addCheck(verdict);
      navigate(`/reveal/${verdict.checkId}`);
      return verdict;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't check that price.");
      return undefined;
    } finally {
      setRunning(false);
    }
  };
  return { run, running, error };
}
```

#### `src/components/art/items/types.ts`
```ts
// FROZEN contract between ART-03, ART-04 and ART-05.
import type { ReactElement } from "react";
import type { ArtKey } from "@shared/types";

/** Draws one item in a 64x64 viewBox. Return only the inner shapes (a <g>), not the <svg> or backdrop. */
export type ArtDrawing = () => ReactElement;
export type ArtSet = Partial<Record<ArtKey, ArtDrawing>>;
```

## Component contracts (exports only)

#### `src/components/ui/Button.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-01 replaces with the polished version; props are final.
export type ButtonVariant = "primary" | "secondary" | "ghost" | "steal" | "good" | "normal" | "high";
export interface ButtonVisualProps {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  loading?: boolean;
  className?: string;
}
export type ButtonProps = ButtonVisualProps & ButtonHTMLAttributes<HTMLButtonElement>;
export const buttonVariantClass: Record<ButtonVariant, string> = …;
export function buttonClass({ variant = "primary", size = "lg", fullWidth, className }: ButtonVisualProps): string;
export function Button({ variant, size, fullWidth, leftIcon, loading, className, children, onClick, disabled, ...rest }: ButtonProps);
```

#### `src/components/ui/Card.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-02 replaces; props are final.
export interface CardProps { children: ReactNode; interactive?: boolean; tone?: "default" | "sunken" | VerdictTier; onClick?: () => void; as?: "div" | "button" | "li"; className?: string }
export function Card({ children, interactive, tone = "default", onClick, as, className }: CardProps);
```

#### `src/components/ui/Chip.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-02 replaces; props are final.
export interface ChipProps { children: ReactNode; selected?: boolean; icon?: ReactNode; onClick?: () => void; className?: string }
export function Chip({ children, selected, icon, onClick, className }: ChipProps);
```

#### `src/components/ui/EmptyState.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-06 replaces; props are final.
export interface EmptyStateProps { mood: PennyMood; title: string; body?: string; action?: ReactNode; className?: string }
export function EmptyState({ mood, title, body, action, className }: EmptyStateProps);
```

#### `src/components/ui/IconButton.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-01 replaces; props are final.
export interface IconButtonProps { icon: ReactNode; label: string; variant?: "plain" | "raised"; size?: 40 | 48; onClick?: () => void; className?: string; disabled?: boolean }
export function IconButton({ icon, label, variant = "plain", size = 48, onClick, className, disabled }: IconButtonProps);
```

#### `src/components/ui/LinkButton.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-01 replaces; props are final.
export interface LinkButtonProps extends ButtonVisualProps { to: string; children: ReactNode }
export function LinkButton({ to, children, leftIcon, ...visual }: LinkButtonProps);
```

#### `src/components/ui/PriceText.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-03 replaces; props are final.
export interface PriceTextProps { amount: number; unit?: Unit; size?: "sm" | "md" | "lg" | "xl"; strike?: boolean; className?: string }
export function PriceText({ amount, unit, size = "md", strike, className }: PriceTextProps);
```

#### `src/components/ui/ProgressBar.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-03 replaces; props are final.
export interface ProgressBarProps { value: number; tone?: "brand" | VerdictTier; height?: 12 | 16; label?: string; className?: string }
export function ProgressBar({ value, tone = "brand", height = 16, label, className }: ProgressBarProps);
```

#### `src/components/ui/SearchField.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-04 replaces; props are final.
export interface SearchFieldProps { value: string; onChange: (v: string) => void; onSubmit?: () => void; placeholder?: string; autoFocus?: boolean; className?: string }
export function SearchField({ value, onChange, onSubmit, placeholder = "Search", autoFocus, className }: SearchFieldProps);
```

#### `src/components/ui/Section.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-02 replaces; props are final.
export interface SectionProps { title: string; action?: ReactNode; children: ReactNode; className?: string }
export function Section({ title, action, children, className }: SectionProps);
```

#### `src/components/ui/Sheet.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-05 replaces; props are final. (Final version portals into the app column.)
export interface SheetProps { open: boolean; onClose: () => void; title?: string; children: ReactNode }
export function Sheet({ open, onClose, title, children }: SheetProps);
```

#### `src/components/ui/Skeleton.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-03 replaces; props are final.
export function Skeleton({ className }: { className?: string });
```

#### `src/components/ui/SpeechBubble.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-06 replaces; props are final.
export interface SpeechBubbleProps { children: ReactNode; tail?: "left" | "bottom"; className?: string }
export function SpeechBubble({ children, className }: SpeechBubbleProps);
```

#### `src/components/ui/Stepper.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-04 replaces; props are final.
export interface StepperProps { value: number; min: number; max: number; onChange: (v: number) => void; label: string; className?: string }
export function Stepper({ value, min, max, onChange, label, className }: StepperProps);
```

#### `src/components/ui/StoreTile.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-06 replaces; props are final.
export interface StoreTileProps { retailer: Retailer; selected?: boolean; onClick?: () => void; size?: "md" | "lg"; className?: string }
export const tileClass: Record<TileColour, string> = …;
export function StoreTile({ retailer, selected, onClick, size = "lg", className }: StoreTileProps);
```

#### `src/components/ui/TextField.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-04 replaces; props are final.
export interface TextFieldProps {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  inputMode?: "text" | "decimal" | "numeric"; prefix?: string; suffix?: string; error?: string; className?: string;
}
export function TextField({ label, value, onChange, placeholder, inputMode = "text", prefix, suffix, error, className }: TextFieldProps);
```

#### `src/components/ui/Toast.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-05 replaces; API is final.
export interface ToastOptions { message: string; tone?: "brand" | VerdictTier }
export interface ToastContextValue { show: (opts: ToastOptions) => void }
export function ToastProvider({ children }: { children: ReactNode });
export const useToast = (): ToastContextValue => useContext(ToastContext);
```

#### `src/components/ui/Toggle.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-04 replaces; props are final.
export interface ToggleProps { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; className?: string }
export function Toggle({ checked, onChange, label, description, className }: ToggleProps);
```

#### `src/components/ui/VerdictBadge.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-02 replaces; props are final.
export interface VerdictBadgeProps { tier: VerdictTier; size?: "sm" | "md"; className?: string }
export function VerdictBadge({ tier, size = "sm", className }: VerdictBadgeProps);
```

#### `src/components/layout/AppShell.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-07 replaces; behaviour is final.
export function AppShell();
```

#### `src/components/layout/BottomNav.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-07 replaces; props are final.
export function BottomNav();
```

#### `src/components/layout/TopBar.tsx` (exports only)
```tsx
// STUB (SPEC-00). UI-07 replaces; props are final.
export interface TopBarProps { title?: string; back?: boolean; right?: ReactNode }
export function TopBar({ title, back, right }: TopBarProps);
```

#### `src/components/penny/Logo.tsx` (exports only)
```tsx
// STUB (SPEC-00). ART-02 replaces; props are final.
export interface LogoProps { size?: "sm" | "md" | "lg"; onDark?: boolean; className?: string }
export function Logo({ size = "md", onDark, className }: LogoProps);
```

#### `src/components/penny/Penny.tsx` (exports only)
```tsx
// STUB (SPEC-00). ART-01 replaces with the animated mascot; props are final.
export interface PennyProps { mood: PennyMood; size?: number; className?: string }
export function Penny({ mood, size = 120, className }: PennyProps);
```

#### `src/components/penny/PennyFace.tsx` (exports only)
```tsx
// STUB (SPEC-00). ART-01 replaces; props are final.
export interface PennyFaceProps { mood?: PennyMood; size?: number; className?: string }
export function PennyFace({ mood = "idle", size = 32, className }: PennyFaceProps);
```

#### `src/components/art/ItemArt.tsx` (exports only)
```tsx
// STUB (SPEC-00). ART-03/ART-04 replace with illustrations; props are final.
export interface ItemArtProps { artKey: ArtKey; size?: number; className?: string }
export function ItemArt({ artKey, size = 64, className }: ItemArtProps);
```

#### `src/components/domain/DataFreshness.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-04 replaces; props are final.
export function DataFreshness({ compact, className }: { compact?: boolean; className?: string });
```

#### `src/components/domain/FlyerDealCard.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-04 replaces; props are final.
export interface FlyerDealCardProps { deal: FeaturedDeal; onCheck: (deal: FeaturedDeal) => void; loading?: boolean; className?: string }
export function FlyerDealCard({ deal, onCheck, loading, className }: FlyerDealCardProps);
```

#### `src/components/domain/ItemRow.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-04 replaces; props are final.
export interface ItemRowProps { item: Item; right?: ReactNode; onClick?: () => void; className?: string }
export function ItemRow({ item, right, onClick, className }: ItemRowProps);
```

#### `src/components/domain/NearbyPrices.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-12 replaces; props are final.
export interface NearbyPricesProps { itemId: string; checkedPrice?: { retailerId: RetailerId; unitPrice: number }; limit?: number; title?: string; className?: string }
export function NearbyPrices({ itemId, limit = 6, title = "Prices near you", className }: NearbyPricesProps);
```

#### `src/components/domain/PriceGauge.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-09 replaces; props are final.
export interface PriceGaugeProps { pctVsAvg: number; tier: VerdictTier; animate?: boolean; compact?: boolean; className?: string }
export function PriceGauge({ pctVsAvg, tier, compact, className }: PriceGaugeProps);
```

#### `src/components/domain/PriceHistoryChart.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-11 replaces with the d3 + SVG chart; props are final.
export interface PriceHistoryChartProps {
  detail: ItemDetail; mode: "unit" | "package"; focusRetailer?: RetailerId;
  compact?: boolean; markPrice?: number; markTier?: VerdictTier; className?: string;
}
export function PriceHistoryChart({ detail, compact, className }: PriceHistoryChartProps);
```

#### `src/components/domain/SaleStreak.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-12 replaces; props are final.
export interface SaleStreakProps { points: PricePoint[]; weeks?: number; className?: string }
export function SaleStreak({ points, weeks = 12, className }: SaleStreakProps);
```

#### `src/components/domain/SpeakButton.tsx` (exports only)
```tsx
// STUB (SPEC-00). BE-10 replaces; props are final. Renders nothing unless voice is enabled in live mode.
// STUB (SPEC-00). BE-10 replaces; props are final. Renders nothing unless voice is enabled in live mode.
export function SpeakButton(_props: { text: string; className?: string });
```

#### `src/components/domain/TrickCard.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-09 replaces; props are final.
export interface TrickCardProps { trick: TrickFlag; index?: number; compact?: boolean; className?: string }
export function TrickCard({ trick, compact, className }: TrickCardProps);
```

## Cross-task contracts (stubs another task replaces; exports only)

#### `src/pages/landing/HeroDemo.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-01 replaces. Contract: `export function HeroDemo(): JSX.Element` (no props), used by LandingPage (SCR-02).
// STUB (SPEC-00). SCR-01 replaces. Contract: `export function HeroDemo(): JSX.Element` (no props), used by LandingPage (SCR-02).
export function HeroDemo();
```

#### `src/pages/check/entry/PriceKeypad.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-06 replaces. Contract used by PriceEntryPage (SCR-05):
// STUB (SPEC-00). SCR-06 replaces. Contract used by PriceEntryPage (SCR-05):
//   PriceKeypad({ value, onChange, hint }) where value is the raw typed string ("5.9"), max 2 decimals, max 999.99
//   parsePriceInput(value): number  (NaN-safe; "" -> 0)
export interface PriceKeypadProps { value: string; onChange: (value: string) => void; hint?: string }
export function parsePriceInput(value: string): number;
export function PriceKeypad({ value, onChange, hint }: PriceKeypadProps);
```

#### `src/pages/reveal/RevealResult.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-08 replaces. Contract used by RevealPage (SCR-07):
export interface RevealResultProps { verdict: Verdict; onReplay: () => void }
export function RevealResult({ verdict }: RevealResultProps);
```

#### `src/pages/scan/useCamera.ts` (exports only)
```ts
// STUB (SPEC-00). SCR-13 replaces. Contract used by ScanPage (SCR-14).
export type CameraState = "idle" | "starting" | "live" | "denied" | "unavailable" | "insecure";
export interface UseCamera {
  videoRef: RefObject<HTMLVideoElement | null>;
  state: CameraState;
  start: () => Promise<void>;
  stop: () => void;
  torchSupported: boolean;
  torchOn: boolean;
  toggleTorch: () => Promise<void>;
  canSwitch: boolean;
  switchCamera: () => Promise<void>;
}
export function useCamera(): UseCamera;
```

#### `src/pages/scan/captureFrame.ts` (exports only)
```ts
// STUB (SPEC-00). SCR-13 replaces. Contract used by ScanPage (SCR-14).
// STUB (SPEC-00). SCR-13 replaces. Contract used by ScanPage (SCR-14).
export interface Rect { x: number; y: number; width: number; height: number }
/** Map a rectangle in on-screen video-element coordinates to source video pixels, accounting for object-fit: cover. Pure, unit-testable. */
export function mapRectToVideo(rect: Rect, elementSize: { width: number; height: number }, videoSize: { width: number; height: number }): Rect;
/** Capture the current frame cropped to `guide` (element coordinates), long edge <= 1600px, JPEG 0.85. */
export async function captureFrame(video: HTMLVideoElement, guide: Rect): Promise<Blob>;
/** Downscale an arbitrary picked image file to long edge <= 1600px JPEG 0.85. */
export async function prepareImageFile(file: File): Promise<Blob>;
```

#### `src/pages/scan/ScanConfirmSheet.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-15 replaces. Contract used by ScanPage (SCR-14).
export interface ScanConfirmSheetProps {
  open: boolean;
  result: ScanResult;
  /** store preselected from the store hint when the scan didn't detect one */
  fallbackRetailerId?: RetailerId;
  onRetake: () => void;
  onClose: () => void;
}
export function ScanConfirmSheet({ open, onRetake, onClose }: ScanConfirmSheetProps);
```

#### `src/pages/scan/SampleSheet.tsx` (exports only)
```tsx
// STUB (SPEC-00). SCR-15 replaces. Contract used by ScanPage (SCR-14).
export type SampleId = "sample-butter" | "sample-yogurt" | "sample-pasta";
export const SAMPLES: Array<{ id: SampleId; src: string; label: string }> = …;
export interface SampleSheetProps { open: boolean; onClose: () => void; onPick: (id: SampleId, src: string) => void }
export function SampleSheet({ open, onClose, onPick }: SampleSheetProps);
```

