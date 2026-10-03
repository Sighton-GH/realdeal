import type { ArtDrawing, ArtSet } from "./types";

const PastaDrawing: ArtDrawing = () => (
  <g id="art-pasta">
    {/* Spaghetti strands cylinder */}
    <rect x="23" y="16" width="12" height="37" rx="2" fill="#FFE7B8" />
    <rect x="35" y="16" width="8" height="37" rx="2" fill="#E8C27A" />
    {/* Top noodle tips */}
    <line x1="25" y1="16" x2="25" y2="13" stroke="#FFE7B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="29" y1="16" x2="29" y2="12" stroke="#FFE7B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="33" y1="16" x2="33" y2="14" stroke="#FFE7B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="37" y1="16" x2="37" y2="13" stroke="#E8C27A" strokeWidth="2" strokeLinecap="round" />
    <line x1="41" y1="16" x2="41" y2="15" stroke="#E8C27A" strokeWidth="2" strokeLinecap="round" />
    {/* Paper belly band around bundle */}
    <rect x="21" y="31" width="14" height="11" rx="1" fill="#1890E0" />
    <rect x="35" y="31" width="10" height="11" rx="1" fill="#0E6DAD" />
    {/* White badge on band */}
    <rect x="25" y="33" width="8" height="7" rx="1" fill="#FFFFFF" />
    <line x1="27" y1="36.5" x2="31" y2="36.5" stroke="#1890E0" strokeWidth="1.5" strokeLinecap="round" />
    {/* Highlight sheen */}
    <rect x="24" y="20" width="3" height="8" rx="1" fill="#FFFFFF" opacity="0.7" />
  </g>
);

const RiceDrawing: ArtDrawing = () => (
  <g id="art-rice">
    {/* Paper rice bag */}
    <rect x="18" y="20" width="18" height="33" rx="4" fill="#FFFFFF" />
    <rect x="36" y="20" width="10" height="33" rx="4" fill="#D6CFE3" />
    {/* Blue top fold / handle */}
    <rect x="20" y="15" width="15" height="7" rx="2" fill="#1890E0" />
    <rect x="35" y="15" width="9" height="7" rx="2" fill="#0E6DAD" />
    <ellipse cx="32" cy="18.5" rx="4" ry="1.5" fill="#FFFFFF" />
    {/* Clear viewing window showing grains */}
    <ellipse cx="31" cy="38" rx="8" ry="6" fill="#F6F4FA" />
    <ellipse cx="33" cy="38" rx="6" ry="6" fill="#D6CFE3" />
    {/* Individual rice grains inside window */}
    <ellipse cx="28" cy="37" rx="1.5" ry="0.8" transform="rotate(-20 28 37)" fill="#FFFFFF" />
    <ellipse cx="32" cy="35" rx="1.5" ry="0.8" transform="rotate(30 32 35)" fill="#FFFFFF" />
    <ellipse cx="33" cy="39" rx="1.5" ry="0.8" transform="rotate(-10 33 39)" fill="#FFFFFF" />
    <ellipse cx="30" cy="40" rx="1.5" ry="0.8" transform="rotate(45 30 40)" fill="#FFFFFF" />
    {/* Upper left highlight */}
    <rect x="20" y="23" width="5" height="4" rx="1.5" fill="#F6F4FA" />
  </g>
);

