interface Props {
  className?: string;
  tone?: "ink" | "gold" | "cream";
}

export function Ornament({ className, tone = "ink" }: Props) {
  const stroke =
    tone === "gold" ? "#b8893a" : tone === "cream" ? "#fbf6ef" : "#1a1310";
  return (
    <svg
      viewBox="0 0 240 24"
      className={className}
      aria-hidden
      fill="none"
      stroke={stroke}
      strokeWidth="0.8"
      strokeLinecap="round"
    >
      <line x1="0" y1="12" x2="86" y2="12" strokeOpacity="0.4" />
      <line x1="154" y1="12" x2="240" y2="12" strokeOpacity="0.4" />
      <path
        d="M120 4 C 127 8, 127 16, 120 20 C 113 16, 113 8, 120 4 Z"
        strokeOpacity="0.9"
      />
      <circle cx="120" cy="12" r="1.6" fill={stroke} stroke="none" />
      <circle cx="100" cy="12" r="1" fill={stroke} stroke="none" opacity="0.7" />
      <circle cx="140" cy="12" r="1" fill={stroke} stroke="none" opacity="0.7" />
    </svg>
  );
}
