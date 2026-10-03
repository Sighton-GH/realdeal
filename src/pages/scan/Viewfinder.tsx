import { useEffect, useState, type RefObject } from "react";
import { DotsThreeVertical, Flashlight, Image, Keyboard, X } from "@phosphor-icons/react";
import { IconButton, SpeechBubble } from "@/components/ui";
import { Penny } from "@/components/penny";
import type { Rect } from "./captureFrame";
import type { CameraState } from "./useCamera";
import { GuideFrame } from "./parts/GuideFrame";
import { ShutterButton } from "./parts/ShutterButton";

export interface ViewfinderProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  guide: Rect | null;
  torchSupported: boolean;
  torchOn: boolean;
  onToggleTorch: () => void;
  onClose: () => void;
  onShutter: () => void;
  onPickPhoto: () => void;
  onTypeIt: () => void;
  onTrySample: () => void;
  /** the store hint row, rendered above the controls */
  hint: React.ReactNode;
}

const CAMERA_FAILED: CameraState[] = ["denied", "unavailable", "insecure"];

export function Viewfinder({
  videoRef, cameraState, guide, torchSupported, torchOn, onToggleTorch,
  onClose, onShutter, onPickPhoto, onTypeIt, onTrySample, hint,
}: ViewfinderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const failed = CAMERA_FAILED.includes(cameraState);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-hidden
        className={failed ? "hidden" : "absolute inset-0 size-full bg-ink object-cover"}
      />
      {!failed && guide && <GuideFrame rect={guide} />}

      <div className="absolute inset-x-0 top-0 z-10 flex h-14 items-center gap-1 px-2">
        <IconButton label="Close" icon={<X size={24} weight="bold" />} onClick={onClose} className="text-white hover:bg-white/15" />
        <h1 className="flex-1 truncate font-display text-[18px] font-semibold text-white">Scan a price tag</h1>
        {torchSupported && !failed && (
          <IconButton
            label={torchOn ? "Turn torch off" : "Turn torch on"}
            icon={<Flashlight size={24} weight={torchOn ? "fill" : "bold"} />}
            onClick={onToggleTorch}
            className="text-white hover:bg-white/15"
          />
        )}
        <IconButton label="More options" icon={<DotsThreeVertical size={24} weight="bold" />} onClick={() => setMenuOpen((o) => !o)} className="text-white hover:bg-white/15" />
      </div>

      {menuOpen && (
        <>
          <button type="button" aria-label="Close menu" className="absolute inset-0 z-20 cursor-default" onClick={() => setMenuOpen(false)} />
          <div role="menu" className="lifted absolute right-3 top-14 z-20 rounded-md bg-canvas p-1 text-ink">
            <button
              type="button"
              role="menuitem"
              className="min-h-12 w-full rounded-sm px-4 text-left text-body font-extrabold hover:bg-sunken"
              onClick={() => { setMenuOpen(false); onTrySample(); }}
            >
              Try a sample tag
            </button>
          </div>
        </>
      )}

      {!failed && guide && (
        <div className="absolute flex items-center gap-2" style={{ left: guide.x, top: guide.y + guide.height + 12, width: guide.width }}>
          <Penny mood="idle" size={72} />
          <SpeechBubble tail="left">Fit the whole tag inside the box.</SpeechBubble>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {!failed && hint}
        <div className="grid grid-cols-3 items-center px-5">
          <button type="button" onClick={onPickPhoto} className="flex min-h-12 flex-col items-center gap-1 justify-self-start text-small font-extrabold text-white">
            <Image size={28} weight="bold" />
            Photos
          </button>
          <div className="justify-self-center">
            {!failed && <ShutterButton onClick={onShutter} disabled={cameraState !== "live"} />}
          </div>
          <button type="button" onClick={onTypeIt} className="flex min-h-12 flex-col items-center gap-1 justify-self-end text-small font-extrabold text-white">
            <Keyboard size={28} weight="bold" />
            Type it
          </button>
        </div>
      </div>
    </div>
  );
}