const OilDrawing: ArtDrawing = () => (
  <g id="art-oil">
    {/* Bottle body */}
    <rect x="22" y="27" width="14" height="26" rx="4" fill="#FFC21A" />
    <rect x="36" y="27" width="8" height="26" rx="4" fill="#D69A00" />
    {/* Sloped shoulder */}
    <polygon points="22,27 36,27 34,20 28,20" fill="#FFC21A" />
    <polygon points="36,27 44,27 38,20 34,20" fill="#D69A00" />
    {/* Bottle neck */}
    <rect x="28" y="16" width="6" height="5" fill="#FFC21A" />
    <rect x="34" y="16" width="4" height="5" fill="#D69A00" />
    {/* Green cap */}
    <rect x="27" y="12" width="7" height="5" rx="1.5" fill="#22A93F" />
    <rect x="34" y="12" width="5" height="5" rx="1.5" fill="#17802E" />
    {/* Bottle loop handle on right */}
    <path
      fillRule="evenodd"
      d="M 42 24 C 47 24 49 28 49 33 C 49 38 47 41 42 41 L 42 37 C 45 37 46 35 46 33 C 46 30 45 28 42 28 Z"
      fill="#D69A00"
    />
    {/* Label on bottle */}
    <rect x="24" y="34" width="11" height="11" rx="1" fill="#FFFFFF" />
    <rect x="35" y="34" width="5" height="11" rx="1" fill="#D6CFE3" />
    <circle cx="29" cy="39.5" r="2.5" fill="#22A93F" />
    {/* Highlight shine */}
    <rect x="24" y="28" width="3" height="5" rx="1" fill="#FFF4D1" />
  </g>
);

const JarDrawing: ArtDrawing = () => (
  <g id="art-jar">
    {/* Glass jar body with tan contents */}
    <rect x="18" y="25" width="18" height="28" rx="5" fill="#E8C27A" />
    <rect x="36" y="25" width="10" height="28" rx="5" fill="#B88A3E" />
    {/* Paper label across center */}
    <rect x="17" y="32" width="19" height="13" rx="1" fill="#FFFFFF" />
    <rect x="36" y="32" width="11" height="13" rx="1" fill="#D6CFE3" />
    {/* Label fruit/peanut graphic */}
    <circle cx="28" cy="38.5" r="3" fill="#FF7A1A" />
    {/* Glass neck */}
    <rect x="21" y="22" width="15" height="4" fill="#F6F4FA" />
    <rect x="36" y="22" width="7" height="4" fill="#D6CFE3" />
    {/* Gingham / screw lid */}
    <rect x="19" y="16" width="17" height="7" rx="2.5" fill="#F23D3D" />
    <rect x="36" y="16" width="11" height="7" rx="2.5" fill="#C22424" />
    {/* Lid highlight */}
    <rect x="22" y="18" width="8" height="2" rx="1" fill="#FFE4E4" />
    {/* Glass shoulder shine */}
    <rect x="20" y="26" width="4" height="4" rx="1" fill="#FFE7B8" />
  </g>
);

const CanDrawing: ArtDrawing = () => (
  <g id="art-can">
    {/* Tin can metal cylinder */}
    <rect x="19" y="22" width="17" height="31" fill="#D6CFE3" />
    <rect x="36" y="22" width="9" height="31" fill="#B8AFD0" />
    {/* Metal top rim & lid */}
    <ellipse cx="32" cy="20" rx="13" ry="4" fill="#D6CFE3" />
    <ellipse cx="32" cy="19.5" rx="11" ry="3" fill="#F6F4FA" />
    <ellipse cx="32" cy="19" rx="3.5" ry="1.2" fill="#D6CFE3" />
    {/* Red label band */}
    <rect x="19" y="24" width="17" height="24" fill="#F23D3D" />
    <rect x="36" y="24" width="9" height="24" fill="#C22424" />
    {/* Label center badge */}
    <circle cx="29" cy="36" r="6" fill="#FFFFFF" />
    <circle cx="29" cy="36" r="3" fill="#FFC21A" />
    {/* Bottom metal rim */}
    <path d="M 19 50 C 19 52.5 24.8 54 32 54 C 39.2 54 45 52.5 45 50 L 45 52 C 45 53.5 39.2 54.5 32 54.5 C 24.8 54.5 19 53.5 19 52 Z" fill="#D6CFE3" />
    {/* Vertical highlight on label */}
    <rect x="21" y="25" width="3" height="22" rx="1" fill="#FFE4E4" opacity="0.7" />
  </g>
);

