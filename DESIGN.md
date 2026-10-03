# DESIGN.md: RealDeal design system

Every agent reads this before writing UI. It is the single source of truth for look, feel, motion, copy, and the shared component contract.

## 1. The idea

**A game show for grocery prices.** Two references, used deliberately:

- **Duolingo** gives us the tactility: chunky rounded type, bright flat colour, buttons with a solid "lip" that physically press down, a friendly mascot that reacts to you, encouraging plain-spoken copy.
- **Kahoot** gives us the drama: a deep purple stage, big coloured answer tiles, a countdown, and a reveal that slams onto the screen.

**Spend boldness in one place: the verdict reveal** (SCR-07). Everything else is calm, clean, white, and disciplined so the reveal hits hard. When in doubt, remove decoration.

The mascot is **Penny**, a copper coin. Canada retired the penny in 2013, so she found a new job: checking prices. She is how the app shows emotion. UI text stays plain; Penny carries the personality.

## 2. Colour

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

## 3. Tailwind v4 theme (SPEC-00 copies this verbatim into `src/styles/theme.css`)

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

## 4. Typography

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

## 5. Shape and depth

- Radii: `rounded-sm` (10) inputs and chips, `rounded-md` (16) buttons and cards, `rounded-lg` (24) sheets and hero cards, `rounded-xl` (32) the desktop app column, `rounded-full` pills, nav button, avatars.
- **No blurred shadows anywhere.** Depth comes only from the lip (`.press`) and the thick bottom border (`.lifted`).
- Pressed state: moves down 4px, lip disappears. Disabled: `bg-sunken text-ink-soft [--lip:var(--color-line-strong)]`, no press.
- Modal and sheet backdrop: `bg-ink/55`, no backdrop blur.
- Spacing on a 4px grid. Screen padding `px-5`. Gap between sections `gap-7` (28px). Card padding `p-4` or `p-5`. Primary buttons are 56px tall (`h-14`), secondary 48px (`h-12`).

## 6. Layout

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

## 7. Icons

`@phosphor-icons/react`, 24px, weight `bold` by default, `fill` for active or selected states. **Never use emoji as icons or decoration**, anywhere.

## 8. Illustration style (Penny and item art)

- Flat vector, **no outlines**, no gradients.
- Each object uses at most 3 tones: base, shade, highlight. Shading is a hard-edged shape (crescent or band), not a blur.
- Chunky, slightly squat proportions, generous rounded corners.
- Penny and item art must look like they come from the same hand.

## 9. Motion

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

## 10. Voice and copy

- UI labels are plain and specific. Penny speaks in short first-person lines inside a SpeechBubble.
- Buttons say exactly what happens: "Check price", "Check another", "See price history", "Scan a price tag", "Try a sample tag". The same action keeps the same name throughout.
- Verdict words: **Steal!**, **Good deal**, **Normal price**, **Overpriced**.
- Errors say what happened and how to fix it, no apology, no "Oops": "Penny couldn't find a price in that photo. Try a closer shot of the tag, or type it in."
- Empty states invite action: "No checks yet. Pick a flyer deal below or scan a tag."
- Canadian spelling, CAD, "per kg" not "/kg" in sentences (the `/kg` short form is fine inside price chips).

## 11. Never do this (generic-AI tells)

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

## 12. Shared component contract

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
