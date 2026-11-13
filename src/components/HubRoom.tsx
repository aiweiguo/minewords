"use client";

import Link from "next/link";
import { useState } from "react";

import { DailyAdventurePanel } from "@/components/DailyAdventurePanel";
import { GameIcon } from "@/components/GameIcon";
import { WeaponGoalStrip } from "@/components/WeaponGoalStrip";
import {
  baseDecorations,
  isDecorationUnlocked,
} from "@/data/baseDecorations";
import { decorationSceneSlots } from "@/data/decorationSlots";
import { weaponTiers } from "@/data/weapons";
import { assetMap } from "@/lib/assets";
import { getWeaponGoalSnapshot } from "@/lib/weaponGoal";
import {
  ROOM_BLOCK_COST,
  ROOM_FLOOR_SLOTS,
  ROOM_WALL_SLOTS,
  useGameStore,
} from "@/store/useGameStore";
import { RoomBlockType, RoomSlotId } from "@/types";

const blockMeta: Record<
  RoomBlockType,
  {
    labelCn: string;
    labelEn: string;
    className: string;
    resourceKey: "wood" | "stone";
  }
> = {
  plank: {
    labelCn: "木板",
    labelEn: "plank",
    className: "mw-block-plank",
    resourceKey: "wood",
  },
  cobble: {
    labelCn: "圆石",
    labelEn: "cobble",
    className: "mw-block-cobble",
    resourceKey: "stone",
  },
  glass: {
    labelCn: "玻璃",
    labelEn: "glass",
    className: "mw-block-glass",
    resourceKey: "wood",
  },
  wool: {
    labelCn: "羊毛",
    labelEn: "wool",
    className: "mw-block-wool",
    resourceKey: "wood",
  },
};

type HubRoomProps = {
  selectedBlock: RoomBlockType;
  onSelectBlock: (block: RoomBlockType) => void;
};