const CartonDrawing: ArtDrawing = () => (
  <g id="art-carton">
    {/* Tetra Brik broth carton body */}
    <rect x="20" y="20" width="16" height="33" rx="2" fill="#E8C27A" />
    <rect x="36" y="20" width="9" height="33" rx="2" fill="#B88A3E" />
    {/* Slanted flat top (aseptic carton roof) */}
    <polygon points="20,20 33,16 45,18 36,21" fill="#FFE7B8" />
    <polygon points="33,16 45,18 45,20 36,21" fill="#D6CFE3" />
    {/* Plastic screw cap on top */}
    <rect x="24" y="13" width="7" height="5" rx="1.5" fill="#F23D3D" />
    <rect x="31" y="13" width="3" height="5" rx="1.5" fill="#C22424" />
    {/* Brand band on front */}
    <rect x="20" y="28" width="16" height="12" fill="#D45A00" />
    <rect x="36" y="28" width="9" height="12" fill="#9E3B00" />
    {/* Broth bowl icon on band */}
    <ellipse cx="28" cy="35" rx="4" ry="2.5" fill="#FFFFFF" />
    <path d="M 24 35 C 24 37.5 25.8 39 28 39 C 30.2 39 32 37.5 32 35 Z" fill="#FFFFFF" />
    {/* Upper left highlight */}
    <rect x="22" y="22" width="4" height="4" rx="1" fill="#FFF5E0" />
  </g>
);

const BananaDrawing: ArtDrawing = () => (
  <g id="art-banana">
    {/* Bunch of 3 bananas */}
    {/* Banana 1 (left) */}
    <path d="M 32 18 C 22 22 14 31 15 45 C 16 49 19 47 20 44 C 21 34 27 26 34 20 Z" fill="#FFD43B" />
    <path d="M 15 45 C 16 49 19 47 20 44 C 19 40 17 38 16 41 Z" fill="#241B35" />
    {/* Banana 3 (right, shaded) */}
    <path d="M 32 18 C 42 22 49 32 48 45 C 47 49 44 47 43 44 C 42 34 37 26 30 20 Z" fill="#E0A800" />
    <path d="M 48 45 C 47 49 44 47 43 44 C 44 40 46 38 47 41 Z" fill="#241B35" />
    {/* Banana 2 (center front) */}
    <path d="M 32 18 C 30 28 30 38 33 53 C 35 54 36 51 36 49 C 36 37 38 27 34 18 Z" fill="#FFD43B" />
    <path d="M 33 53 C 35 54 36 51 36 49 Z" fill="#241B35" />
    {/* Banana ridge shade */}
    <path d="M 33 22 C 34 31 34 40 36 49 C 36 37 38 27 34 18 Z" fill="#E0A800" />
    {/* Stem top crown */}
    <rect x="29" y="14" width="7" height="6" rx="2" fill="#17802E" />
    <rect x="33" y="14" width="3" height="6" rx="1.5" fill="#241B35" />
    {/* Highlight shine */}
    <path d="M 23 26 C 20 31 18 36 18 40" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </g>
);

const AppleDrawing: ArtDrawing = () => (
  <g id="art-apple">
    {/* Round apple body */}
    <path
      d="M 32 24 C 27 22 17 22 14 30 C 11 38 15 52 24 53 C 28 53.5 30 51 32 51 C 34 51 36 53.5 40 53 C 49 52 53 38 50 30 C 47 22 37 22 32 24 Z"
      fill="#F23D3D"
    />
    {/* Right side shade */}
    <path
      d="M 32 24 C 37 22 47 22 50 30 C 53 38 49 52 40 53 C 36 53.5 34 51 32 51 L 32 24 Z"
      fill="#C22424"
    />
    {/* Apple stem */}
    <path d="M 32 24 C 32 19 30 15 28 13" stroke="#241B35" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Green leaf */}
    <path d="M 32 18 C 36 14 42 15 43 18 C 42 22 36 21 32 18 Z" fill="#22A93F" />
    <path d="M 37 18 C 40 18 42 20 43 18 Z" fill="#17802E" />
    {/* Upper left highlight */}
    <ellipse cx="21" cy="30" rx="3.5" ry="5" transform="rotate(-25 21 30)" fill="#FFE4E4" />
  </g>
);

