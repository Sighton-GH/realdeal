import { useAppStore } from "@/store/useAppStore";

export type SfxName = "tap" | "drumroll" | "slam" | "chaching" | "buzzer" | "pop";
const cache = new Map<SfxName, HTMLAudioElement>();

/** Plays /sfx/<name>.mp3 if sound is on. Silently does nothing on any failure (missing file, autoplay block). */
export function play(name: SfxName): void {
  try {
    if (!useAppStore.getState().soundOn) return;
    let audio = cache.get(name);
    if (!audio) {
      audio = new Audio(`/sfx/${name}.mp3`);
      audio.volume = 0.6;
      cache.set(name, audio);
    }
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  } catch {
    /* ignore */
  }
}
