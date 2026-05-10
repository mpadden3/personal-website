/**
 * PnwBackdrop — decorative Pacific Northwest landscape used as a hero backdrop.
 * Single forest-teal color at low opacity. Hand-drawn-feel SVG: Space Needle and
 * downtown skyline on the left, Mt. Rainier in the center, pine trees on the
 * right, with a few falling-rain hints on the upper left.
 */
export function PnwBackdrop({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 480"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Subtle ground line */}
      <path d="M 0 470 L 1600 470" strokeWidth="1.2" opacity="0.45" />

      {/* Rain ticks (top-left, hint of Seattle weather) */}
      <g strokeWidth="1.3" opacity="0.45">
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 30 + i * 22;
          const y = 30 + (i % 3) * 18;
          return <path key={i} d={`M ${x} ${y} l -7 18`} />;
        })}
      </g>

      {/* MOUNTAINS — back layer (faint distant range) */}
      <g strokeWidth="1.4" opacity="0.35">
        <path d="M 350 470 L 520 320 L 600 380 L 720 260 L 840 360 L 940 300 L 1080 400 L 1180 350 L 1320 410 L 1450 370 L 1600 410" />
      </g>

      {/* MT. RAINIER — center, prominent */}
      <g strokeWidth="1.7">
        {/* Outer mountain silhouette */}
        <path d="M 540 470 L 660 360 L 720 320 L 770 240 L 820 180 L 880 230 L 930 290 L 990 360 L 1080 470" />
        {/* Snow line ridges */}
        <g opacity="0.8" strokeWidth="1.3">
          <path d="M 720 320 L 760 320 L 770 305 L 800 305 L 815 290" />
          <path d="M 820 180 L 845 200 L 880 200 L 900 220" />
          <path d="M 760 270 L 790 280 L 810 270" />
          <path d="M 845 245 L 870 260 L 895 248" />
        </g>
        {/* Subtle fill in the lower mountain */}
        <path
          d="M 540 470 L 660 360 L 720 320 L 770 240 L 820 180 L 880 230 L 930 290 L 990 360 L 1080 470 Z"
          fill="currentColor"
          fillOpacity="0.05"
          stroke="none"
        />
      </g>

      {/* SECONDARY PEAKS — left of Rainier */}
      <g strokeWidth="1.4" opacity="0.55">
        <path d="M 380 470 L 460 380 L 510 410 L 560 350 L 620 410 L 680 380" />
      </g>

      {/* SEATTLE SKYLINE — downtown buildings, left foreground */}
      <g strokeWidth="1.4">
        {/* Buildings as thin rectangles */}
        <rect x="170" y="380" width="22" height="90" />
        <rect x="195" y="350" width="28" height="120" />
        <rect x="226" y="360" width="20" height="110" />
        <rect x="249" y="330" width="34" height="140" />
        {/* slightly taller skyscraper */}
        <path d="M 286 470 L 286 290 L 308 290 L 308 470 Z" />
        <rect x="312" y="345" width="22" height="125" />
        <rect x="337" y="375" width="18" height="95" />

        {/* Building details — windows hinted as horizontal lines */}
        <g opacity="0.5" strokeWidth="0.9">
          <path d="M 196 380 L 222 380" />
          <path d="M 196 410 L 222 410" />
          <path d="M 196 440 L 222 440" />
          <path d="M 252 360 L 281 360" />
          <path d="M 252 400 L 281 400" />
          <path d="M 252 440 L 281 440" />
          <path d="M 288 320 L 306 320" />
          <path d="M 288 360 L 306 360" />
          <path d="M 288 400 L 306 400" />
          <path d="M 288 440 L 306 440" />
        </g>
      </g>

      {/* SPACE NEEDLE — left of skyline, iconic */}
      <g strokeWidth="1.6">
        {/* Base — splayed legs */}
        <path d="M 95 470 L 110 380" />
        <path d="M 145 470 L 130 380" />
        {/* Mid column */}
        <path d="M 113 380 L 116 240" />
        <path d="M 127 380 L 124 240" />
        {/* Cross hatch on column */}
        <g opacity="0.45" strokeWidth="0.9">
          <path d="M 116 320 L 124 320" />
          <path d="M 116 290 L 124 290" />
          <path d="M 116 260 L 124 260" />
        </g>
        {/* Saucer top — disc shape */}
        <path d="M 90 240 Q 120 218 150 240 Q 120 252 90 240 Z" />
        <path d="M 102 240 L 102 220" opacity="0.55" />
        <path d="M 138 240 L 138 220" opacity="0.55" />
        {/* Antenna spike */}
        <path d="M 120 218 L 120 175" />
        <circle cx="120" cy="175" r="2.5" fill="currentColor" stroke="none" />
      </g>

      {/* PINE TREES — right side, varying heights, like evergreen ridge */}
      <g strokeWidth="1.5">
        {[
          { x: 1090, h: 130 },
          { x: 1135, h: 165 },
          { x: 1185, h: 140 },
          { x: 1230, h: 185 },
          { x: 1290, h: 155 },
          { x: 1345, h: 200 },
          { x: 1410, h: 145 },
          { x: 1465, h: 175 },
          { x: 1525, h: 130 },
          { x: 1575, h: 160 },
        ].map((t, i) => {
          const baseY = 470;
          const topY = baseY - t.h;
          const w = 28;
          // Triangular layered evergreen — three tiers
          const tier1Top = topY;
          const tier2Top = topY + t.h * 0.32;
          const tier3Top = topY + t.h * 0.6;
          return (
            <g key={i}>
              {/* Trunk */}
              <path d={`M ${t.x} ${baseY} L ${t.x} ${baseY - 8}`} />
              {/* Three triangle tiers */}
              <path
                d={`M ${t.x - w * 0.55} ${baseY - 6} L ${t.x} ${tier3Top} L ${t.x + w * 0.55} ${baseY - 6} Z`}
                fill="currentColor"
                fillOpacity="0.07"
              />
              <path
                d={`M ${t.x - w * 0.42} ${tier3Top + 8} L ${t.x} ${tier2Top} L ${t.x + w * 0.42} ${tier3Top + 8} Z`}
                fill="currentColor"
                fillOpacity="0.07"
              />
              <path
                d={`M ${t.x - w * 0.3} ${tier2Top + 6} L ${t.x} ${tier1Top} L ${t.x + w * 0.3} ${tier2Top + 6} Z`}
                fill="currentColor"
                fillOpacity="0.07"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
