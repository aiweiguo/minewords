import { GameIcon } from "@/components/GameIcon";
import { getResourceIcon } from "@/lib/assets";
import { ResourceType } from "@/types";

const resourceMeta: Record<
  ResourceType,
  { label: string; color: string }
> = {
  wood: { label: "Wood", color: "bg-amber-900/40 text-amber-100 border-amber-700" },
  stone: { label: "Stone", color: "bg-gray-900/40 text-gray-100 border-gray-600" },
  iron: { label: "Iron", color: "bg-slate-900/40 text-slate-100 border-slate-600" },
  gold: { label: "Gold", color: "bg-yellow-900/40 text-yellow-100 border-yellow-600" },
  emerald: { label: "Emerald", color: "bg-green-900/40 text-green-100 border-green-700" },
  diamond: { label: "Diamond", color: "bg-cyan-900/40 text-cyan-100 border-cyan-600" },
  netherite: { label: "Netherite", color: "bg-zinc-900/40 text-zinc-100 border-zinc-600" },
};

type ResourceBadgeProps = {
  resource: ResourceType;
  amount: number;
  compact?: boolean;
};

export function ResourceBadge({
  resource,
  amount,
  compact = false,
}: ResourceBadgeProps) {
  const meta = resourceMeta[resource];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border-2 px-3 py-2 font-bold ${meta.color} ${
        compact ? "text-sm" : "text-base"
      }`}
    >
      <GameIcon src={getResourceIcon(resource)} alt={meta.label} size="xs" />
      <span>{meta.label}</span>
      <span className="rounded bg-black/40 px-2 py-0.5 text-xs">x{amount}</span>
    </div>
  );
}

export const displayResources: ResourceType[] = [
  "wood",
  "stone",
  "iron",
  "emerald",
  "diamond",
];

export { resourceMeta };
