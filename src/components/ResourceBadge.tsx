import { ResourceType } from "@/types";

const resourceMeta: Record<
  ResourceType,
  { label: string; emoji: string; color: string }
> = {
  wood: { label: "Wood", emoji: "🪵", color: "bg-amber-100 text-amber-900" },
  stone: { label: "Stone", emoji: "🪨", color: "bg-gray-100 text-gray-800" },
  iron: { label: "Iron", emoji: "⚙️", color: "bg-slate-100 text-slate-800" },
  gold: { label: "Gold", emoji: "🥇", color: "bg-yellow-100 text-yellow-900" },
  emerald: { label: "Emerald", emoji: "💚", color: "bg-green-100 text-green-900" },
  diamond: { label: "Diamond", emoji: "💎", color: "bg-cyan-100 text-cyan-900" },
  netherite: { label: "Netherite", emoji: "🖤", color: "bg-zinc-200 text-zinc-900" },
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
      className={`inline-flex items-center gap-2 rounded-xl border-2 border-[#d9e2cc] px-3 py-2 font-bold ${meta.color} ${
        compact ? "text-sm" : "text-base"
      }`}
    >
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
      <span className="rounded-md bg-white/70 px-2 py-0.5">x{amount}</span>
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
