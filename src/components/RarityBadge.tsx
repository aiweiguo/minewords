import { Rarity } from "@/types";
import { getRarityClasses } from "@/lib/assets";

type RarityBadgeProps = {
  rarity: Rarity;
  compact?: boolean;
  className?: string;
};

export function RarityBadge({ rarity, compact = false, className = "" }: RarityBadgeProps) {
  const styles = getRarityClasses(rarity);

  return (
    <span
      className={`inline-flex items-center rounded-md border-2 font-black uppercase tracking-wide ${styles.border} ${styles.bg} ${styles.text} ${
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      } ${className}`}
    >
      {styles.label}
    </span>
  );
}
