import { useEffect, useState } from "react";
import { Link } from "react-router";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { Item, MultiBuy, RetailerId, ScanResult } from "@shared/types";
import { RETAILERS } from "@shared/retailers";
import { Button, Chip, PriceText, Sheet, StoreTile, TextField } from "@/components/ui";
import { ItemRow } from "@/components/domain";
import { formatMoney, formatSize } from "@/lib/format";
import { useRunCheck } from "@/pages/check/useRunCheck";

export interface ScanConfirmSheetProps {
  open: boolean;
  result: ScanResult;
  fallbackRetailerId?: RetailerId;
  onRetake: () => void;
  onClose: () => void;
}

const SEARCH_PATH = "/check?focus=search";
const linkClass =
  "inline-flex min-h-12 items-center px-1 text-small font-extrabold text-grape-500 underline underline-offset-4";

function parseMoney(raw: string): number {
  const n = Number.parseFloat(raw.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function moneyField(n: number | undefined): string {
  return n === undefined ? "" : String(Math.round(n * 100) / 100);
}

/** Size is edited in the unit people read on the tag (g, mL, pack, dozen). */
function sizeEditUnit(item: Item): { factor: number; suffix: string } {
  switch (item.unit) {
    case "kg": return { factor: 1000, suffix: "g" };
    case "L": return { factor: 1000, suffix: "mL" };
    case "each": return { factor: 1, suffix: "pack" };
    case "dozen": return { factor: 1, suffix: "dozen" };
  }
}

interface FormState {
  item: Item | undefined;
  retailerId: RetailerId | undefined;
  price: string;
  wasPrice: number | undefined;
  multiBuy: MultiBuy | undefined;
  sizeQty: number | undefined;
}

function initialState(result: ScanResult, fallbackRetailerId: RetailerId | undefined): FormState {
  return {
    item: result.candidates[0],
    retailerId: result.retailerId ?? fallbackRetailerId,
    price: moneyField(result.price),
    wasPrice: result.wasPrice,
    multiBuy: result.multiBuy,
    sizeQty: result.sizeQty,
  };
}

type Editing = "price" | "was" | "multi" | "size" | null;

export function ScanConfirmSheet({ open, result, fallbackRetailerId, onRetake, onClose }: ScanConfirmSheetProps) {
  const { run, running, error } = useRunCheck();
  const [form, setForm] = useState<FormState>(() => initialState(result, fallbackRetailerId));
  const [showOthers, setShowOthers] = useState(false);
  const [editing, setEditing] = useState<Editing>(() => (result.price === undefined ? "price" : null));
  const [wasText, setWasText] = useState(() => moneyField(result.wasPrice));
  const [multiQty, setMultiQty] = useState(() => String(result.multiBuy?.qty ?? 2));
  const [multiTotal, setMultiTotal] = useState(() => moneyField(result.multiBuy?.total));
  const [sizeText, setSizeText] = useState("");

  // A new scan result starts a fresh form.
  useEffect(() => {
    setForm(initialState(result, fallbackRetailerId));
    setShowOthers(false);
    setEditing(result.price === undefined ? "price" : null);
    setWasText(moneyField(result.wasPrice));
    setMultiQty(String(result.multiBuy?.qty ?? 2));
    setMultiTotal(moneyField(result.multiBuy?.total));
    setSizeText("");
  }, [result, fallbackRetailerId]);

  const { item, retailerId, price, wasPrice, multiBuy, sizeQty } = form;
  const priceNum = parseMoney(price);
  const valid = item !== undefined && retailerId !== undefined && priceNum > 0;
  const others = result.candidates.filter((c) => c.id !== item?.id);

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  function startSizeEdit() {
    if (!item) return;
    const { factor } = sizeEditUnit(item);
    setSizeText(sizeQty === undefined ? "" : String(Math.round(sizeQty * factor * 100) / 100));
    setEditing("size");
  }

  function finishEdit() {
    if (editing === "was") {
      const n = parseMoney(wasText);
      patch({ wasPrice: n > 0 ? n : undefined });
    } else if (editing === "multi") {
      const qty = Math.round(Number.parseFloat(multiQty));
      const total = parseMoney(multiTotal);
      patch({ multiBuy: qty >= 2 && total > 0 ? { qty, total } : undefined });
    } else if (editing === "size" && item) {
      const n = Number.parseFloat(sizeText);
      patch({ sizeQty: Number.isFinite(n) && n > 0 ? n / sizeEditUnit(item).factor : undefined });
    }
    setEditing(null);
  }

  async function handleCheck() {
    if (!valid || !item || !retailerId) return;
    await run({ itemId: item.id, retailerId, price: priceNum, wasPrice, multiBuy, sizeQty, source: "scan" });
  }

  const doneButton = (
    <button type="button" onClick={finishEdit} className={linkClass}>
      Done
    </button>
  );

  return (
    <Sheet open={open} onClose={onClose} title="Is this right?">
      <div className="flex flex-col gap-5">
        {result.message ? <p className="text-small text-ink-soft">{result.message}</p> : null}

        <section aria-label="Item" className="flex flex-col gap-2">
          {item ? (
            <>
              <ItemRow
                item={item}
                right={
                  others.length > 0 ? (
                    <Button variant="ghost" size="md" onClick={() => setShowOthers((v) => !v)} aria-expanded={showOthers}>
                      Change
                    </Button>
                  ) : undefined
                }
              />
              {showOthers ? (
                <div className="flex flex-wrap items-center gap-2">
                  {others.map((c) => (
                    <Chip
                      key={c.id}
                      onClick={() => {
                        patch({ item: c });
                        setShowOthers(false);
                      }}
                    >
                      {c.name} {c.sizeLabel}
                    </Chip>
                  ))}
                  <Link to={SEARCH_PATH} className={linkClass}>
                    Search instead
                  </Link>
                </div>
              ) : null}
            </>
          ) : (
            <Link
              to={SEARCH_PATH}
              className="flex h-14 items-center gap-3 rounded-md border-2 border-line bg-sunken px-4 text-body font-extrabold text-ink-soft"
            >
              <MagnifyingGlass size={24} weight="bold" aria-hidden="true" />
              Pick the item
            </Link>
          )}
        </section>

        <section aria-label="Store" className="flex flex-col gap-2">
          <h3 className="text-h3">Which store?</h3>
          <div className="grid grid-cols-2 gap-3">
            {RETAILERS.map((r) => (
              <StoreTile key={r.id} retailer={r} size="md" selected={retailerId === r.id} onClick={() => patch({ retailerId: r.id })} />
            ))}
          </div>
        </section>

        <section aria-label="Price" className="flex flex-col gap-2">
          {editing === "price" ? (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <TextField label="Price" value={price} onChange={(v) => patch({ price: v })} inputMode="decimal" prefix="$" placeholder="0.00" />
              </div>
              {doneButton}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              {priceNum > 0 ? <PriceText amount={priceNum} size="xl" /> : <span className="text-small text-ink-soft">No price yet</span>}
              <button type="button" onClick={() => setEditing("price")} className={linkClass}>
                Edit
              </button>
            </div>
          )}

          {wasPrice !== undefined && editing !== "was" ? (
            <div className="flex items-center justify-between text-small">
              <span>was {formatMoney(wasPrice)}</span>
              <span className="flex items-center gap-2">
                <button type="button" onClick={() => { setWasText(moneyField(wasPrice)); setEditing("was"); }} className={linkClass}>Edit</button>
                <button type="button" onClick={() => patch({ wasPrice: undefined })} className={linkClass}>Remove</button>
              </span>
            </div>
          ) : null}
          {editing === "was" ? (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <TextField label="Was price" value={wasText} onChange={setWasText} inputMode="decimal" prefix="$" />
              </div>
              {doneButton}
            </div>
          ) : null}

          {multiBuy !== undefined && editing !== "multi" ? (
            <div className="flex items-center justify-between text-small">
              <span>{multiBuy.qty} for {formatMoney(multiBuy.total)}</span>
              <span className="flex items-center gap-2">
                <button type="button" onClick={() => { setMultiQty(String(multiBuy.qty)); setMultiTotal(moneyField(multiBuy.total)); setEditing("multi"); }} className={linkClass}>Edit</button>
                <button type="button" onClick={() => patch({ multiBuy: undefined })} className={linkClass}>Remove</button>
              </span>
            </div>
          ) : null}
          {editing === "multi" ? (
            <div className="flex items-end gap-3">
              <div className="w-24">
                <TextField label="Quantity" value={multiQty} onChange={setMultiQty} inputMode="numeric" />
              </div>
              <div className="flex-1">
                <TextField label="Total" value={multiTotal} onChange={setMultiTotal} inputMode="decimal" prefix="$" />
              </div>
              {doneButton}
            </div>
          ) : null}

          {sizeQty !== undefined && item && editing !== "size" ? (
            <div className="flex items-center justify-between text-small">
              <span>Size: {formatSize(sizeQty, item.unit)}</span>
              <span className="flex items-center gap-2">
                <button type="button" onClick={startSizeEdit} className={linkClass}>Edit</button>
                <button type="button" onClick={() => patch({ sizeQty: undefined })} className={linkClass}>Remove</button>
              </span>
            </div>
          ) : null}
          {editing === "size" && item ? (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <TextField label="Size" value={sizeText} onChange={setSizeText} inputMode="decimal" suffix={sizeEditUnit(item).suffix} />
              </div>
              {doneButton}
            </div>
          ) : null}
        </section>

        {error ? <p role="alert" className="rounded-sm bg-high-tint p-3 text-small text-ink">{error}</p> : null}

        <div className="flex flex-col gap-3">
          <Button fullWidth loading={running} disabled={!valid || running} onClick={handleCheck}>
            Check price
          </Button>
          <Button variant="secondary" size="md" fullWidth onClick={onRetake}>
            Retake
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