const CarrotDrawing: ArtDrawing = () => (
  <g id="art-carrot">
    {/* Leafy green top fronds */}
    <path d="M 32 26 C 28 18 22 14 18 13 C 20 18 24 22 30 27 Z" fill="#7CD68B" />
    <path d="M 32 26 C 32 17 32 12 32 10 C 34 14 34 19 33 26 Z" fill="#22A93F" />
    <path d="M 32 26 C 36 18 42 14 46 13 C 44 18 40 22 34 27 Z" fill="#17802E" />
    {/* Tapered carrot body */}
    <path
      d="M 23 27 C 23 25 41 25 41 27 C 41 33 34 51 32 54 C 30 51 23 33 23 27 Z"
      fill="#FF7A1A"
    />
    {/* Right side shade */}
    <path
      d="M 32 26 C 36 26 41 25 41 27 C 41 33 34 51 32 54 Z"
      fill="#D45A00"
    />
    {/* Carrot horizontal ridges */}
    <line x1="26" y1="32" x2="31" y2="32" stroke="#FFB37D" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="33" y1="35" x2="38" y2="35" stroke="#D45A00" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="28" y1="41" x2="34" y2="41" stroke="#D45A00" strokeWidth="1.5" strokeLinecap="round" />
    {/* Upper left highlight */}
    <rect x="25" y="27" width="4" height="6" rx="2" fill="#FFB37D" />
  </g>
);

const PotatoDrawing: ArtDrawing = () => (
  <g id="art-potato">
    {/* Organic russet potato body */}
    <path
      d="M 19 32 C 14 39 16 47 24 51 C 33 55 45 53 50 46 C 54 40 51 31 43 27 C 34 23 24 25 19 32 Z"
      fill="#E8C27A"
    />
    {/* Lower right shade */}
    <path
      d="M 32 25 C 41 25 51 31 50 46 C 45 53 33 55 24 51 C 32 51 44 46 45 37 C 46 30 40 26 32 25 Z"
      fill="#B88A3E"
    />
    {/* Potato eyes / dimples */}
    <ellipse cx="25" cy="33" rx="2" ry="1.2" transform="rotate(-15 25 33)" fill="#B88A3E" />
    <ellipse cx="37" cy="34" rx="2" ry="1" transform="rotate(20 37 34)" fill="#B88A3E" />
    <ellipse cx="31" cy="44" rx="2.5" ry="1.2" transform="rotate(-10 31 44)" fill="#B88A3E" />
    <ellipse cx="43" cy="43" rx="1.8" ry="1" transform="rotate(15 43 43)" fill="#B88A3E" />
    {/* Upper-left highlight */}
    <ellipse cx="25" cy="28" rx="4" ry="2.5" transform="rotate(-15 25 28)" fill="#FFE7B8" />
  </g>
);

const OnionDrawing: ArtDrawing = () => (
  <g id="art-onion">
    {/* Purple red onion bulb */}
    <path
      d="M 32 18 C 30 23 16 26 16 38 C 16 47 23 52 32 52 C 41 52 48 47 48 38 C 48 26 34 23 32 18 Z"
      fill="#8A5CF6"
    />
    {/* Right side bulb shade */}
    <path
      d="M 32 18 C 34 23 48 26 48 38 C 48 47 41 52 32 52 Z"
      fill="#6337D6"
    />
    {/* Top neck sprout */}
    <polygon points="30,14 34,14 33,20 31,20" fill="#8A5CF6" />
    <polygon points="32,14 34,14 33,20 32,20" fill="#6337D6" />
    {/* Vertical skin stripe lines */}
    <path d="M 32 20 Q 24 33 24 45" stroke="#E2D8FF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
    <path d="M 32 20 Q 40 33 40 45" stroke="#4A21B0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Bottom root tuft */}
    <line x1="31" y1="52" x2="30" y2="54" stroke="#FFE7B8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="33" y1="52" x2="34" y2="54" stroke="#FFE7B8" strokeWidth="1.5" strokeLinecap="round" />
    {/* Highlight shine */}
    <ellipse cx="22" cy="33" rx="2.5" ry="4" transform="rotate(-20 22 33)" fill="#E2D8FF" />
  </g>
);

