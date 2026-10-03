import type { ArtDrawing, ArtSet } from "./types";

const MilkDrawing: ArtDrawing = () => (
  <g id="art-milk">
    {/* Gable top carton body */}
    <rect x="20" y="26" width="14" height="27" rx="3" fill="#FFFFFF" />
    <rect x="34" y="26" width="10" height="27" rx="3" fill="#D6CFE3" />
    {/* Blue brand banner across middle */}
    <rect x="20" y="35" width="14" height="10" fill="#1890E0" />
    <rect x="34" y="35" width="10" height="10" fill="#0E6DAD" />
    {/* Milk drop emblem on upper front */}
    <path d="M 27 31 C 25.5 31 24.8 30 27 27 C 29.2 30 28.5 31 27 31 Z" fill="#1890E0" />
    {/* Sloped roof shoulders */}
    <polygon points="20,26 34,26 31,18 22,18" fill="#E1F1FC" />
    <polygon points="34,26 44,26 39,18 31,18" fill="#D6CFE3" />
    {/* Top ridge / crimped fin */}
    <rect x="22" y="13" width="9" height="5" rx="1" fill="#FFFFFF" />
    <rect x="31" y="13" width="8" height="5" rx="1" fill="#D6CFE3" />
    {/* Upper-left highlight on blue band */}
    <rect x="22" y="37" width="4" height="3" rx="1" fill="#E1F1FC" />
  </g>
);

const EggsDrawing: ArtDrawing = () => (
  <g id="art-eggs">
    {/* Open pulp carton back lid */}
    <path d="M 12 36 L 14 18 C 14 15 16 14 19 14 L 45 14 C 48 14 50 15 50 18 L 52 36 Z" fill="#F6F4FA" />
    <path d="M 33 14 L 45 14 C 48 14 50 15 50 18 L 52 36 L 33 36 Z" fill="#D6CFE3" />
    {/* 3 Eggs nestled inside carton */}
    {/* Egg 1 (left) */}
    <ellipse cx="19" cy="33" rx="6.5" ry="8.5" fill="#FFE7B8" />
    <path d="M 19 24.5 C 22.5 24.5 25.5 28 25.5 33 C 25.5 37.7 22.5 41.5 19 41.5 C 20.5 41.5 23 37 23 33 C 23 28 20.5 24.5 19 24.5 Z" fill="#E8C27A" />
    <ellipse cx="17" cy="29" rx="1.5" ry="2.5" fill="#FFFFFF" />
    {/* Egg 2 (middle) */}
    <ellipse cx="32" cy="31" rx="7" ry="9" fill="#FFE7B8" />
    <path d="M 32 22 C 36 22 39 26 39 31 C 39 36 36 40 32 40 C 34 40 36.5 35.5 36.5 31 C 36.5 25.5 34 22 32 22 Z" fill="#E8C27A" />
    <ellipse cx="30" cy="27" rx="1.8" ry="3" fill="#FFFFFF" />
    {/* Egg 3 (right) */}
    <ellipse cx="45" cy="33" rx="6.5" ry="8.5" fill="#FFE7B8" />
    <path d="M 45 24.5 C 48.5 24.5 51.5 28 51.5 33 C 51.5 37.7 48.5 41.5 45 41.5 C 46.5 41.5 49 37 49 33 C 49 28 46.5 24.5 45 24.5 Z" fill="#E8C27A" />
    <ellipse cx="43" cy="29" rx="1.5" ry="2.5" fill="#FFFFFF" />
    {/* Front bottom tray of carton with cup scallops */}
    <path d="M 10 37 C 10 35 12 34 14 34 C 18 34 18 37 23 37 C 27 37 27 34 32 34 C 37 34 37 37 41 37 C 46 37 46 34 50 34 C 52 34 54 35 54 37 L 52 51 C 52 53 50 54 47 54 L 17 54 C 14 54 12 53 12 51 Z" fill="#D6CFE3" />
    <path d="M 32 34 C 37 34 37 37 41 37 C 46 37 46 34 50 34 C 52 34 54 35 54 37 L 52 51 C 52 53 50 54 47 54 L 32 54 Z" fill="#B8AFD0" />
    {/* Front tray highlight */}
    <rect x="14" y="38" width="8" height="3" rx="1.5" fill="#F6F4FA" />
  </g>
);

