import { cn } from "@/lib/cn";
import { BRAND_NAME } from "@/lib/brand";
import { PennyFace } from "./PennyFace";

export interface LogoProps {
  size?: "sm" | "md" | "lg";
  onDark?: boolean;
  className?: string;
}

const SIZES = {
  sm: { face: 24, text: "text-[18px]" },
  md: { face: 32, text: "text-[24px]" },
  lg: { face: 44, text: "text-[36px]" },
} as const;

export function Logo({ size = "md", onDark = false, className }: LogoProps) {
  const { face, text } = SIZES[size];
  const dIndex = BRAND_NAME.indexOf("D");
  const beforeD = dIndex !== -1 ? BRAND_NAME.slice(0, dIndex) : BRAND_NAME;
  const afterD = dIndex !== -1 ? BRAND_NAME.slice(dIndex + 1) : "";

  return (
    <span
      role="img"
      aria-label={BRAND_NAME}
      className={cn(
        "inline-flex items-center gap-2 font-display font-bold select-none",
        text,
        onDark ? "text-white" : "text-ink",
        className,
      )}
    >
      <span aria-hidden="true" className="inline-flex shrink-0 leading-none">
        <PennyFace size={face} />
      </span>
      <span aria-hidden="true" className="tracking-[-0.01em] leading-none">
        {dIndex !== -1 ? (
          <>
            {beforeD}
            <span className="relative -top-[1px] inline-block">D</span>
            {afterD}
          </>
        ) : (
          BRAND_NAME
        )}
      </span>
    </span>
  );
}