const TomatoDrawing: ArtDrawing = () => (
  <g id="art-tomato">
    {/* Plump round red tomato */}
    <ellipse cx="32" cy="38" rx="17" ry="15" fill="#F23D3D" />
    {/* Right side shade */}
    <path d="M 32 23 C 41.4 23 49 29.7 49 38 C 49 46.3 41.4 53 32 53 Z" fill="#C22424" />
    {/* 5-pointed star stem calyx */}
    {/* Stem stick */}
    <path d="M 32 23 C 32 18 34 16 35 15" stroke="#17802E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Star leaves */}
    <polygon points="32,23 24,20 27,24" fill="#22A93F" />
    <polygon points="32,23 27,27 30,28" fill="#22A93F" />
    <polygon points="32,23 37,27 34,28" fill="#17802E" />
    <polygon points="32,23 40,20 37,24" fill="#17802E" />
    <polygon points="32,23 32,17 30,20" fill="#22A93F" />
    {/* Glossy curved highlight on upper left */}
    <ellipse cx="23" cy="31" rx="4" ry="2.5" transform="rotate(-30 23 31)" fill="#FFE4E4" />
  </g>
);

const LettuceDrawing: ArtDrawing = () => (
  <g id="art-lettuce">
    {/* Crisp romaine lettuce heart */}
    {/* Outer dark leaves (behind) */}
    <path d="M 24 50 C 18 42 15 28 19 16 C 24 22 28 32 30 50 Z" fill="#17802E" />
    <path d="M 40 50 C 46 42 49 28 45 16 C 40 22 36 32 34 50 Z" fill="#17802E" />
    {/* Main center upright leaves */}
    <path d="M 26 52 C 20 40 20 24 27 14 C 33 22 34 38 33 52 Z" fill="#22A93F" />
    <path d="M 38 52 C 44 40 44 24 37 14 C 33 22 32 38 33 52 Z" fill="#17802E" />
    {/* Center tender heart leaf */}
    <path d="M 28 53 C 24 44 25 32 32 20 C 39 32 40 44 36 53 Z" fill="#7CD68B" />
    {/* Crisp white rib at base */}
    <path d="M 30 54 C 29 45 30 38 32 34 C 34 38 35 45 34 54 Z" fill="#F6F4FA" />
    {/* Lower stem base */}
    <rect x="28" y="50" width="8" height="4" rx="2" fill="#E6E1EF" />
  </g>
);

