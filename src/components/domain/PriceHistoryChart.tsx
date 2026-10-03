import { useEffect, useMemo, useRef, useState } from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { curveMonotoneX, line } from "d3-shape";
import { useReducedMotion } from "motion/react";
import type { ItemDetail, RetailerId, VerdictTier } from "@shared/types";
import { retailerById } from "@shared/retailers";
import { formatMoney, formatWeek } from "@/lib/format";
import {
  averageValue,
  chainPoints,
  effectivePackagePrice,
  monthShort,
  parseWeekDate,
  pointValue,
  seriesByRetailer,
  uniqueDates,
} from "./chart/priceMath";

export interface PriceHistoryChartProps {
  detail: ItemDetail; mode: "unit" | "package"; focusRetailer?: RetailerId;
  compact?: boolean; markPrice?: number; markTier?: VerdictTier; className?: string;
}

const MARGIN = { top: 12, right: 56, bottom: 24, left: 44 };
const MARGIN_COMPACT = { top: 8, right: 12, bottom: 18, left: 8 };

function tierFaceVar(tier: VerdictTier): string {
  return `var(--color-${tier})`;
}

export function PriceHistoryChart({
  detail, mode, focusRetailer, compact = false, markPrice, markTier, className,
}: PriceHistoryChartProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [width, setWidth] = useState(0);
  const [wide, setWide] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const height = compact ? 140 : wide ? 280 : 240;
  const margin = compact ? MARGIN_COMPACT : MARGIN;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(Math.round(el.clientWidth));
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? el.clientWidth;
      setWidth(Math.max(0, Math.round(w)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const points = useMemo(() => chainPoints(detail), [detail]);
  const dates = useMemo(() => uniqueDates(points), [points]);
  const series = useMemo(() => seriesByRetailer(points), [points]);
  const avg = useMemo(() => averageValue(detail, mode), [detail, mode]);
  const values = useMemo(() => {
    const out: number[] = [avg];
    for (const p of points) out.push(pointValue(p, mode));
    if (markPrice !== undefined && Number.isFinite(markPrice)) out.push(markPrice);
    return out.filter((v) => Number.isFinite(v));
  }, [points, mode, avg, markPrice]);
  const dateObjects = useMemo(() => dates.map(parseWeekDate), [dates]);
  // One memo so the scale below only rebuilds when the dates change (a single week gets a small window)
  const [domainMinDate, domainMaxDate] = useMemo<[Date, Date]>(() => {
    if (dateObjects.length > 1) return [dateObjects[0], dateObjects[dateObjects.length - 1]];
    const base = dateObjects.length > 0 ? dateObjects[0] : new Date();
    return [new Date(base.getTime() - 3 * 86400000), new Date(base.getTime() + 3 * 86400000)];
  }, [dateObjects]);
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom);
  const yScale = useMemo(() => {
    let lo = values.length > 0 ? Math.min(...values) : 0;
    let hi = values.length > 0 ? Math.max(...values) : 1;
    if (lo === hi) {
      const pad = Math.abs(lo) * 0.1 || 1;
      lo -= pad;
      hi += pad;
    }
    const span = hi - lo || 1;
    return scaleLinear().domain([lo - span * 0.08, hi + span * 0.08]).nice().range([innerH, 0]);
  }, [values, innerH]);
  const xScale = useMemo(
    () => scaleTime().domain([domainMinDate, domainMaxDate]).range([0, Math.max(innerW, 1)]),
    [domainMinDate, domainMaxDate, innerW],
  );
  const [yLo, yHi] = yScale.domain() as [number, number];
  const lineFor = useMemo(
    () => line<(typeof points)[number]>()
      .x((p) => xScale(parseWeekDate(p.date)))
      .y((p) => yScale(pointValue(p, mode)))
      .curve(curveMonotoneX),
    [xScale, yScale, mode],
  );
  const yTicks = useMemo(() => yScale.ticks(3), [yScale]);
  // Whole dollars are fine for wide ranges; narrow ones ($2.50 to $3.10) need cents or every label reads "$3"
  const yDecimals = yTicks.length > 1 && Math.abs(yTicks[1] - yTicks[0]) < 1 ? 2 : 0;
  const xTicks: Date[] = useMemo(() => {
    if (dateObjects.length === 0) return [];
    if (compact) {
      if (dateObjects.length === 1) return [dateObjects[0]];
      return [dateObjects[0], dateObjects[dateObjects.length - 1]];
    }
    const ticks = xScale.ticks(5);
    return ticks.length > 0 ? ticks : [dateObjects[0]];
  }, [xScale, dateObjects, compact]);
  const stealTop = avg * 0.75;
  const goodTop = avg * 0.9;
  const normalTop = avg * 1.1;
  const bands = [
    { key: "steal", label: "steal", lo: yLo, hi: Math.min(stealTop, yHi), fill: "fill-steal-tint" },
    { key: "good", label: "good", lo: Math.max(stealTop, yLo), hi: Math.min(goodTop, yHi), fill: "fill-good-tint" },
    { key: "high", label: "high", lo: Math.max(normalTop, yLo), hi: yHi, fill: "fill-high-tint" },
  ];
  const byDateRetailer = useMemo(() => {
    const map = new Map<string, Map<RetailerId, (typeof points)[number]>>();
    for (const p of points) {
      let row = map.get(p.date);
      if (!row) {
        row = new Map();
        map.set(p.date, row);
      }
      row.set(p.retailerId, p);
    }
    return map;
  }, [points]);
  const lowest = useMemo(() => {
    let best: { value: number; retailerId: RetailerId } | null = null;
    for (const p of points) {
      const v = pointValue(p, mode);
      if (!best || v < best.value) best = { value: v, retailerId: p.retailerId };
    }
    return best;
  }, [points, mode]);
  const summary = useMemo(() => {
    const unitWord = mode === "unit" ? `per ${detail.item.unit}` : "per package";
    const storeWord = series.length === 1 ? "1 store" : `${series.length} stores`;
    const lowWord = lowest != null
      ? `; lowest ${formatMoney(lowest.value)} at ${retailerById(lowest.retailerId).name}` : "";
    return `Price ${unitWord} over ${dates.length} weeks at ${storeWord}${lowWord}`;
  }, [mode, detail.item.unit, series.length, dates.length, lowest]);
  const animate = mounted && !reduceMotion;
  const showMark = markPrice !== undefined && markTier !== undefined && Number.isFinite(markPrice);
  const markY = showMark ? yScale(markPrice as number) : 0;
  const indexFromClientX = (clientX: number): number | null => {
    const svg = svgRef.current;
    if (!svg || dates.length === 0 || innerW <= 0) return null;
    const rect = svg.getBoundingClientRect();
    const px = clientX - rect.left - margin.left;
    const t = xScale.invert(Math.max(0, Math.min(innerW, px))).getTime();
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    dateObjects.forEach((d, i) => {
      const dist = Math.abs(d.getTime() - t);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });
    return bestIdx;
  };
  const activeDate = active != null ? dates[active] : null;
  const activeX = active != null && dateObjects[active] ? xScale(dateObjects[active]) : 0;
  const moveWeek = (delta: -1 | 1) => {
    if (dates.length === 0) return;
    setPinned(true);
    setActive((cur) => {
      if (cur == null) return delta === 1 ? 0 : dates.length - 1;
      return Math.max(0, Math.min(dates.length - 1, cur + delta));
    });
  };
  if (points.length === 0) {
    return (
      <div className={className}>
        <p className="text-small text-ink-soft">No price history yet.</p>
      </div>
    );
  }
  return (
    <div ref={wrapRef} className={`relative w-full${className ? ` ${className}` : ""}`}>
      {width === 0 ? (
        <div style={{ height }} aria-hidden="true" />
      ) : (
        <svg
          ref={svgRef}
          width={width}
          height={height}
          role="img"
          aria-label={summary}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              moveWeek(-1);
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              moveWeek(1);
            } else if (e.key === "Escape") {
              setActive(null);
              setPinned(false);
            }
          }}
          onPointerMove={(e) => {
            const idx = indexFromClientX(e.clientX);
            if (idx != null) setActive(idx);
          }}
          onPointerLeave={() => {
            if (!pinned) setActive(null);
          }}
          onPointerDown={(e) => {
            if (pinned) {
              setPinned(false);
              setActive(null);
              return;
            }
            const idx = indexFromClientX(e.clientX);
            if (idx != null) {
              setActive(idx);
              setPinned(true);
            }
          }}
          className="block w-full touch-manipulation"
        >
          {bands.map((b) => {
            const top = yScale(b.hi);
            const bottom = yScale(b.lo);
            const h = bottom - top;
            if (!(h > 1)) return null;
            return (
              <g key={b.key}>
                <rect x={margin.left} y={margin.top + top} width={innerW} height={h} className={b.fill} />
                {!compact && h > 14 && (
                  <text x={margin.left + innerW + 6} y={margin.top + top + h / 2} dominantBaseline="central" className="fill-ink-soft text-micro font-bold">
                    {b.label}
                  </text>
                )}
              </g>
            );
          })}
          {yTicks.map((t) => {
            const y = margin.top + yScale(t);
            return (
              <g key={t}>
                <line x1={margin.left} x2={margin.left + innerW} y1={y} y2={y} stroke="var(--color-line)" strokeWidth={1} />
                {!compact && (
                  <text x={margin.left - 6} y={y} textAnchor="end" dominantBaseline="central" className="fill-ink-soft text-[12px] font-bold">
                    {`$${t.toFixed(yDecimals)}`}
                  </text>
                )}
              </g>
            );
          })}
          <line x1={margin.left} x2={margin.left + innerW} y1={margin.top + yScale(avg)} y2={margin.top + yScale(avg)} stroke="var(--color-ink-soft)" strokeWidth={1.5} strokeDasharray="5 5" />
          {!compact && (
            <text x={margin.left + innerW + 6} y={margin.top + yScale(avg)} dominantBaseline="central" className="fill-ink-soft text-micro font-bold">
              usual
            </text>
          )}
          {series.map((s) => {
            const d = lineFor(s.points) ?? "";
            const stroke = `var(--color-${retailerById(s.retailerId).tile})`;
            const dimmed = focusRetailer !== undefined && focusRetailer !== s.retailerId;
            return (
              <g key={s.retailerId} opacity={dimmed ? 0.25 : 1}>
                <path d={d} transform={`translate(${margin.left},${margin.top})`} fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={animate || reduceMotion ? 0 : 1} style={reduceMotion ? undefined : { transition: "stroke-dashoffset 700ms ease-out" }} />
                {s.points.map((p) => {
                  const cx = margin.left + xScale(parseWeekDate(p.date));
                  const cy = margin.top + yScale(pointValue(p, mode));
                  if (p.multiBuy) {
                    return <rect key={`${p.date}-${p.retailerId}`} x={cx - 3.5} y={cy - 3.5} width={7} height={7} fill={stroke} />;
                  }
                  if (p.onSale) {
                    return <circle key={`${p.date}-${p.retailerId}`} cx={cx} cy={cy} r={4} fill={stroke} />;
                  }
                  return null;
                })}
              </g>
            );
          })}
          {showMark && markTier ? (
            <g>
              <line
                x1={margin.left}
                x2={margin.left + innerW}
                y1={margin.top + markY}
                y2={margin.top + markY}
                stroke={tierFaceVar(markTier)}
                strokeWidth={3}
              />
              <g transform={`translate(${margin.left + innerW - 44},${margin.top + markY - 11})`}>
                <rect width={44} height={22} rx={11} fill={tierFaceVar(markTier)} />
                <text
                  x={22}
                  y={11}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-micro font-extrabold ${markTier === "normal" ? "fill-ink" : "fill-white"}`}
                >
                  You
                </text>
              </g>
            </g>
          ) : null}
          {active !== null && dateObjects[active] ? (
            <line
              x1={margin.left + activeX}
              x2={margin.left + activeX}
              y1={margin.top}
              y2={margin.top + innerH}
              stroke="var(--color-ink)"
              strokeWidth={1.5}
            />
          ) : null}
          {xTicks.map((t, i) => {
            const x = margin.left + xScale(t);
            const anchor: "start" | "middle" | "end" =
              xTicks.length > 1 && !compact
                ? i === 0
                  ? "start"
                  : i === xTicks.length - 1
                    ? "end"
                    : "middle"
                : "middle";
            return (
              <text
                key={`${t.getTime()}-${i}`}
                x={x}
                y={height - 6}
                textAnchor={anchor}
                className="fill-ink-soft text-[12px] font-bold"
              >
                {monthShort(t)}
              </text>
            );
          })}
        </svg>
      )}
      {activeDate !== null && width > 0 ? (
        <div
          className="lifted bg-canvas rounded-sm p-3 absolute z-10 w-44"
          style={{ left: Math.max(8, Math.min(width - 184, margin.left + activeX + 12)), top: 8 }}
        >
          <p className="text-small font-extrabold">{formatWeek(activeDate)}</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {series.map((s) => {
              const point = byDateRetailer.get(activeDate)?.get(s.retailerId);
              if (!point) return null;
              const label = point.multiBuy
                ? `${point.multiBuy.qty} for ${formatMoney(point.multiBuy.total)}`
                : formatMoney(effectivePackagePrice(point));
              return (
                <li key={s.retailerId} className="flex items-baseline justify-between gap-2">
                  <span className="text-small text-ink-soft">{retailerById(s.retailerId).shortName}</span>
                  <span className="text-small font-extrabold tabular">
                    {label}
                    {point.onSale ? " · On sale" : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      <table className="sr-only">
        <caption>{summary}</caption>
        <thead>
          <tr>
            <th scope="col">Week</th>
            {series.map((s) => (
              <th key={s.retailerId} scope="col">
                {retailerById(s.retailerId).name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map((date) => (
            <tr key={date}>
              <th scope="row">{formatWeek(date)}</th>
              {series.map((s) => {
                const point = byDateRetailer.get(date)?.get(s.retailerId);
                return (
                  <td key={s.retailerId}>
                    {point ? formatMoney(effectivePackagePrice(point)) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
