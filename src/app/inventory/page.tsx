"use client";

import { displayResources, ResourceBadge } from "@/components/ResourceBadge";
import { unlockables } from "@/data/unlockables";
import { useGameStore } from "@/store/useGameStore";

export default function InventoryPage() {
  const resources = useGameStore((state) => state.resources);
  const unlockedIds = useGameStore((state) => state.unlockedIds);

  const equipment = unlockables.filter(
    (item) => item.type === "equipment" && unlockedIds.includes(item.id),
  );

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Inventory 背包</h1>
        <p className="mt-2 text-sm font-semibold text-muted">
          查看你的资源和已获得装备。
        </p>
      </section>

      <section className="mw-card p-5">
        <h2 className="text-xl font-black">资源</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {displayResources.map((resource) => (
            <ResourceBadge
              key={resource}
              resource={resource}
              amount={resources[resource]}
            />
          ))}
        </div>
      </section>

      <section className="mw-card p-5">
        <h2 className="text-xl font-black">装备</h2>
        <div className="mt-4 space-y-3">
          {equipment.length > 0 ? (
            equipment.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-[#eef6e4] px-4 py-3 font-bold"
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p>{item.name}</p>
                  <p className="text-sm font-semibold text-muted">{item.nameCn}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm font-semibold text-muted">还没有装备，快去做任务吧！</p>
          )}
        </div>
      </section>
    </main>
  );
}