const BerriesDrawing: ArtDrawing = () => (
  <g id="art-berries">
    {/* Strawberry heart/cone body */}
    <path
      d="M 20 25 C 14 28 14 36 18 43 C 22 49 29 53 32 54 C 35 53 42 49 46 43 C 50 36 50 28 44 25 C 38 23 26 23 20 25 Z"
      fill="#F23D3D"
    />
    {/* Right side shade */}
    <path
      d="M 32 23 C 38 23 44 25 44 25 C 50 28 50 36 46 43 C 42 49 35 53 32 54 Z"
      fill="#C22424"
    />
    {/* Green leafy cap */}
    <path d="M 32 23 C 32 18 31 15 31 13" stroke="#17802E" strokeWidth="2" strokeLinecap="round" fill="none" />
    <polygon points="32,23 22,23 26,26" fill="#22A93F" />
    <polygon points="32,23 27,27 30,28" fill="#22A93F" />
    <polygon points="32,23 37,27 34,28" fill="#17802E" />
    <polygon points="32,23 42,23 38,26" fill="#17802E" />
    {/* Yellow seed specks */}
    <circle cx="24" cy="30" r="0.9" fill="#FFD43B" />
    <circle cx="31" cy="28" r="0.9" fill="#FFD43B" />
    <circle cx="21" cy="36" r="0.9" fill="#FFD43B" />
    <circle cx="28" cy="35" r="0.9" fill="#FFD43B" />
    <circle cx="36" cy="33" r="0.9" fill="#FFD43B" />
    <circle cx="25" cy="42" r="0.9" fill="#FFD43B" />
    <circle cx="33" cy="41" r="0.9" fill="#FFD43B" />
    <circle cx="39" cy="40" r="0.9" fill="#FFD43B" />
    <circle cx="30" cy="47" r="0.9" fill="#FFD43B" />
    {/* Upper left highlight */}
    <ellipse cx="23" cy="28" rx="2.5" ry="1.5" transform="rotate(-20 23 28)" fill="#FFE4E4" />
  </g>
);

const BroccoliDrawing: ArtDrawing = () => (
  <g id="art-broccoli">
    {/* Thick stalk at bottom */}
    <path d="M 27 35 L 26 51 C 26 53 28 54 30 54 L 34 54 C 36 54 38 53 38 51 L 37 35 Z" fill="#7CD68B" />
    <path d="M 32 35 L 32 54 L 34 54 C 36 54 38 53 38 51 L 37 35 Z" fill="#22A93F" />
    {/* Dense bumpy floret cloud crown */}
    {/* Background floret lobes */}
    <circle cx="22" cy="28" r="9" fill="#17802E" />
    <circle cx="42" cy="28" r="9" fill="#17802E" />
    <circle cx="32" cy="22" r="10" fill="#17802E" />
    {/* Foreground floret lobes */}
    <circle cx="23" cy="27" r="8" fill="#22A93F" />
    <circle cx="32" cy="22" r="9" fill="#22A93F" />
    <circle cx="41" cy="28" r="8" fill="#17802E" />
    <circle cx="28" cy="32" r="7" fill="#22A93F" />
    <circle cx="36" cy="32" r="7" fill="#17802E" />
    {/* Upper left highlights */}
    <circle cx="22" cy="24" r="3" fill="#7CD68B" />
    <circle cx="30" cy="18" r="3.5" fill="#7CD68B" />
    <circle cx="26" cy="30" r="2" fill="#7CD68B" />
  </g>
);

const CucumberDrawing: ArtDrawing = () => (
  <g id="art-cucumber">
    {/* Cylindrical rounded cucumber */}
    <rect x="22" y="16" width="13" height="37" rx="6.5" fill="#22A93F" />
    <rect x="35" y="16" width="7" height="37" rx="3.5" fill="#17802E" />
    {/* Little stem tip at top */}
    <rect x="29" y="13" width="4" height="4" rx="1.5" fill="#17802E" />
    {/* Pale longitudinal ridge lines */}
    <path d="M 26 20 L 26 48" stroke="#7CD68B" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
    <path d="M 31 18 L 31 50" stroke="#7CD68B" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3" />
    {/* Subtle bumps/dots */}
    <circle cx="25" cy="24" r="1" fill="#7CD68B" />
    <circle cx="30" cy="30" r="1" fill="#7CD68B" />
    <circle cx="24" cy="36" r="1" fill="#7CD68B" />
    <circle cx="29" cy="42" r="1" fill="#7CD68B" />
    {/* Highlight shine on upper left */}
    <rect x="23" y="18" width="3" height="8" rx="1.5" fill="#E2F7E6" opacity="0.7" />
  </g>
);

