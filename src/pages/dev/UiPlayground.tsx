import { useState } from "react";
import { ArrowClockwise, Heart, Tag } from "@phosphor-icons/react";
import type { RetailerId, VerdictTier } from "@shared/types";
import { RETAILERS } from "@shared/retailers";
import { useTopBar } from "@/components/layout";
import {
  Button, LinkButton, IconButton, Card, Chip, VerdictBadge, Section,
  ProgressBar, PriceText, Skeleton, TextField, SearchField, Stepper,
  Toggle, Sheet, SpeechBubble, StoreTile, EmptyState, useToast,
} from "@/components/ui";
import type { ButtonVariant } from "@/components/ui";
import { tierMeta } from "@/lib/tier";

const variants: ButtonVariant[] = ["primary", "secondary", "ghost", "steal", "good", "normal", "high"];
const tiers: VerdictTier[] = ["steal", "good", "normal", "high"];
const tones = ["brand", ...tiers] as const;
const sizes = ["md", "lg"] as const;
const priceSizes = ["sm", "md", "lg", "xl"] as const;
const progressValues = [0, 0.25, 0.5, 0.75, 1];

export function UiPlayground() {
  useTopBar({ title: "UI playground", back: true });
  const { show } = useToast();
  const [lastAction, setLastAction] = useState("No action yet.");
  const [cardPresses, setCardPresses] = useState(0);
  const [chipSelected, setChipSelected] = useState(true);
  const [iconChipSelected, setIconChipSelected] = useState(false);
  const [progressIndex, setProgressIndex] = useState(2);
  const [name, setName] = useState("Salted butter");
  const [price, setPrice] = useState("5.99");
  const [invalidPrice, setInvalidPrice] = useState("five");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState("No search submitted.");
  const [quantity, setQuantity] = useState(2);
  const [minQuantity, setMinQuantity] = useState(1);
  const [maxQuantity, setMaxQuantity] = useState(5);
  const [enabled, setEnabled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [retailerId, setRetailerId] = useState<RetailerId>("saveon");
  const progress = progressValues[progressIndex]!;
  const report = (action: string) => setLastAction(action);

  return (
    <div className="flex min-w-0 flex-col gap-7 px-5 py-5 text-ink">
      <div className="space-y-2">
        <h1 className="font-display text-h1 font-bold">UI playground</h1>
        <p className="max-w-[60ch] text-small text-ink-soft">
          Review the shared components, then try their controls. All changes stay on this page.
        </p>
        <p role="status" className="text-small text-ink-soft">{lastAction}</p>
      </div>

      <Section title="Buttons">
        <div className="space-y-5">
          {variants.map((variant) => (
            <div key={variant} className="space-y-3">
              <h3 className="text-h3 font-extrabold capitalize">{variant}</h3>
              <div className="grid grid-cols-2 gap-3">
                {sizes.map((size) => (
                  <Button key={size} variant={variant} size={size} fullWidth
                    onClick={() => report(`${variant} ${size} button pressed.`)}>
                    {size === "md" ? "Medium" : "Large"}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant={variant} size="md" loading>Loading</Button>
                <Button variant={variant} size="md" disabled>Disabled</Button>
                <Button variant={variant} size="lg" leftIcon={<Tag size={24} weight="bold" />}
                  onClick={() => report(`${variant} icon button pressed.`)}>Check price</Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="LinkButton">
        <p className="mb-3 text-small text-ink-soft">These links open the check screen.</p>
        <div className="space-y-4">
          {variants.map((variant) => (
            <div key={variant} className="space-y-2">
              <h3 className="text-small font-bold capitalize">{variant}</h3>
              <div className="grid grid-cols-2 gap-3">
                {sizes.map((size) => (
                  <LinkButton key={size} to="/check" variant={variant} size={size} fullWidth
                    leftIcon={<Tag size={24} weight="bold" />}>Check</LinkButton>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="IconButtons">
        <div className="grid grid-cols-2 gap-4">
          {(["plain", "raised"] as const).map((variant) => (
            <div key={variant} className="space-y-3">
              <h3 className="text-small font-bold capitalize">{variant}</h3>
              <div className="flex flex-wrap items-center gap-3">
                {([40, 48] as const).map((size) => (
                  <div key={size} className="space-y-2">
                    <IconButton variant={variant} size={size}
                      icon={<Heart size={24} weight="bold" />}
                      label={`${variant} ${size}px favourite`}
                      onClick={() => report(`${variant} ${size}px IconButton pressed.`)} />
                    <p className="text-micro text-ink-soft">{size}px</p>
                  </div>
                ))}
              </div>
              <IconButton variant={variant} disabled label={`Disabled ${variant} favourite`}
                icon={<Heart size={24} weight="bold" />} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Cards">
        <div className="space-y-3">
          <Card><h3 className="text-h3 font-extrabold">Default card</h3><p className="text-small text-ink-soft">A raised white surface.</p></Card>
          <Card tone="sunken"><h3 className="text-h3 font-extrabold">Sunken card</h3><p className="text-small text-ink-soft">An inset surface.</p></Card>
          {tiers.map((tier) => <Card key={tier} tone={tier}><h3 className="text-h3 font-extrabold">{tierMeta[tier].label}</h3></Card>)}
          <Card interactive as="button" onClick={() => setCardPresses((count) => count + 1)}>
            <h3 className="text-h3 font-extrabold">Try an interactive card</h3>
            <p role="status" className="text-small text-ink-soft">Pressed {cardPresses} {cardPresses === 1 ? "time" : "times"}.</p>
          </Card>
        </div>
      </Section>

      <Section title="Chips">
        <div className="flex flex-wrap gap-3">
          <Chip selected={chipSelected} onClick={() => setChipSelected((selected) => !selected)}>Dairy</Chip>
          <Chip selected={!chipSelected} onClick={() => setChipSelected((selected) => !selected)}>Produce</Chip>
          <Chip selected={iconChipSelected} onClick={() => setIconChipSelected((selected) => !selected)}
            icon={<Heart size={24} weight={iconChipSelected ? "fill" : "bold"} />}>Favourites</Chip>
          <Chip selected={!iconChipSelected} onClick={() => setIconChipSelected((selected) => !selected)}
            icon={<Tag size={24} weight={!iconChipSelected ? "fill" : "bold"} />}>Flyer deals</Chip>
        </div>
      </Section>

      <Section title="VerdictBadges">
        <div className="space-y-3">
          {tiers.map((tier) => (
            <div key={tier} className="flex flex-wrap items-center gap-3">
              <VerdictBadge tier={tier} size="sm" /><VerdictBadge tier={tier} size="md" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="ProgressBars">
        <div className="space-y-4 motion-reduce:[&_*]:transition-none">
          <Button variant="secondary" size="md" fullWidth leftIcon={<ArrowClockwise size={24} weight="bold" />}
            onClick={() => setProgressIndex((index) => (index + 1) % progressValues.length)}>Cycle progress</Button>
          <p role="status" className="text-small text-ink-soft">{Math.round(progress * 100)}% complete. Cycles from 0% to 100%.</p>
          {tones.map((tone) => (
            <div key={tone} className="space-y-2">
              <h3 className="text-small font-bold">{tone === "brand" ? "Brand" : tierMeta[tone].label}</h3>
              <ProgressBar value={progress} tone={tone} height={12} label={`${tone}, 12px height`} />
              <ProgressBar value={progress} tone={tone} height={16} label={`${tone}, 16px height`} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="PriceText">
        <div className="space-y-4">
          {priceSizes.map((size) => (
            <div key={size} className="space-y-2">
              <h3 className="text-small font-bold">{size}</h3>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <PriceText amount={5.99} size={size} />
                <PriceText amount={13.2} size={size} unit="kg" />
                <PriceText amount={8.49} size={size} strike />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="TextField">
        <div className="space-y-4">
          <TextField label="Item name" value={name} onChange={setName} placeholder="Salted butter" />
          <TextField label="Unit price" value={price} onChange={setPrice} inputMode="decimal" prefix="$" suffix="/kg" />
          <TextField label="Price with an error" value={invalidPrice} onChange={setInvalidPrice}
            error="Enter a number, like 5.99." />
          <p className="text-small text-ink-soft">The error is kept visible so you can review its styling.</p>
        </div>
      </Section>

      <Section title="SearchField">
        <div className="space-y-3">
          <SearchField value={search} onChange={setSearch} placeholder="Search milk, eggs, butter..."
            onSubmit={() => setSearchResult(search.trim() ? `Submitted: ${search.trim()}` : "Type an item name to try search.")} />
          <p role="status" className="text-small text-ink-soft">{searchResult}</p>
        </div>
      </Section>

      <Section title="Stepper">
        <div className="space-y-3">
          <p className="text-small font-bold">Packages</p>
          <Stepper label="Packages" value={quantity} min={1} max={5} onChange={setQuantity} />
          <p className="text-small font-bold">Starts at the minimum</p>
          <Stepper label="At the minimum" value={minQuantity} min={1} max={5} onChange={setMinQuantity} />
          <p className="text-small font-bold">Starts at the maximum</p>
          <Stepper label="At the maximum" value={maxQuantity} min={1} max={5} onChange={setMaxQuantity} />
          <p className="text-small text-ink-soft">The boundary examples start with one disabled control each.</p>
        </div>
      </Section>

      <Section title="Toggle">
        <div className="space-y-4">
          <Toggle checked={enabled} onChange={setEnabled} label="Enable demo"
            description="This setting only changes the playground." />
          <Toggle checked={!enabled} onChange={(checked) => setEnabled(!checked)} label="Opposite state"
            description="Shows the other state beside the same setting." />
        </div>
      </Section>

      <Section title="Sheet">
        <Button fullWidth onClick={() => setSheetOpen(true)}>Open sheet</Button>
        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Playground sheet">
          <div className="space-y-4">
            <p className="max-w-[60ch] text-body">Review the sheet, then close it with the button, backdrop, or Escape.</p>
            <Button fullWidth onClick={() => setSheetOpen(false)}>Close sheet</Button>
          </div>
        </Sheet>
      </Section>

      <Section title="Toast">
        <div className="flex flex-wrap gap-3">
          {tones.map((tone) => (
            <Button key={tone} size="md" variant={tone === "brand" ? "primary" : tone}
              onClick={() => show({ tone, message: tone === "brand" ? "Brand toast" : `${tierMeta[tone].label} toast` })}>
              {tone === "brand" ? "Brand" : tierMeta[tone].label}
            </Button>
          ))}
        </div>
      </Section>

      <Section title="SpeechBubble">
        <div className="space-y-5 pl-3 pb-3">
          <SpeechBubble tail="left">I check the price, not the sale sticker.</SpeechBubble>
          <SpeechBubble tail="bottom">I can help you spot a real deal.</SpeechBubble>
        </div>
      </Section>

      <Section title="StoreTiles">
        <div className="space-y-5">
          {sizes.map((size) => (
            <div key={size} className="space-y-3">
              <h3 className="text-small font-bold">{size === "md" ? "Medium" : "Large"}</h3>
              <div className="grid grid-cols-2 gap-3">
                {RETAILERS.map((retailer) => <StoreTile key={retailer.id} retailer={retailer} size={size}
                  selected={retailerId === retailer.id} onClick={() => setRetailerId(retailer.id)}
                  className={retailerId === retailer.id ? "" : "opacity-60"} />)}
              </div>
            </div>
          ))}
          <p role="status" className="text-small text-ink-soft">Selected: {RETAILERS.find((retailer) => retailer.id === retailerId)?.name}</p>
        </div>
      </Section>

      <Section title="EmptyState">
        <EmptyState mood="thinking" title="No checks yet."
          body="Pick a flyer deal below or scan a tag."
          action={<Button onClick={() => report("Empty state action pressed.")}>Try a demo action</Button>} />
      </Section>

      <Section title="Skeletons">
        <div role="status" aria-label="Loading preview" className="space-y-4 motion-reduce:[&_*]:animate-none">
          <span className="sr-only">Loading preview</span>
          <div aria-hidden="true" className="flex items-center gap-4">
            <Skeleton className="size-16 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
          </div>
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </Section>
    </div>
  );
}
