"use client";

import { GameIcon } from "@/components/GameIcon";
import { InventorySlot } from "@/components/InventorySlot";
import { RarityBadge } from "@/components/RarityBadge";
import { displayResources } from "@/components/ResourceBadge";
import { unlockables } from "@/data/unlockables";
import { getResourceIcon } from "@/lib/assets";
import { useGameStore } from "@/store/useGameStore";

const GRID_SIZE = 24;

export default function InventoryPage() {
  const resources = useGameStore((state) => state.resources);
  const unlockedIds = useGameStore((state) => state.unlockedIds);

  const equipment = unlockables.filter(
    (item) => item.type === "equipment" && unlockedIds.includes(item.id),
  );

  const resourceSlots = displayResources.map((resource) => ({
    key: resource,
    icon: getResourceIcon(resource),
    label: resource,
    count: resources[resource],
  }));

  const equipmentSlots = equipment.map((item) => ({
    key: item.id,
    icon: item.image ?? item.icon,
    label: item.nameCn,
    rarity: item.rarity,
  }));

  const filledSlots = [...resourceSlots, ...equipmentSlots];
  const emptySlotCount = Math.max(0, GRID_SIZE - filledSlots.length);

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Inventory 背包</h1>
        <p className="mt-2 text-sm font-semibold text-muted">
          Minecraft 风格 6×4 物品栏 — 查看资源和装备。
        </p>
      </section>

      <section className="mw-card p-5">
        <h2 className="text-xl font-black">物品栏</h2>
        <div className="mw-inventory-grid mt-4">
          {filledSlots.map((slot) => (
            <InventorySlot
              key={slot.key}
              icon={slot.icon}
              label={slot.label}
              count={"count" in slot ? slot.count : undefined}
              rarity={"rarity" in slot ? slot.rarity : undefined}
            />
          ))}
          {Array.from({ length: emptySlotCount }).map((_, index) => (
            <InventorySlot key={`empty-${index}`} empty />
          ))}
        </div>
      </section>

      {equipment.length > 0 ? (
        <section className="mw-card p-5">
          <h2 className="text-xl font-black">装备详情</h2>
          <div className="mt-4 space-y-3">
            {equipment.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--panel-wood)] bg-black/20 px-4 py-3 font-bold"
              >
                <GameIcon src={item.image ?? item.icon} alt={item.name} size="md" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p>{item.name}</p>
                    {item.rarity ? <RarityBadge rarity={item.rarity} compact /> : null}
                  </div>
                  <p className="text-sm font-semibold text-muted">{item.nameCn}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p className="text-center text-sm font-semibold text-muted">
          还没有装备，快去做任务吧！
        </p>
      )}
    </main>
  );
}
