import { motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { IconButton, SpeechBubble } from "@/components/ui";
import { Penny } from "@/components/penny";
import type { Rect } from "./captureFrame";
import { GuideFrame } from "./parts/GuideFrame";

export interface ReadingOverlayProps {
  photoUrl: string;
  guide: Rect | null;
  /** true while the scan request is in flight; false keeps the frozen photo for the confirm sheet and failures */
  scanning: boolean;
  onCancel: () => void;
}

/** The frozen photo inside the guide frame, dimmed, with a scan line sweeping while Penny reads the tag. */
export function ReadingOverlay({ photoUrl, guide, scanning, onCancel }: ReadingOverlayProps) {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-0 z-20 bg-ink">
      {guide && (
        <>
          <div
            className="absolute overflow-hidden rounded-lg bg-ink"
            style={{ left: guide.x, top: guide.y, width: guide.width, height: guide.height }}
          >
            <img src={photoUrl} alt="The photo Penny is reading" className="size-full object-contain opacity-70" />
            {scanning && !reduce && (
              <motion.div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-grape-400"
                animate={{ y: [0, guide.height - 4] }}
                transition={{ duration: 1.4, ease: "linear", repeat: Infinity, repeatType: "loop" }}
              />
            )}
          </div>
          <GuideFrame rect={guide} />
        </>
      )}
      <div className="absolute inset-x-0 top-0 flex h-14 items-center px-2">
        <IconButton label="Cancel" icon={<X size={24} weight="bold" />} onClick={onCancel} className="text-white hover:bg-white/15" />
      </div>
      {scanning && guide && (
        <div className="absolute flex items-center gap-2" style={{ left: guide.x, top: guide.y + guide.height + 12, width: guide.width }} role="status">
          <Penny mood="thinking" size={72} />
          <SpeechBubble tail="left">Reading the tag…</SpeechBubble>
        </div>
      )}
    </div>
  );
}
