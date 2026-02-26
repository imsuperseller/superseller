'use client';

import { useEffect, useState } from 'react';

/**
 * Abstract SVG illustrations for each crew member card.
 * Renders a themed SVG that sits behind the card content.
 * Low opacity by default, fades in on group-hover.
 *
 * Client-only rendering to avoid SVG hydration mismatches.
 */

interface CrewCardVisualProps {
  crewId: string;
  accentColor: string;
  accentColorRgb: string;
}

export function CrewCardVisual({ crewId, accentColor, accentColorRgb }: CrewCardVisualProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Render nothing on server — the visual is opacity-0 by default anyway
  if (!mounted) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
      aria-hidden="true"
    >
      {/* Base gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 80% 20%, rgba(${accentColorRgb}, 0.06), transparent 60%)`,
        }}
      />

      {/* The unique SVG per crew type */}
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMin slice"
      >
        {getVisualElements(crewId, accentColor, accentColorRgb)}
      </svg>
    </div>
  );
}

function getVisualElements(crewId: string, color: string, rgb: string) {
  switch (crewId) {
    case 'forge':
      // Cinematic film frames + house silhouette
      return (
        <g opacity="0.15">
          {/* Film strip perforations */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={`perf-${i}`} x={290 + (i % 2) * 20} y={30 + i * 40} width={8} height={16} rx={2} fill={color} />
          ))}
          {/* Camera viewfinder frame */}
          <rect x="260" y="20" width="120" height="90" rx="8" stroke={color} strokeWidth="2" fill="none" strokeDasharray="8 4" />
          {/* House silhouette */}
          <path d="M290 100 L350 60 L410 100 L410 140 L290 140 Z" stroke={color} strokeWidth="1.5" fill={`rgba(${rgb}, 0.05)`} />
          {/* Lens circles */}
          <circle cx="320" cy="80" r="20" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="320" cy="80" r="12" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
          {/* Action lines */}
          <line x1="260" y1="160" x2="400" y2="160" stroke={color} strokeWidth="0.5" opacity="0.3" />
          <line x1="260" y1="170" x2="380" y2="170" stroke={color} strokeWidth="0.5" opacity="0.2" />
        </g>
      );

    case 'spoke':
      // Audio waveform + face outline
      return (
        <g opacity="0.15">
          {/* Audio waveform bars */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
            const heights = [20, 35, 50, 70, 45, 60, 80, 55, 40, 65, 30, 25];
            return (
              <rect
                key={`wave-${i}`}
                x={270 + i * 12}
                y={140 - heights[i] / 2}
                width={4}
                height={heights[i]}
                rx={2}
                fill={color}
                opacity={0.6 + (i % 3) * 0.15}
              />
            );
          })}
          {/* Face silhouette circle */}
          <circle cx="330" cy="60" r="28" stroke={color} strokeWidth="1.5" fill={`rgba(${rgb}, 0.04)`} />
          {/* Microphone icon */}
          <rect x="322" y="100" width="16" height="24" rx="8" stroke={color} strokeWidth="1.5" fill="none" />
          <line x1="330" y1="124" x2="330" y2="140" stroke={color} strokeWidth="1.5" />
          <line x1="320" y1="140" x2="340" y2="140" stroke={color} strokeWidth="1.5" />
        </g>
      );

    case 'frontdesk':
      // Phone + sound ripples
      return (
        <g opacity="0.15">
          {/* Sound ripples expanding from phone */}
          {[40, 60, 80, 100].map((r, i) => (
            <circle
              key={`ripple-${i}`}
              cx="330"
              cy="90"
              r={r}
              stroke={color}
              strokeWidth="1"
              fill="none"
              opacity={0.4 - i * 0.08}
            />
          ))}
          {/* Phone handset */}
          <path
            d="M310 70 Q310 55 320 50 L340 50 Q350 55 350 70 L350 110 Q350 125 340 130 L320 130 Q310 125 310 110 Z"
            stroke={color}
            strokeWidth="2"
            fill={`rgba(${rgb}, 0.06)`}
            rx="6"
          />
          {/* Screen line */}
          <rect x="318" y="62" width="24" height="36" rx="4" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
          {/* Signal dots */}
          <circle cx="370" cy="50" r="3" fill={color} opacity="0.6" />
          <circle cx="384" cy="42" r="2.5" fill={color} opacity="0.4" />
          <circle cx="396" cy="36" r="2" fill={color} opacity="0.25" />
        </g>
      );

    case 'scout':
      // Crosshair + data flow
      return (
        <g opacity="0.15">
          {/* Crosshair */}
          <circle cx="330" cy="80" r="40" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="330" cy="80" r="25" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
          <circle cx="330" cy="80" r="8" fill={`rgba(${rgb}, 0.15)`} />
          <line x1="330" y1="30" x2="330" y2="130" stroke={color} strokeWidth="0.75" opacity="0.4" />
          <line x1="280" y1="80" x2="380" y2="80" stroke={color} strokeWidth="0.75" opacity="0.4" />
          {/* Data flow dots trailing down */}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={`dot-${i}`}
              cx={300 + i * 15}
              cy={150 + i * 8}
              r={3 - i * 0.4}
              fill={color}
              opacity={0.6 - i * 0.1}
            />
          ))}
          {/* Arrow pointing into target */}
          <path d="M270 40 L310 70" stroke={color} strokeWidth="1.5" />
          <polygon points="310,70 302,62 306,72" fill={color} />
        </g>
      );

    case 'buzz':
      // Floating social platform icons abstracted
      return (
        <g opacity="0.15">
          {/* Abstract social bubbles */}
          <circle cx="290" cy="50" r="18" stroke={color} strokeWidth="1.5" fill={`rgba(${rgb}, 0.04)`} />
          <circle cx="350" cy="40" r="14" stroke={color} strokeWidth="1.5" fill={`rgba(${rgb}, 0.04)`} />
          <circle cx="370" cy="90" r="20" stroke={color} strokeWidth="1.5" fill={`rgba(${rgb}, 0.04)`} />
          <circle cx="300" cy="110" r="12" stroke={color} strokeWidth="1" fill={`rgba(${rgb}, 0.04)`} />
          <circle cx="340" cy="140" r="16" stroke={color} strokeWidth="1" fill={`rgba(${rgb}, 0.04)`} />
          {/* Connection lines between bubbles */}
          <line x1="306" y1="56" x2="338" y2="44" stroke={color} strokeWidth="0.75" opacity="0.3" />
          <line x1="358" y1="52" x2="366" y2="72" stroke={color} strokeWidth="0.75" opacity="0.3" />
          <line x1="354" y1="104" x2="346" y2="126" stroke={color} strokeWidth="0.75" opacity="0.3" />
          <line x1="310" y1="114" x2="326" y2="132" stroke={color} strokeWidth="0.75" opacity="0.3" />
          {/* Heart icon in one bubble */}
          <path d="M286 46 C282 40 276 40 276 46 C276 52 286 58 286 58 C286 58 296 52 296 46 C296 40 290 40 286 46 Z" fill={color} opacity="0.4" />
          {/* Share icon in another */}
          <circle cx="370" cy="86" r="4" fill={color} opacity="0.4" />
          <circle cx="380" cy="78" r="2.5" fill={color} opacity="0.3" />
          <circle cx="382" cy="96" r="2.5" fill={color} opacity="0.3" />
        </g>
      );

    case 'cortex':
      // Neural network / brain connections
      return (
        <g opacity="0.15">
          {/* Neural nodes */}
          {[
            { x: 300, y: 50 },
            { x: 340, y: 35 },
            { x: 370, y: 60 },
            { x: 280, y: 90 },
            { x: 330, y: 80 },
            { x: 375, y: 95 },
            { x: 310, y: 120 },
            { x: 360, y: 130 },
            { x: 340, y: 160 },
          ].map((node, i) => (
            <circle key={`node-${i}`} cx={node.x} cy={node.y} r={i === 4 ? 6 : 4} fill={color} opacity={i === 4 ? 0.6 : 0.35} />
          ))}
          {/* Connection lines forming a network */}
          <line x1="300" y1="50" x2="340" y2="35" stroke={color} strokeWidth="0.75" opacity="0.25" />
          <line x1="340" y1="35" x2="370" y2="60" stroke={color} strokeWidth="0.75" opacity="0.25" />
          <line x1="300" y1="50" x2="330" y2="80" stroke={color} strokeWidth="0.75" opacity="0.25" />
          <line x1="280" y1="90" x2="330" y2="80" stroke={color} strokeWidth="0.75" opacity="0.25" />
          <line x1="330" y1="80" x2="375" y2="95" stroke={color} strokeWidth="0.75" opacity="0.25" />
          <line x1="330" y1="80" x2="370" y2="60" stroke={color} strokeWidth="0.75" opacity="0.25" />
          <line x1="280" y1="90" x2="310" y2="120" stroke={color} strokeWidth="0.75" opacity="0.25" />
          <line x1="375" y1="95" x2="360" y2="130" stroke={color} strokeWidth="0.75" opacity="0.25" />
          <line x1="310" y1="120" x2="340" y2="160" stroke={color} strokeWidth="0.75" opacity="0.25" />
          <line x1="360" y1="130" x2="340" y2="160" stroke={color} strokeWidth="0.75" opacity="0.25" />
          {/* Central brain glow */}
          <circle cx="330" cy="80" r="20" stroke={color} strokeWidth="1" fill="none" opacity="0.2" />
        </g>
      );

    default:
      return null;
  }
}