const AvocadoDrawing: ArtDrawing = () => (
  <g id="art-avocado">
    {/* Dark pebbled outer skin */}
    <path
      d="M 32 14 C 23 14 18 24 16 34 C 14 43 19 54 32 54 C 45 54 50 43 48 34 C 46 24 41 14 32 14 Z"
      fill="#241B35"
    />
    {/* Creamy lime flesh */}
    <path
      d="M 32 16 C 24.5 16 20 25 18 34 C 16.5 42 20.5 52 32 52 C 43.5 52 47.5 42 46 34 C 44 25 39.5 16 32 16 Z"
      fill="#22A93F"
    />
    <path
      d="M 32 18 C 26 18 22 26 20.5 34 C 19 41 22.5 50 32 50 C 41.5 50 45 41 43.5 34 C 42 26 38 18 32 18 Z"
      fill="#7CD68B"
    />
    {/* Round brown pit */}
    <circle cx="32" cy="40" r="8" fill="#B5561F" />
    <path d="M 32 32 C 36.4 32 40 35.6 40 40 C 40 44.4 36.4 48 32 48 Z" fill="#7A2E12" />
    {/* Pit highlight */}
    <ellipse cx="29" cy="37" rx="2" ry="3" transform="rotate(-30 29 37)" fill="#FFB37D" />
    {/* Flesh highlight */}
    <path d="M 27 21 C 24 24 23 27 22 31" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
  </g>
);

const GenericDrawing: ArtDrawing = () => (
  <g id="art-generic">
    {/* Wire handles (behind) */}
    <path d="M 18 26 C 18 15 24 13 32 13 C 40 13 46 15 46 26" stroke="#D6CFE3" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <rect x="29" y="11.5" width="6" height="3" rx="1.5" fill="#241B35" />
    {/* Purple basket body */}
    <polygon points="12,27 52,27 46,53 18,53" fill="#6A3BE4" />
    {/* Right side basket shade */}
    <polygon points="34,27 52,27 46,53 33,53" fill="#4A21B0" />
    {/* Top rolled basket rim */}
    <rect x="10" y="24" width="24" height="5" rx="2.5" fill="#8A63F2" />
    <rect x="34" y="24" width="20" height="5" rx="2.5" fill="#4A21B0" />
    {/* Basket perforations / slats */}
    <rect x="20" y="32" width="5" height="3" rx="1" fill="#4A21B0" />
    <rect x="28" y="32" width="5" height="3" rx="1" fill="#4A21B0" />
    <rect x="36" y="32" width="5" height="3" rx="1" fill="#2B1466" />
    <rect x="43" y="32" width="4" height="3" rx="1" fill="#2B1466" />
    <rect x="22" y="38" width="5" height="3" rx="1" fill="#4A21B0" />
    <rect x="30" y="38" width="5" height="3" rx="1" fill="#4A21B0" />
    <rect x="38" y="38" width="5" height="3" rx="1" fill="#2B1466" />
    <rect x="24" y="44" width="5" height="3" rx="1" fill="#4A21B0" />
    <rect x="32" y="44" width="5" height="3" rx="1" fill="#2B1466" />
    <rect x="39" y="44" width="4" height="3" rx="1" fill="#2B1466" />
    {/* Rim highlight */}
    <rect x="13" y="25" width="10" height="1.5" rx="0.75" fill="#E2D8FF" />
  </g>
);

export const PANTRY_PRODUCE_ART: ArtSet = {
  pasta: PastaDrawing,
  rice: RiceDrawing,
  oil: OilDrawing,
  jar: JarDrawing,
  can: CanDrawing,
  carton: CartonDrawing,
  banana: BananaDrawing,
  apple: AppleDrawing,
  carrot: CarrotDrawing,
  potato: PotatoDrawing,
  onion: OnionDrawing,
  tomato: TomatoDrawing,
  lettuce: LettuceDrawing,
  berries: BerriesDrawing,
  broccoli: BroccoliDrawing,
  cucumber: CucumberDrawing,
  avocado: AvocadoDrawing,
  generic: GenericDrawing,
};
