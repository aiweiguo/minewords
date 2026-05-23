import { ReactNode } from "react";

import { GameIcon } from "@/components/GameIcon";
import { uiAssetMap } from "@/lib/assets";
import { Rarity } from "@/types";
import { getRarityClasses } from "@/lib/assets";

type InventorySlotProps = {
  icon?: string;
  label?: string;
  count?: number;
  rarity?: Rarity;
  empty?: boolean;
  locked?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
};

export function InventorySlot({
  icon,
  label,
  count,
  rarity,
  empty = false,
  locked = false,
  onClick,
  children,
  className = "",
}: InventorySlotProps) {
  const rarityStyles = rarity ? getRarityClasses(rarity) : null;
  const interactive = Boolean(onClick);

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`mw-inventory-slot relative flex aspect-square flex-col items-center justify-center p-1 ${
        rarityStyles ? `${rarityStyles.border} ring-2 ${rarityStyles.ring}` : ""
      } ${empty ? "opacity-50" : ""} ${locked ? "grayscale" : ""} ${
        interactive ? "cursor-pointer hover:brightness-110" : ""
      } ${className}`}
      style={{
        backgroundImage: `url(${uiAssetMap.inventorySlot})`,
      }}
      title={label}
    >
      {children ?? (
        <>
          {icon ? <GameIcon src={icon} alt={label ?? "item"} size="sm" /> : null}
          {count !== undefined && count > 0 ? (
            <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[10px] font-black text-white">
              {count}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