const ButterDrawing: ArtDrawing = () => (
  <g id="art-butter">
    {/* Top butter surface (perspective) */}
    <polygon points="22,26 46,26 52,21 28,21" fill="#FFF4D1" />
    {/* Front butter brick face */}
    <rect x="22" y="26" width="24" height="27" rx="2" fill="#FFC21A" />
    {/* Right side shade */}
    <polygon points="46,26 52,21 52,48 46,53" fill="#D69A00" />
    <rect x="40" y="26" width="6" height="27" fill="#D69A00" />
    {/* Wrapper folded back on the left */}
    <path d="M 12 53 L 26 53 L 26 28 L 16 33 L 12 53 Z" fill="#F6F4FA" />
    <path d="M 20 53 L 26 53 L 26 28 L 22 40 Z" fill="#D6CFE3" />
    {/* Wrapper foil wing peeling down at front */}
    <polygon points="22,34 32,44 24,47 18,37" fill="#FFFFFF" />
    <polygon points="24,47 32,44 30,53 22,53" fill="#D6CFE3" />
    {/* Butter tablespoon guide marks */}
    <line x1="30" y1="26" x2="30" y2="30" stroke="#D69A00" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="38" y1="26" x2="38" y2="30" stroke="#D69A00" strokeWidth="1.5" strokeLinecap="round" />
    {/* Top highlight */}
    <rect x="25" y="23" width="10" height="2" rx="1" fill="#FFFFFF" />
  </g>
);

const CheeseDrawing: ArtDrawing = () => (
  <g id="art-cheese">
    {/* Top surface of wedge */}
    <polygon points="12,38 44,20 52,26 22,44" fill="#FFF4D1" />
    {/* Front face of wedge */}
    <polygon points="12,38 22,44 52,40 52,50 22,54 12,47" fill="#FFC21A" />
    {/* Right curved rind (shade) */}
    <polygon points="44,20 52,26 52,50 44,44" fill="#D69A00" />
    {/* Swiss cheese holes */}
    {/* Hole on top face */}
    <ellipse cx="32" cy="31" rx="4.5" ry="2.2" fill="#D69A00" />
    <ellipse cx="33" cy="31.5" rx="3.5" ry="1.5" fill="#FFE7B8" />
    {/* Smaller hole on top */}
    <ellipse cx="42" cy="27" rx="2.5" ry="1.2" fill="#D69A00" />
    {/* Hole on front face */}
    <ellipse cx="34" cy="47" rx="3.5" ry="2.5" fill="#D69A00" />
    <ellipse cx="35" cy="47.5" rx="2.5" ry="1.8" fill="#FFC21A" />
    {/* Semi-circular notch on the edge */}
    <path d="M 18 42 A 2.5 2.5 0 0 1 23 44 Z" fill="#D69A00" />
    {/* Upper left shine */}
    <polygon points="16,38 26,32 29,34 19,40" fill="#FFFFFF" opacity="0.6" />
  </g>
);

const YogurtDrawing: ArtDrawing = () => (
  <g id="art-yogurt">
    {/* Tapered tub body */}
    <path d="M 15 27 L 49 27 L 45 53 C 45 53.5 44.5 54 44 54 L 20 54 C 19.5 54 19 53.5 19 53 Z" fill="#FFFFFF" />
    {/* Tub right-side shade */}
    <path d="M 36 27 L 49 27 L 45 53 C 45 53.5 44.5 54 44 54 L 34 54 Z" fill="#D6CFE3" />
    {/* Teal brand banner across tub */}
    <path d="M 16.5 33 L 47.5 33 L 46.2 43 L 17.8 43 Z" fill="#12A89E" />
    <path d="M 35 33 L 47.5 33 L 46.2 43 L 34 43 Z" fill="#0B7F77" />
    {/* White badge on banner */}
    <circle cx="26" cy="38" r="3" fill="#FFFFFF" />
    {/* Wide overhanging lid */}
    <rect x="12" y="21" width="40" height="6" rx="3" fill="#12A89E" />
    <rect x="36" y="21" width="16" height="6" rx="3" fill="#0B7F77" />
    {/* Lid pull tab on left */}
    <polygon points="12,26 8,27 10,30 14,28" fill="#12A89E" />
    {/* Upper-left highlight on lid */}
    <rect x="16" y="22" width="12" height="2" rx="1" fill="#E1F1FC" />
  </g>
);

