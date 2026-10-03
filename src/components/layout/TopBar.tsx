// STUB (SPEC-00). UI-07 replaces; props are final.
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { IconButton } from "@/components/ui";
import { Logo } from "@/components/penny";
import { useAppStore } from "@/store/useAppStore";

export interface TopBarProps { title?: string; back?: boolean; right?: ReactNode }

export function TopBar({ title, back, right }: TopBarProps) {
  const navigate = useNavigate();
  const soundOn = useAppStore((s) => s.soundOn);
  const toggleSound = useAppStore((s) => s.toggleSound);
  return (
    <header className="sticky top-0 z-30 grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b-2 border-line bg-canvas px-2">
      <div className="flex items-center">
        {back ? (
          <IconButton label="Back" icon={<ArrowLeft size={24} weight="bold" />} onClick={() => navigate(-1)} />
        ) : (
          <Link to="/check" className="px-2"><Logo size="sm" /></Link>
        )}
      </div>
      <div className="truncate font-display text-[18px] font-semibold">{title}</div>
      <div className="flex justify-end">
        {right ?? (
          <IconButton
            label={soundOn ? "Turn sound off" : "Turn sound on"}
            icon={soundOn ? <SpeakerHigh size={24} weight="bold" /> : <SpeakerSlash size={24} weight="bold" />}
            onClick={toggleSound}
          />
        )}
      </div>
    </header>
  );
}
