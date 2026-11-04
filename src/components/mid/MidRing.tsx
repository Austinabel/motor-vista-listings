import { ringFraction } from "@/lib/mid";

interface MidRingProps {
  score: number;
  size?: number;
  /** Sealed 14-day Conscience cycles, drawn as notches on the outer edge (PRD Section 5). */
  notches?: number;
  className?: string;
}

/** The MID ring: a 0–1000 progress circle with the score in the middle. */
export const MidRing = ({ score, size = 96, notches = 0, className = "" }: MidRingProps) => {
  const stroke = Math.max(4, size / 12);
  const radius = (size - stroke) / 2 - 3;
  const circumference = 2 * Math.PI * radius;
  const centre = size / 2;
  const shown = Math.round(score);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} role="img" aria-label={`MID score ${shown} of 1000`}>
      <circle cx={centre} cy={centre} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
      <circle
        cx={centre}
        cy={centre}
        r={radius}
        fill="none"
        stroke="hsl(var(--gold))"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference * ringFraction(score)} ${circumference}`}
        transform={`rotate(-90 ${centre} ${centre})`}
      />
      {Array.from({ length: Math.min(notches, 26) }, (_, index) => {
        const angle = (index / 26) * 2 * Math.PI - Math.PI / 2;
        const inner = radius + stroke / 2 + 1;
        return (
          <line
            key={index}
            x1={centre + inner * Math.cos(angle)}
            y1={centre + inner * Math.sin(angle)}
            x2={centre + (inner + 3) * Math.cos(angle)}
            y2={centre + (inner + 3) * Math.sin(angle)}
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
          />
        );
      })}
      <text x={centre} y={centre + size * 0.07} textAnchor="middle" fontSize={size * 0.24} fontWeight={800} fill="currentColor">
        {shown}
      </text>
    </svg>
  );
};