const SourcreamDrawing: ArtDrawing = () => (
  <g id="art-sourcream">
    {/* Shorter, squat tub body */}
    <path d="M 14 34 L 50 34 L 46 53 C 46 53.5 45.5 54 45 54 L 19 54 C 18.5 54 18 53.5 18 53 Z" fill="#FFFFFF" />
    {/* Right shade */}
    <path d="M 36 34 L 50 34 L 46 53 C 46 53.5 45.5 54 45 54 L 34 54 Z" fill="#D6CFE3" />
    {/* Pink brand banner (distinct colour) */}
    <path d="M 15 39 L 49 39 L 47.8 47 L 16.2 47 Z" fill="#F2428F" />
    <path d="M 35 39 L 49 39 L 47.8 47 L 34 47 Z" fill="#C21F6B" />
    {/* Wide pink lid */}
    <rect x="11" y="27" width="42" height="7" rx="3.5" fill="#F2428F" />
    <rect x="36" y="27" width="17" height="7" rx="3.5" fill="#C21F6B" />
    {/* Lid pull tab */}
    <polygon points="11,32 7,33 9,36 13,34" fill="#F2428F" />
    {/* Upper-left highlight on pink lid */}
    <rect x="15" y="29" width="12" height="2" rx="1" fill="#FFE4E4" />
  </g>
);

const FlourDrawing: ArtDrawing = () => (
  <g id="art-flour">
    {/* Paper sack body */}
    <rect x="16" y="24" width="20" height="29" rx="4" fill="#FFE7B8" />
    <rect x="36" y="24" width="12" height="29" rx="4" fill="#E8C27A" />
    {/* Folded / rolled sack top */}
    <rect x="17" y="16" width="17" height="8" rx="2" fill="#FFE7B8" />
    <rect x="34" y="16" width="13" height="8" rx="2" fill="#E8C27A" />
    {/* Fold line crease */}
    <line x1="17" y1="20" x2="47" y2="20" stroke="#D6CFE3" strokeWidth="1.5" strokeDasharray="3 2" />
    {/* Flour emblem badge on sack front */}
    <circle cx="28" cy="38" r="6.5" fill="#FFFFFF" />
    <path d="M 28 34 L 28 42 M 26 36 L 28 38 L 30 36 M 26 39 L 28 41 L 30 39" stroke="#1890E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Upper-left soft highlight */}
    <rect x="19" y="26" width="6" height="3" rx="1.5" fill="#FFF5E0" />
  </g>
);

const BreadDrawing: ArtDrawing = () => (
  <g id="art-bread">
    {/* Domed bread loaf crust */}
    <path d="M 12 53 C 10 53 10 46 10 42 C 10 26 20 20 32 20 C 44 20 54 26 54 42 C 54 46 54 53 52 53 Z" fill="#FF7A1A" />
    {/* Lower right crust shade */}
    <path d="M 32 20 C 44 20 54 26 54 42 C 54 46 54 53 52 53 L 34 53 C 44 51 46 42 46 36 C 46 28 40 22 32 20 Z" fill="#D45A00" />
    {/* Upper-left highlight glow */}
    <path d="M 16 34 C 16 26 22 22 28 22 C 26 22 20 26 20 34 Z" fill="#FFE7B8" opacity="0.8" />
    {/* 3 Scored diagonal cuts on top revealing tender crumb */}
    <path d="M 18 29 Q 21 35 24 40" stroke="#FFE7B8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M 28 27 Q 31 34 34 40" stroke="#FFE7B8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M 38 29 Q 41 35 44 40" stroke="#FFE7B8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    {/* Inner shadow in scores */}
    <path d="M 19 30 Q 21.5 35 24 39" stroke="#E8C27A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M 29 28 Q 31.5 34 34 39" stroke="#E8C27A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M 39 30 Q 41.5 35 44 39" stroke="#E8C27A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </g>
);

const BagelDrawing: ArtDrawing = () => (
  <g id="art-bagel">
    {/* Bagel torus with evenodd hole */}
    <path
      fillRule="evenodd"
      d="M 32 24 C 44.15 24 54 30.27 54 38 C 54 45.73 44.15 52 32 52 C 19.85 52 10 45.73 10 38 C 10 30.27 19.85 24 32 24 Z M 32 33.5 C 36 33.5 39 35.5 39 38 C 39 40.5 36 42.5 32 42.5 C 28 42.5 25 40.5 25 38 C 25 35.5 28 33.5 32 33.5 Z"
      fill="#FFC21A"
    />
    {/* Lower right shade crescent */}
    <path
      d="M 32 42.5 C 36 42.5 39 40.5 39 38 C 45 42 49 43 51 43 C 48 49 40.5 52 32 52 C 26 52 20 49.5 17 46 C 22 47 28 44 32 42.5 Z"
      fill="#D69A00"
    />
    {/* Upper-left highlight */}
    <path
      d="M 18 31 C 21 26 26 25 32 25 C 27 25 21 27 17 32 Z"
      fill="#FFF4D1"
    />
    {/* Scattered sesame & poppy seeds */}
    <circle cx="18" cy="33" r="1" fill="#FFFFFF" />
    <circle cx="23" cy="28" r="1.1" fill="#241B35" />
    <circle cx="28" cy="26" r="1" fill="#FFFFFF" />
    <circle cx="36" cy="27" r="1.1" fill="#241B35" />
    <circle cx="43" cy="31" r="1" fill="#FFFFFF" />
    <circle cx="47" cy="37" r="1.1" fill="#241B35" />
    <circle cx="21" cy="42" r="1" fill="#FFFFFF" />
    <circle cx="40" cy="45" r="1.1" fill="#241B35" />
    <circle cx="27" cy="30" r="1.1" fill="#241B35" />
    <circle cx="34" cy="30" r="1" fill="#FFFFFF" />
  </g>
);

