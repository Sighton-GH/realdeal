import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { Scan } from "@phosphor-icons/react";
import type { Category, FeaturedDeal } from "@shared/types";
import { api } from "@/api/client";
import { useAppStore } from "@/store/useAppStore";
import { useTopBar } from "@/components/layout";
import { Penny } from "@/components/penny";
import { Button, Chip, EmptyState, LinkButton, PriceText, SearchField, Section, Sheet, Skeleton, SpeechBubble, VerdictBadge } from "@/components/ui";
import { DataFreshness, FlyerDealCard, ItemRow } from "@/components/domain";
import { useRunCheck } from "./useRunCheck";
import { useDebouncedValue } from "./home/useDebouncedValue";

const CATEGORIES: Array<{ label: string; value: Category }> = [
  { label: "Dairy", value: "dairy" },
  { label: "Produce", value: "produce" },
  { label: "Bakery", value: "bakery" },
  { label: "Pantry", value: "pantry" },
];

export function CheckHomePage() {
  useTopBar({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoFocusSearch = searchParams.get("focus") === "search";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [busyDealId, setBusyDealId] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query.trim(), 200);
  const isSearching = debouncedQuery.length > 0 || category !== null;
  const search = useQuery({
    queryKey: ["search", debouncedQuery, category ?? "all"],
    queryFn: () => api.searchItems(debouncedQuery, category ?? undefined),
    enabled: isSearching,
    placeholderData: keepPreviousData,
  });
  const featured = useQuery({ queryKey: ["featured"], queryFn: () => api.getFeatured() });
  const { run } = useRunCheck();
  const recentChecks = useAppStore((s) => s.recentChecks);
  const clearChecks = useAppStore((s) => s.clearChecks);
  const recent = recentChecks.slice(0, 5);

  const handleCheckDeal = async (deal: FeaturedDeal) => {
    setBusyDealId(deal.id);
    try {
      await run({
        itemId: deal.item.id,
        retailerId: deal.retailerId,
        price: deal.price,
        wasPrice: deal.wasPrice,
        multiBuy: deal.multiBuy,
        sizeQty: deal.sizeQty,
        source: "flyer",
      });
    } finally {
      setBusyDealId(null);
    }
  };
  const toggleCategory = (value: Category) => {
    setCategory((current) => (current === value ? null : value));
  };

  return (
    <div className="flex flex-col gap-7 px-5 py-6">
      <div className="flex items-center gap-3">
        <Penny mood="idle" size={72} />
        <SpeechBubble className="flex-1">What are we checking today?</SpeechBubble>
      </div>
      <div className="flex flex-col gap-3">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search milk, eggs, flour..."
          autoFocus={autoFocusSearch}
        />
        <LinkButton to="/scan" fullWidth leftIcon={<Scan size={22} weight="bold" />}>
          Scan a price tag
        </LinkButton>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              selected={category === c.value}
              onClick={() => toggleCategory(c.value)}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </div>
      {isSearching ? (
        <div className="flex flex-col gap-3" aria-live="polite">
          {search.isPending && (
            <>
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </>
          )}
          {search.isError && (
            <div className="flex flex-col items-start gap-2">
              <p className="text-small text-ink-soft">Couldn&apos;t search right now.</p>
              <Button variant="ghost" size="md" onClick={() => void search.refetch()}>
                Try again
              </Button>
            </div>
          )}
          {search.data && search.data.length === 0 && (
            <EmptyState
              mood="meh"
              title="Penny doesn't track that yet"
              body="We cover a growing list of everyday groceries. Try milk, eggs, flour, or bananas."
            />
          )}
          {search.data?.map((item) => (
            <ItemRow key={item.id} item={item} onClick={() => navigate(`/check/${item.id}`)} />
          ))}
        </div>
      ) : (
        <>
          <Section title="Flyer deals to check">
            {featured.isPending && (
              <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2">
                <Skeleton className="h-[300px] w-[220px] shrink-0 rounded-md" />
                <Skeleton className="h-[300px] w-[220px] shrink-0 rounded-md" />
                <Skeleton className="h-[300px] w-[220px] shrink-0 rounded-md" />
              </div>
            )}
            {featured.isError && (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-small text-ink-soft">Couldn&apos;t load flyer deals.</p>
                <Button variant="ghost" size="md" onClick={() => void featured.refetch()}>
                  Try again
                </Button>
              </div>
            )}
            {featured.data && featured.data.length === 0 && (
              <p className="text-small text-ink-soft">No flyer deals right now.</p>
            )}
            {featured.data && featured.data.length > 0 && (
              <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2">
                {featured.data.map((deal) => (
                  <FlyerDealCard
                    key={deal.id}
                    deal={deal}
                    loading={busyDealId === deal.id}
                    onCheck={handleCheckDeal}
                    className="snap-start"
                  />
                ))}
              </div>
            )}
          </Section>
          <Section
            title="Your recent checks"
            action={
              recent.length > 0 ? (
                <Button variant="ghost" size="md" onClick={() => setClearOpen(true)}>
                  Clear
                </Button>
              ) : undefined
            }
          >
            {recent.length === 0 ? (
              <EmptyState
                mood="idle"
                title="No checks yet"
                body="Pick a flyer deal above or scan a tag."
                className="px-4 py-4"
              />
            ) : (
              <div className="flex flex-col gap-3">
                {recent.map((check) => (
                  <ItemRow
                    key={check.checkId}
                    item={check.item}
                    onClick={() => navigate(`/reveal/${check.checkId}`)}
                    right={
                      <span className="flex shrink-0 flex-col items-end gap-1.5">
                        <VerdictBadge tier={check.tier} size="sm" />
                        <PriceText amount={check.input.price} size="sm" />
                      </span>
                    }
                  />
                ))}
              </div>
            )}
          </Section>
          <DataFreshness compact />
        </>
      )}
      <Sheet open={clearOpen} onClose={() => setClearOpen(false)} title="Clear your recent checks?">
        <div className="flex flex-col gap-3">
          <Button
            variant="high"
            fullWidth
            onClick={() => {
              clearChecks();
              setClearOpen(false);
            }}
          >
            Clear checks
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setClearOpen(false)}>
            Keep them
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
