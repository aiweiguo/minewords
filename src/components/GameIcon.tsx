import Image from "next/image";

type GameIconProps = {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  pixelated?: boolean;
};

const sizeMap = {
  xs: 20,
  sm: 28,
  md: 40,
  lg: 56,
  xl: 72,
};

export function GameIcon({
  src,
  alt,
  size = "md",
  className = "",
  pixelated = true,
}: GameIconProps) {
  const dimension = sizeMap[size];

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src={src}
        alt={alt}
        width={dimension}
        height={dimension}
        className={pixelated ? "mw-pixel-icon" : "object-contain"}
        unoptimized
      />
    </span>
  );
}
