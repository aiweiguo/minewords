"use client";

import { GameIcon } from "@/components/GameIcon";
import { RarityBadge } from "@/components/RarityBadge";
import { getQuestById } from "@/data/quests";
import { unlockables } from "@/data/unlockables";
import { assetMap, getUnlockableImage } from "@/lib/assets";
import { getUnlockConditionText } from "@/lib/questEngine";
import { useGameStore } from "@/store/useGameStore";

export default function UnlocksPage() {
  const unlockedIds = useGameStore((state) => state.unlockedIds);

  const unlocked = unlockables.filter((item) => unlockedIds.includes(item.id));
  const locked = unlockables.filter((item) => !unlockedIds.includes(item.id));

  function renderIcon(item: (typeof unlockables)[number], grayscale = false) {
    const image = item.image ?? getUnlockableImage(item.id) ?? item.icon;
    if (image.startsWith("/")) {
      return (
        <GameIcon
          src={image}
          alt={item.nameCn}
          size="lg"
          className={grayscale ? "grayscale opacity-60" : ""}
        />
      );
    }
    return <span className={`text-3xl ${grayscale ? "grayscale opacity-60" : ""}`}>{image}</span>;
  }

  return (
    <main className="space-y-6">
      <section className="mw-card p-5">
        <h1 className="text-3xl font-black text-primary">Unlocks 解锁</h1>
        <p className="mt-2 text-sm font-semibold text-muted">
          完成任务解锁装备、称号和地图区域。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black">已解锁</h2>
        {unlocked.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {unlocked.map((item) => (
              <article key={item.id} className="mw-card p-4">
                <div className="flex items-center gap-3">
                  {renderIcon(item)}
                  <div>
                    <h3 className="text-lg font-black">{item.name}</h3>
                    <p className="font-bold text-secondary">{item.nameCn}</p>
                    {item.rarity ? <RarityBadge rarity={item.rarity} compact className="mt-1" /> : null}
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{item.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-muted">还没有解锁内容。</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black">未解锁</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {locked.map((item) => {
            const quest = item.questId ? getQuestById(item.questId) : undefined;
            return (
              <article key={item.id} className="mw-card p-4 opacity-80">
                <div className="flex items-center gap-3">
                  {renderIcon(item, true)}
                  <div>
                    <h3 className="text-lg font-black">{item.name}</h3>
                    <p className="font-bold text-secondary">{item.nameCn}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{item.description}</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-primary">
                  <GameIcon src={assetMap.lock} alt="Locked" size="xs" />
                  {getUnlockConditionText(item.questId, quest?.titleCn)}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
