const SPOTS = [
  { top: "14%", left: "12%", size: 28 },
  { top: "22%", left: "80%", size: 20 },
  { top: "44%", left: "6%", size: 18 },
  { top: "50%", left: "88%", size: 26 },
  { top: "72%", left: "18%", size: 22 },
  { top: "76%", left: "74%", size: 30 },
];

/** Static 4-point stars used instead of confetti when motion is reduced. */
export function Stars() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {SPOTS.map((s) => (
        <svg
          key={`${s.top}-${s.left}`}
          viewBox="0 0 24 24"
          width={s.size}
          height={s.size}
          className="absolute text-white/40"
          style={{ top: s.top, left: s.left }}
        >
          <path fill="currentColor" d="M12 0 14.5 9.5 24 12 14.5 14.5 12 24 9.5 14.5 0 12 9.5 9.5Z" />
        </svg>
      ))}
    </div>
  );
}
