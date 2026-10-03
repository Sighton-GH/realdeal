import type { Item, PriceCheckInput, PricePoint, Retailer, TrickFlag } from "../types";
import { formatSize, median, money, unitPriceOf, unitWord } from "./util";

export interface TrickContext {
  item: Item;
  input: PriceCheckInput;
  retailer: Retailer;
  /** chain-level points at the input retailer, oldest first */
  history: PricePoint[];
  /** the size used to compute inputUnit */
  size: number;
  inputUnit: number;
  pctVsAvg: number;
  saleFreq12w: number;
}

const pct = (n: number) => Math.round(n * 100);

export function detectTricks(c: TrickContext): TrickFlag[] {
  const tricks: TrickFlag[] = [];
  const { input, retailer, history } = c;
  const last12 = history.slice(-12);
  const last26 = history.slice(-26);

  // Forever sale
  const saleWeeks = last12.filter((p) => p.onSale).length;
  const latest = history[history.length - 1];
  if (c.saleFreq12w >= 0.5 && (input.wasPrice !== undefined || latest?.onSale === true)) {
    tricks.push({
      type: "perpetual_sale",
      title: "Forever sale",
      detail: `${retailer.name} has had this on sale ${saleWeeks} of the last 12 weeks. The sale price is really the regular price.`,
      stat: `${saleWeeks} of 12 weeks`,
    });
  }

  // Inflated "was" price (a was price at or below the price is not a claim of savings)
  if (input.wasPrice !== undefined && input.wasPrice > input.price && last26.length > 0) {
    const was = input.wasPrice;
    const k = last26.filter((p) => p.price >= was * 0.98).length;
    if (k / 26 < 0.25) {
      const claimed = pct((was - input.price) / was);
      const real = c.pctVsAvg >= 0 ? "nothing" : `${pct(-c.pctVsAvg)}%`;
      tricks.push({
        type: "inflated_was_price",
        title: "Inflated 'was' price",
        detail: `The tag claims ${claimed}% off, but it only sold for ${money(was)} in ${k} of the last 26 weeks. Against the real average you're saving ${real}.`,
        stat: `${k} of 26 weeks`,
      });
    }
  }

  // Multi-buy trap
  if (input.multiBuy) {
    const singles = last12.filter((p) => !p.multiBuy).map((p) => p.price);
    if (singles.length > 0) {
      const usual = median(singles);
      const each = input.multiBuy.total / input.multiBuy.qty;
      if (each >= usual * 0.95) {
        const diff = Math.abs(each - usual);
        const qty = input.multiBuy.qty;
        const detail =
          diff < 0.005
            ? `Buying ${qty} costs the same each as buying one.`
            : each > usual
              ? `Buying ${qty} actually costs ${money(diff)} more each than buying one.`
              : `Buying ${qty} saves you just ${money(diff)} each compared with its usual single price.`;
        tricks.push({ type: "multibuy_trap", title: "Multi-buy trap", detail, stat: `${money(diff)} each` });
      }
    }
  }

  // Shrinkflation
  if (last26.length > 0) {
    const oldSize = Math.max(...last26.map((p) => p.sizeQty));
    const newSize = c.size;
    if (newSize <= oldSize * 0.95) {
      const atOld = last26.filter((p) => p.sizeQty === oldSize).map((p) => unitPriceOf(p.price, p.sizeQty, p.multiBuy));
      const oldUnit = median(atOld);
      if (c.inputUnit >= oldUnit * 1.03) {
        const unit = c.item.unit;
        tricks.push({
          type: "shrinkflation",
          title: "Shrinkflation",
          detail: `This shrank from ${formatSize(oldSize, unit)} to ${formatSize(newSize, unit)}, and the price per ${unitWord(unit)} went up ${pct(c.inputUnit / oldUnit - 1)}%.`,
          stat: `${pct(1 - newSize / oldSize)}% smaller`,
        });
      }
    }
  }

  return tricks;
}
