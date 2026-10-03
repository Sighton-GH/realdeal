import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { IconButton } from "@/components/ui";
import { Logo } from "@/components/penny";
import { useAppStore } from "@/store/useAppStore";

export interface TopBarProps { title?: string; back?: boolean; right?: ReactNode }

export function TopBar({ title, back, right }: TopBarProps) {
  const navigate = useNavigate();
  const soundOn = useAppStore((state) => state.soundOn);
  const toggleSound = useAppStore((state) => state.toggleSound);

  function goBack() {
    // BrowserRouter's index counts app entries, unlike history.length (which
    // can include unrelated sites). A direct entry needs a safe in-app exit.
    const index: unknown = window.history.state?.idx;
    if (typeof index === "number" && index > 0) navigate(-1);
    else navigate("/check", { replace: true });
  }

  return (
    <header className="z-30 h-[calc(56px+env(safe-area-inset-top,0px))] shrink-0 border-b-2 border-line bg-canvas px-2 pt-[env(safe-area-inset-top,0px)] md:h-14 md:pt-0">
      <div className="grid h-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center">
        <div className="flex min-w-0 items-center">
          {back ? (
            <IconButton label="Back" size={48} icon={<ArrowLeft size={24} weight="bold" aria-hidden="true" />} onClick={goBack} />
          ) : (
            <Link to="/check" aria-label="RealDeal home" className="inline-flex min-h-12 items-center rounded-sm px-2">
              <Logo size="sm" />
            </Link>
          )}
        </div>
        <div className="min-w-0 truncate text-center font-display text-[18px] font-semibold" title={title}>{title}</div>
        <div className="flex min-w-0 items-center justify-end">
          {right ?? (
            <IconButton
              size={48}
              label={soundOn ? "Turn sound off" : "Turn sound on"}
              icon={soundOn ? <SpeakerHigh size={24} weight="bold" aria-hidden="true" /> : <SpeakerSlash size={24} weight="bold" aria-hidden="true" />}
              onClick={toggleSound}
            />
          )}
        </div>
      </div>
    </header>
  );
}
