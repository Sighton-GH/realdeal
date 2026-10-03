import { Link } from "react-router";
import { Logo } from "@/components/penny";

export function LandingFooter() {
  return (
    <footer className="border-t-2 border-line">
      <div className="mx-auto flex max-w-[1120px] flex-col items-start gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between">
        <Logo size="sm" />
        <p className="text-small text-ink-soft">Built at StormHacks 2026 at SFU.</p>
        <Link to="/check" className="inline-flex min-h-12 items-center rounded-sm font-display text-body font-semibold text-grape-500 underline underline-offset-4">
          Check a price
        </Link>
      </div>
    </footer>
  );
}