export function HubRoom({ selectedBlock, onSelectBlock }: HubRoomProps) {
  const roomBlocks = useGameStore((s) => s.roomBlocks);
  const resources = useGameStore((s) => s.resources);
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const learnedWordIds = useGameStore((s) => s.learnedWordIds);
  const masteredWordIds = useGameStore((s) => s.masteredWordIds);
  const placeRoomBlock = useGameStore((s) => s.placeRoomBlock);
  const [flashSlot, setFlashSlot] = useState<RoomSlotId | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const placedDecorations = baseDecorations.filter(
    (deco) =>
      isDecorationUnlocked(deco, learnedWordIds, masteredWordIds) ||
      unlockedIds.includes(deco.id),
  );

  const cost = ROOM_BLOCK_COST[selectedBlock];
  const canAfford = resources[cost.resource] >= cost.amount;
  const hasPlaceableMats = resources.wood >= 1 || resources.stone >= 1;
  const roomBlocksForGoal = roomBlocks;
  const goal = getWeaponGoalSnapshot(unlockedIds, resources, roomBlocksForGoal);
  const craftReady = goal.canCraft;
  const tradeReady = goal.canTrade;
  const homeDecorate =
    goal.status === "line-complete" && (goal.homeFill?.empty ?? 0) > 0;
  const emphasizeFight =
    !craftReady && !tradeReady && !homeDecorate && goal.status === "gather";
  const emphasizeCraft = craftReady;
  const emphasizeTrade = tradeReady && !craftReady;
  const emphasizePlace =
    (hasPlaceableMats && !craftReady && !tradeReady) || homeDecorate;

  const equipped = goal.equipped;
  const nextSlot = goal.status === "line-complete" ? null : goal.goal;
  const rackHref = craftReady && goal.goal ? `/crafting/${goal.goal.id}` : "/crafting";

  function tryPlace(slotId: RoomSlotId) {
    if (roomBlocks[slotId]) {
      setHint("这里已经有方块了");
      return;
    }
    if (!canAfford) {
      setHint(
        `需要 ${cost.amount} ${cost.resource === "wood" ? "木头" : "石头"}，先出门打怪`,
      );
      return;
    }
    const ok = placeRoomBlock(slotId, selectedBlock);
    if (ok) {
      setFlashSlot(slotId);
      window.setTimeout(() => setFlashSlot(null), 450);
      setHint(`放好了 ${blockMeta[selectedBlock].labelCn}！`);
    }
  }

  function renderSlot(slotId: RoomSlotId) {
    const filled = roomBlocks[slotId];
    const isFloor = slotId.startsWith("floor-");
    const quietEmpty = !filled && !hasPlaceableMats;
    return (
      <button
        key={slotId}
        type="button"
        aria-label={
          filled
            ? `${blockMeta[filled].labelCn} ${slotId}`
            : `空槽 ${slotId}，放置 ${blockMeta[selectedBlock].labelCn}`
        }
        onClick={() => tryPlace(slotId)}
        className={`mw-room-slot ${isFloor ? "mw-room-slot-floor" : "mw-room-slot-wall"} ${
          filled ? blockMeta[filled].className : "mw-room-slot-empty"
        } ${quietEmpty ? "mw-room-slot-quiet" : ""} ${
          emphasizePlace && !filled ? "mw-room-slot-ready" : ""
        } ${flashSlot === slotId ? "mw-room-slot-flash" : ""}`}
      >
        {filled ? (
          <span className="sr-only">{blockMeta[filled].labelCn}</span>
        ) : (
          <span className="mw-room-slot-plus" aria-hidden>
            +
          </span>
        )}
      </button>
    );
  }

  const rackLabel = equipped
    ? equipped.nameCn
    : nextSlot
      ? `空 · 下一把${nextSlot.goalLabelCn}`
      : "武器架";

  return (
    <section className="mw-hub-room mw-game-panel overflow-hidden">
      <header className="mw-hub-chrome relative z-[2] flex items-center justify-between gap-2">
        <h1 className="mw-hub-title">
          <span className="mw-pixel-title text-primary">MineWords</span>
          <span className="mw-hub-title-sep" aria-hidden>
            ·
          </span>
          <span>我的家</span>
        </h1>
        <span className="mw-hub-badge" aria-hidden>
          BASE
        </span>
      </header>

      <WeaponGoalStrip variant="hub" className="relative z-[2]" />
      <DailyAdventurePanel variant="hub" />

      <div className="mw-hub-stage-wrap relative z-[1]">
        <div className="mw-hub-room-stage" role="img" aria-label="侧视房间">
          {/* Far sky + parallax layers */}
          <div className="mw-hub-layer mw-hub-layer-sky" aria-hidden>
            <span className="mw-hub-sun" />
            <span className="mw-hub-cloud mw-hub-cloud-a" />
            <span className="mw-hub-cloud mw-hub-cloud-b" />
            <span className="mw-hub-cloud mw-hub-cloud-c" />
          </div>
          <div className="mw-hub-layer mw-hub-layer-hills" aria-hidden>
            <span className="mw-hub-hill mw-hub-hill-far" />
            <span className="mw-hub-hill mw-hub-hill-near" />
            <span className="mw-hub-tree mw-hub-tree-l" />
            <span className="mw-hub-tree mw-hub-tree-r" />
          </div>

          {/* Room interior mid-ground */}
          <div className="mw-hub-layer mw-hub-layer-room">
            <div className="mw-hub-backwall" aria-hidden>
              <span className="mw-hub-torch mw-hub-torch-l" />
              <span className="mw-hub-torch mw-hub-torch-r" />
            </div>

            {/* Unlocked word decorations — visible on the live stage */}
            <div className="mw-hub-decos" aria-hidden={placedDecorations.length === 0}>
              {placedDecorations.map((deco) => {
                const index = baseDecorations.findIndex((item) => item.id === deco.id);
                const slot =
                  decorationSceneSlots[
                    (index >= 0 ? index : 0) % decorationSceneSlots.length
                  ];
                return (
                  <div
                    key={deco.id}
                    className={`mw-hub-deco ${slot.className}`}
                    title={deco.nameCn}
                  >
                    <span className="mw-hub-deco-emoji">{deco.emoji}</span>
                    <span className="mw-hub-deco-label">{deco.nameCn}</span>
                  </div>
                );
              })}
            </div>

            <div className="mw-hub-wall-row">
              {ROOM_WALL_SLOTS.map(renderSlot)}
            </div>

            <div className="mw-hub-fixtures">
              <Link
                href={rackHref}
                className={`mw-hub-fixture mw-hub-fixture-link mw-hub-prop-rack ${
                  equipped ? "mw-hub-rack-filled" : "mw-hub-rack-empty"
                } ${emphasizeCraft ? "mw-hub-rack-ready" : ""}`}
                title={
                  equipped
                    ? `${equipped.nameCn}已挂上`
                    : nextSlot
                      ? `目标：${nextSlot.nameCn}`
                      : "武器架"
                }
              >
                <span className="mw-hub-prop-art" aria-hidden>
                  <span className="mw-hub-rack-post" />
                  {equipped ? (
                    <span
                      className={`mw-hub-rack-blade mw-hub-rack-blade-${equipped.rackTone}`}
                    >
                      <GameIcon src={equipped.icon} alt="" size="sm" />
                    </span>
                  ) : (
                    <span className="mw-hub-rack-ghost" aria-hidden>
                      <GameIcon
                        src={nextSlot?.icon ?? assetMap.sword}
                        alt=""
                        size="sm"
                        className="opacity-35"
                      />
                    </span>
                  )}
                  <span className="mw-hub-rack-post" />
                </span>
                <span className="mw-hub-prop-label">{rackLabel}</span>
                {!equipped && nextSlot ? (
                  <span className="mw-hub-rack-tier-dots" aria-hidden>
                    {weaponTiers.map((tier) => (
                      <span
                        key={tier.id}
                        className={`mw-hub-rack-dot ${
                          unlockedIds.includes(tier.id) ? "on" : ""
                        }`}
                      />
                    ))}
                  </span>
                ) : null}
              </Link>

              <Link
                href={
                  goal.goal ? `/crafting/${goal.goal.id}` : "/crafting/wooden-sword"
                }
                className={`mw-hub-fixture mw-hub-fixture-link mw-hub-prop-table ${
                  emphasizeCraft
                    ? "mw-hub-craft-primary"
                    : "mw-hub-fixture-secondary"
                }`}
              >
                <span className="mw-hub-prop-art" aria-hidden>
                  <span className="mw-hub-craft-top" />
                  <span className="mw-hub-craft-legs" />
                  <GameIcon
                    src={assetMap.axe}
                    alt=""
                    size="xs"
                    className="mw-hub-craft-tool"
                  />
                </span>
                <span className="mw-hub-prop-label">
                  {emphasizeCraft ? "去合成" : "工作台"}
                </span>
              </Link>

              <Link
                href="/explore"
                className={`mw-hub-fixture mw-hub-fixture-link mw-hub-door mw-hub-prop-door ${
                  emphasizeFight ? "mw-hub-door-primary" : ""
                }`}
              >
                <span className="mw-hub-prop-art" aria-hidden>
                  <span className="mw-hub-door-frame">
                    <span className="mw-hub-door-leaf">
                      <span className="mw-hub-door-knob" />
                    </span>
                  </span>
                </span>
                <span className="mw-hub-prop-label">出门打怪</span>
              </Link>

              <Link
                href={
                  emphasizeTrade && goal.primaryCta.kind === "trade"
                    ? goal.primaryCta.href
                    : "/trade"
                }
                className={`mw-hub-fixture mw-hub-fixture-link mw-hub-prop-trade ${
                  emphasizeTrade
                    ? "mw-hub-trade-primary"
                    : "mw-hub-fixture-secondary"
                }`}
                title="和村民深聊，再开口交易材料"
              >
                <span className="mw-hub-prop-art" aria-hidden>
                  <span className="mw-hub-villager">
                    <span className="mw-hub-villager-head" />
                    <span className="mw-hub-villager-body" />
                  </span>
                  <GameIcon
                    src={assetMap.emerald}
                    alt=""
                    size="xs"
                    className="mw-hub-trade-gem"
                  />
                </span>
                <span className="mw-hub-prop-label">
                  {emphasizeTrade ? "找村民" : "村民"}
                </span>
              </Link>
            </div>

            <div className="mw-hub-floor-row">
              {ROOM_FLOOR_SLOTS.map(renderSlot)}
            </div>
          </div>

          <div className="mw-hub-ground" aria-hidden>
            <div className="mw-hub-grass">
              <span className="mw-hub-blade" />
              <span className="mw-hub-blade mw-hub-blade-b" />
              <span className="mw-hub-blade mw-hub-blade-c" />
            </div>
            <div className="mw-hub-dirt" />
          </div>
        </div>
      </div>

      <div className="mw-hub-toolbar relative z-[2]">
        <div
          className={`mw-hub-pickers flex flex-wrap items-center gap-2 ${
            emphasizePlace ? "mw-hub-pickers-ready" : ""
          }`}
        >
          {(Object.keys(blockMeta) as RoomBlockType[]).map((type) => {
            const meta = blockMeta[type];
            const typeCost = ROOM_BLOCK_COST[type];
            const stock = resources[meta.resourceKey];
            const afford = stock >= typeCost.amount;
            const selected = selectedBlock === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelectBlock(type)}
                className={`mw-block-picker ${meta.className} ${
                  selected ? "mw-block-picker-on" : ""
                } ${afford && emphasizePlace ? "mw-block-picker-ready" : ""} ${
                  afford ? "" : "opacity-60"
                }`}
              >
                <span className="font-black">
                  {meta.labelCn}
                  <span className="ml-1 text-[10px] font-bold uppercase tracking-wide opacity-70">
                    {meta.labelEn}
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-black/70">
                  {meta.resourceKey === "wood" ? "木头" : "石头"} ×{stock}
                </span>
              </button>
            );
          })}
          {emphasizePlace ? (
            <span className="mw-hub-place-cta text-sm font-black text-secondary">
              去铺块
            </span>
          ) : null}
        </div>

        <p className="mw-hub-hint" role="status">
          {hint
            ? hint
            : emphasizeCraft
              ? "材料够了 — 点工作台开口合成武器"
              : homeDecorate
                ? goal.homeFill
                  ? `钻石剑已挂上 — 还差 ${goal.homeFill.empty} 个家装位，点空槽铺木板/圆石/玻璃/羊毛；学词还能点亮房间装饰`
                  : "钻石剑已挂上 — 点空槽装扮我家"
                : placedDecorations.length > 0 && emphasizeFight
                  ? "空武器架 — 点门出门打怪；森林打羊可学 wool，家里可铺玻璃/羊毛"
                  : emphasizeFight
                    ? "空武器架 — 点门出门打怪攒材料"
                    : canAfford
                      ? "点空槽铺地板或墙（木板·圆石·玻璃·羊毛）"
                      : "换一块有材料的，或点交易开口换稀有材料"}
        </p>
      </div>
    </section>
  );
}
