// STUB (SPEC-00). ART-02 replaces; props are final.
import { cn } from "@/lib/cn";
import { BRAND_NAME } from "@/lib/brand";
import { PennyFace } from "./PennyFace";

export interface LogoProps { size?: "sm" | "md" | "lg"; onDark?: boolean; className?: string }
const dims = { sm: [24, "text-[18px]"], md: [32, "text-[24px]"], lg: [44, "text-[36px]"] } as const;

export function Logo({ size = "md", onDark, className }: LogoProps) {
  const [face, text] = dims[size];
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-bold", text, onDark ? "text-white" : "text-ink", className)}>
      <PennyFace size={face} />
      {BRAND_NAME}
    </span>
  );
}
