type BrandLogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const SIZES = {
  sm: { width: 128, height: 28 },
  md: { width: 168, height: 36 },
  lg: { width: 240, height: 52 },
} as const;

/** Original voyageur241 SVG (Inkscape) — light plate keeps black glyph readable on dark UI. */
export function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  const dim = SIZES[size];

  return (
    <span className={`brand-logo brand-logo--${size} ${className}`.trim()}>
      <img
        src="/assets/logo-YXujZMfe.svg"
        alt="voyageur241"
        width={dim.width}
        height={dim.height}
        decoding="async"
      />
    </span>
  );
}
