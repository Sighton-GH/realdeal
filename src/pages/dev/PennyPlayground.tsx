import { useState } from "react";
import type { ArtKey } from "@shared/types";
import { useTopBar } from "@/components/layout";
import { Penny, PennyFace, Logo, type PennyMood } from "@/components/penny";
import { ItemArt } from "@/components/art";
import { Chip, Section } from "@/components/ui";

const ALL_MOODS: PennyMood[] = [
  "idle",
  "wave",
  "thinking",
  "happy",
  "celebrate",
  "meh",
  "suspicious",
  "shocked",
  "sad",
];

const ALL_ART_KEYS: ArtKey[] = [
  "milk",
  "eggs",
  "butter",
  "cheese",
  "yogurt",
  "sourcream",
  "flour",
  "bread",
  "bagel",
  "sugar",
  "oats",
  "pasta",
  "rice",
  "oil",
  "jar",
  "can",
  "carton",
  "banana",
  "apple",
  "carrot",
  "potato",
  "onion",
  "tomato",
  "lettuce",
  "berries",
  "broccoli",
  "cucumber",
  "avocado",
  "generic",
];

export function PennyPlayground() {
  useTopBar({ title: "Penny playground", back: true });
  const [currentMood, setCurrentMood] = useState<PennyMood>("idle");

  return (
    <div className="flex flex-col gap-8 px-5 py-6 pb-20">
      {/* 1. Interactive Penny Mascot */}
      <Section title="Interactive Mascot">
        <div className="lifted flex flex-col items-center justify-center rounded-lg bg-canvas p-6">
          <Penny mood={currentMood} size={240} />
          <span className="mt-3 font-display text-h3 text-ink">
            Penny is feeling <span className="text-grape-500">{currentMood}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {ALL_MOODS.map((mood) => (
            <Chip
              key={mood}
              selected={currentMood === mood}
              onClick={() => setCurrentMood(mood)}
            >
              {mood}
            </Chip>
          ))}
        </div>
      </Section>

      {/* 2. All 9 Moods on White Panel */}
      <Section title="All 9 Moods (White Background)">
        <div className="grid grid-cols-2 gap-4 place-items-center sm:grid-cols-3">
          {ALL_MOODS.map((mood) => (
            <div
              key={`white-${mood}`}
              className="flex w-full flex-col items-center gap-2 rounded-md bg-sunken p-3 text-center"
            >
              <Penny mood={mood} size={120} />
              <span className="text-small font-bold text-ink">{mood}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. All 9 Moods on Grape-900 Panel */}
      <Section title="All 9 Moods (Dark Panel)">
        <div className="rounded-lg bg-grape-900 p-4">
          <div className="grid grid-cols-2 gap-4 place-items-center sm:grid-cols-3">
            {ALL_MOODS.map((mood) => (
              <div
                key={`dark-${mood}`}
                className="flex w-full flex-col items-center gap-2 p-3 text-center"
              >
                <Penny mood={mood} size={120} />
                <span className="text-small font-bold text-grape-100">{mood}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 4. PennyFace Variations */}
      <Section title="PennyFace Sizes">
        <div className="flex flex-wrap items-end gap-6 rounded-md bg-sunken p-4">
          <div className="flex flex-col items-center gap-2">
            <PennyFace size={24} mood={currentMood} />
            <span className="text-micro font-bold text-ink-soft">24px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PennyFace size={32} mood={currentMood} />
            <span className="text-micro font-bold text-ink-soft">32px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PennyFace size={48} mood={currentMood} />
            <span className="text-micro font-bold text-ink-soft">48px</span>
          </div>
        </div>
      </Section>

      {/* 5. Logo Wordmark */}
      <Section title="Logo Wordmark">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-md bg-canvas p-4 border-2 border-line">
            <span className="text-micro font-bold text-ink-soft">On White</span>
            <div className="flex flex-col gap-3 items-start">
              <Logo size="sm" />
              <Logo size="md" />
              <Logo size="lg" />
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-md bg-grape-900 p-5">
            <span className="text-micro font-bold text-grape-100">On Dark (grape-900)</span>
            <div className="flex flex-col gap-3 items-start">
              <Logo size="sm" onDark />
              <Logo size="md" onDark />
              <Logo size="lg" onDark />
            </div>
          </div>
        </div>
      </Section>

      {/* 6. ItemArt at 64px with Keys */}
      <Section title="ItemArt (All 29 Keys @ 64px)">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {ALL_ART_KEYS.map((key) => (
            <div
              key={key}
              className="flex flex-col items-center gap-2 rounded-md bg-sunken p-3 text-center"
            >
              <ItemArt artKey={key} size={64} />
              <span className="w-full truncate text-micro font-bold text-ink-soft">
                {key}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* 7. ItemArt at 40px Row */}
      <Section title="ItemArt (40px Row)">
        <div className="flex gap-3 overflow-x-auto rounded-md bg-sunken p-3">
          {ALL_ART_KEYS.map((key) => (
            <div key={`small-${key}`} className="flex shrink-0 flex-col items-center gap-1">
              <ItemArt artKey={key} size={40} />
              <span className="text-[10px] text-ink-soft">{key}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}