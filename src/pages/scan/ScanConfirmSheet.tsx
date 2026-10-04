import { useEffect, useState } from "react";
import { Link } from "react-router";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { Item, MultiBuy, RetailerId, ScanResult, TagAmount, TagUnit } from "@shared/types";
import { retailerById } from "@shared/retailers";
import { amountForItem, compatibleUnits, formatTagAmount, toItemUnits } from "@shared/units";
import { Button, Chip, PriceText, Sheet, StoreTile, TextField } from "@/components/ui";
import { ItemRow } from "@/components/domain";
import { formatMoney } from "@/lib/format";
import { useRunCheck } from "@/pages/check/useRunCheck";
import { useStoreChoices } from "./parts/useStoreChoices";

export interface ScanConfirmSheetProps {
  open: boolean;
  result: ScanResult;
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

type StoreChoice = RetailerId | "other" | undefined;

interface FormState {
  item: Item | undefined;
  price: string;
  wasPrice: number | undefined;
  multiBuy: MultiBuy | undefined;
  amount: TagAmount;
  fromTag: boolean;
}

function initialState(result: ScanResult): FormState {
  const item = result.candidates[0];
  const { amount, fromTag } = item ? amountForItem(result.tagAmount, item) : { amount: { qty: 1, unit: "each" } as TagAmount, fromTag: false };
  return {
    item,
    price: moneyField(result.price),
    wasPrice: result.wasPrice,
    multiBuy: result.multiBuy,
    amount,
    fromTag,
  };
}

type Editing = "tag" | "was" | "multi" | null;

function unitLabel(unit: TagUnit): string {
  return unit === "each" ? "pack" : unit;
}

export function ScanConfirmSheet({ open, result, onRetake, onClose }: ScanConfirmSheetProps) {
  const { run, running, error } = useRunCheck();
  const [form, setForm] = useState<FormState>(() => initialState(result));
  const [showOthers, setShowOthers] = useState(false);
  const [editing, setEditing] = useState<Editing>(() => (result.price === undefined ? "tag" : null));
  const [wasText, setWasText] = useState(() => moneyField(result.wasPrice));
  const [multiQty, setMultiQty] = useState(() => String(result.multiBuy?.qty ?? 2));
  const [multiTotal, setMultiTotal] = useState(() => moneyField(result.multiBuy?.total));
  const [amountText, setAmountText] = useState(() => String(initialState(result).amount.qty));
  const [amountUnit, setAmountUnit] = useState<TagUnit>(() => initialState(result).amount.unit);
  const [store, setStore] = useState<StoreChoice>(() => result.retailerId);
  const [pickerOpen, setPickerOpen] = useState(() => result.retailerId === undefined);
  const [manualStore, setManualStore] = useState(false);

  // A new scan result starts a fresh form.
  useEffect(() => {
    const init = initialState(result);
    setForm(init);
    setShowOthers(false);
    setEditing(result.price === undefined ? "tag" : null);
    setWasText(moneyField(result.wasPrice));
    setMultiQty(String(result.multiBuy?.qty ?? 2));
    setMultiTotal(moneyField(result.multiBuy?.total));
    setAmountText(String(init.amount.qty));
    setAmountUnit(init.amount.unit);
    setStore(result.retailerId);
    setPickerOpen(result.retailerId === undefined);
    setManualStore(false);
  }, [result]);

  const { item, price, wasPrice, multiBuy, amount, fromTag } = form;
  const { ordered, atStore, locating } = useStoreChoices(item?.id);

  // When GPS finds the branch the user is standing in, pre-select it until they pick by hand.
  useEffect(() => {
    if (!manualStore && store === undefined && atStore) setStore(atStore.retailerId);
  }, [atStore, manualStore, store]);

  const priceNum = parseMoney(price);
  const valid = item !== undefined && priceNum > 0 && amount.qty > 0 && store !== undefined;
  const others = result.candidates.filter((c) => c.id !== item?.id);
  const showPicker = store === undefined || pickerOpen;

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  function pickCandidate(c: Item) {
    const tagSource = form.fromTag ? form.amount : undefined;
    const next = amountForItem(tagSource, c);
    patch({ item: c, amount: next.amount, fromTag: next.fromTag });
    setAmountText(String(next.amount.qty));
    setAmountUnit(next.amount.unit);
    setShowOthers(false);
  }

  function startTagEdit() {
    setAmountText(String(amount.qty));
    setAmountUnit(amount.unit);
    setEditing("tag");
  }

  function finishEdit() {
    if (editing === "tag") {
      const qty = Number.parseFloat(amountText);
      if (Number.isFinite(qty) && qty > 0) {
        const rounded = Math.round(qty * 100) / 100;
        const changed = rounded !== amount.qty || amountUnit !== amount.unit;
        patch({ amount: { qty: rounded, unit: amountUnit }, fromTag: changed ? true : fromTag });
      }
    } else if (editing === "was") {
      const n = parseMoney(wasText);
      patch({ wasPrice: n > 0 ? n : undefined });
    } else if (editing === "multi") {
      const qty = Math.round(Number.parseFloat(multiQty));
      const total = parseMoney(multiTotal);
      patch({ multiBuy: qty >= 2 && total > 0 ? { qty, total } : undefined });
    }
    setEditing(null);
  }

  function chooseStore(next: RetailerId | "other") {
    setStore(next);
    setManualStore(true);
    setPickerOpen(false);
  }

  async function handleCheck() {
    if (!valid || !item || store === undefined) return;
    await run({
      itemId: item.id,
      retailerId: store === "other" ? undefined : store,
      price: priceNum,
      wasPrice,
      multiBuy,
      sizeQty: toItemUnits(amount, item.unit),
      tagAmount: amount,
      source: "scan",
    });
  }

  const doneButton = (
    <button type="button" onClick={finishEdit} className={linkClass}>
      Done
    </button>
  );

  const storeLabel =
    store === "other" ? "Other store" : store === atStore?.retailerId && atStore ? `At ${atStore.name}` : store ? retailerById(store).name : "";

  return (
    <Sheet open={open} onClose={onClose} title="Is this right?">
      <div className="flex flex-col gap-5">
        {result.message ? <p className="text-small text-ink-soft">{result.message}</p> : null}

        <section aria-label="Item" className="flex flex-col gap-2">
          {item ? (
            <>
              <ItemRow
                item={item}
                showSizes={false}
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
                    <Chip key={c.id} onClick={() => pickCandidate(c)}>
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

        {item ? (
          <section aria-label="On the tag" className="flex flex-col gap-2">
            <h3 className="text-h3">On the tag</h3>
            {editing === "tag" ? (
              <div className="flex flex-col gap-3">
                <div className="min-w-0">
                  <TextField label="Price" value={price} onChange={(v) => patch({ price: v })} inputMode="decimal" prefix="$" placeholder="0.00" />
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="w-28 shrink-0">
                    <TextField label="Amount" value={amountText} onChange={setAmountText} inputMode="decimal" />
                  </div>
                  {compatibleUnits(item.unit).map((u) => (
                    <Chip key={u} selected={amountUnit === u} onClick={() => setAmountUnit(u)}>
                      {unitLabel(u)}
                    </Chip>
                  ))}
                </div>
                <div className="flex justify-end">{doneButton}</div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div>
                  {priceNum > 0 ? <PriceText amount={priceNum} size="xl" /> : <span className="text-small text-ink-soft">No price yet</span>}
                  <p className="text-body font-extrabold text-ink-soft">{formatTagAmount(amount)}</p>
                  {!fromTag ? <p className="text-small text-ink-soft">Not on the tag. Check it matches.</p> : null}
                </div>
                <button type="button" onClick={startTagEdit} className={linkClass}>
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
          </section>
        ) : null}

        <section aria-label="Store" className="flex flex-col gap-2">
          <h3 className="text-h3">Which store?</h3>
          {showPicker ? (
            <>
              {locating ? <p className="text-small text-ink-soft">Finding the nearest store…</p> : null}
              <div className="grid grid-cols-2 gap-3">
                {ordered.map((r) => (
                  <StoreTile key={r.id} retailer={r} size="md" selected={store === r.id} onClick={() => chooseStore(r.id)} />
                ))}
              </div>
              <Chip selected={store === "other"} onClick={() => chooseStore("other")} className="min-h-12">
                Other store
              </Chip>
            </>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-body font-extrabold">{storeLabel}</span>
              <button type="button" onClick={() => setPickerOpen(true)} className={linkClass}>
                Change
              </button>
            </div>
          )}
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