const SugarDrawing: ArtDrawing = () => (
  <g id="art-sugar">
    {/* Clean white sugar bag body */}
    <rect x="18" y="22" width="18" height="31" rx="3" fill="#FFFFFF" />
    <rect x="36" y="22" width="10" height="31" rx="3" fill="#D6CFE3" />
    {/* Pinched top pleated ears */}
    <polygon points="18,17 23,22 43,22 48,17 41,20 25,20" fill="#FFFFFF" />
    <polygon points="34,20 41,20 48,17 43,22 34,22" fill="#D6CFE3" />
    {/* Royal blue brand panel */}
    <rect x="21" y="31" width="14" height="13" rx="2" fill="#1890E0" />
    <rect x="35" y="31" width="8" height="13" rx="2" fill="#0E6DAD" />
    {/* Sparkle sugar crystals on panel */}
    <path d="M 28 34 Q 28 37 30.5 37 Q 28 37 28 40 Q 28 37 25.5 37 Q 28 37 28 34 Z" fill="#FFFFFF" />
    <path d="M 34 38 Q 34 40 35.5 40 Q 34 40 34 42 Q 34 40 32.5 40 Q 34 40 34 38 Z" fill="#E1F1FC" />
    {/* Upper-left highlight */}
    <rect x="20" y="24" width="6" height="3" rx="1.5" fill="#F6F4FA" />
  </g>
);

const OatsDrawing: ArtDrawing = () => (
  <g id="art-oats">
    {/* Round canister cylindrical body */}
    <rect x="18" y="22" width="17" height="30" fill="#FFE7B8" />
    <rect x="35" y="22" width="11" height="30" fill="#E8C27A" />
    {/* Blue canister bottom rim */}
    <path d="M 18 50 C 18 52.5 24.3 54 32 54 C 39.7 54 46 52.5 46 50 L 46 52 C 46 53.5 39.7 54.5 32 54.5 C 24.3 54.5 18 53.5 18 52 Z" fill="#1890E0" />
    <path d="M 32 54 C 39.7 54 46 52.5 46 50 L 46 52 C 46 53.5 39.7 54.5 32 54.5 Z" fill="#0E6DAD" />
    {/* Round canister lid */}
    <ellipse cx="32" cy="18" rx="14" ry="4" fill="#0E6DAD" />
    <path d="M 18 18 C 18 20.5 24.3 22.5 32 22.5 C 39.7 22.5 46 20.5 46 18 L 46 21 C 46 23.5 39.7 25.5 32 25.5 C 24.3 25.5 18 23.5 18 21 Z" fill="#1890E0" />
    <path d="M 32 22.5 C 39.7 22.5 46 20.5 46 18 L 46 21 C 46 23.5 39.7 25.5 32 25.5 L 32 22.5 Z" fill="#0E6DAD" />
    {/* Lid highlight */}
    <ellipse cx="27" cy="17" rx="7" ry="1.8" fill="#E1F1FC" opacity="0.7" />
    {/* Central warm orange badge */}
    <ellipse cx="31" cy="37" rx="8" ry="9" fill="#FF7A1A" />
    <path d="M 31 28 C 35.4 28 39 32 39 37 C 39 42 35.4 46 31 46 Z" fill="#D45A00" />
    {/* Stylized oat grains in badge */}
    <ellipse cx="30" cy="34" rx="2" ry="3.5" transform="rotate(-15 30 34)" fill="#FFF4D1" />
    <ellipse cx="32" cy="39" rx="2" ry="3.5" transform="rotate(15 32 39)" fill="#FFF4D1" />
  </g>
);

export const DAIRY_BAKERY_ART: ArtSet = {
  milk: MilkDrawing,
  eggs: EggsDrawing,
  butter: ButterDrawing,
  cheese: CheeseDrawing,
  yogurt: YogurtDrawing,
  sourcream: SourcreamDrawing,
  flour: FlourDrawing,
  bread: BreadDrawing,
  bagel: BagelDrawing,
  sugar: SugarDrawing,
  oats: OatsDrawing,
};