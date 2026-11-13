"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { DailyAdventurePanel } from "@/components/DailyAdventurePanel";
import { GameIcon } from "@/components/GameIcon";
import { WeaponGoalStrip } from "@/components/WeaponGoalStrip";
import {
  baseDecorations,
  isDecorationUnlocked,
} from "@/data/baseDecorations";
import { decorationSceneSlots } from "@/data/decorationSlots";
import { countCompletedVillagerChatTurns } from "@/data/villagerChat";
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
    resourceKey: "wood" | "stone" | "glass" | "wool";
    costLabelCn: string;
  }
> = {
  plank: {
    labelCn: "木板",
    labelEn: "plank",
    className: "mw-block-plank",
    resourceKey: "wood",
    costLabelCn: "木头",
  },
  cobble: {
    labelCn: "圆石",
    labelEn: "cobble",
    className: "mw-block-cobble",
    resourceKey: "stone",
    costLabelCn: "石头",
  },
  glass: {
    labelCn: "玻璃",
    labelEn: "glass",
    className: "mw-block-glass",
    resourceKey: "glass",
    costLabelCn: "玻璃",
  },
  wool: {
    labelCn: "羊毛",
    labelEn: "wool",
    className: "mw-block-wool",
    resourceKey: "wool",
    costLabelCn: "羊毛",
  },
};

const COST_HINT_CN: Record<"wood" | "stone" | "glass" | "wool", string> = {
  wood: "木头",
  stone: "石头",
  glass: "玻璃（矿脉水晶怪掉）",
  wool: "羊毛（森林打羊掉）",
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
  const defeatedMonsterIds = useGameStore((s) => s.defeatedMonsterIds);
  const placeRoomBlock = useGameStore((s) => s.placeRoomBlock);
  const [flashSlot, setFlashSlot] = useState<RoomSlotId | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [villagerChatTurnsDone, setVillagerChatTurnsDone] = useState(0);
  const [decorToast, setDecorToast] = useState<string | null>(null);
  const seenDecorIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    setVillagerChatTurnsDone(countCompletedVillagerChatTurns());
  }, []);

  const placedDecorations = baseDecorations.filter(
    (deco) =>
      isDecorationUnlocked(deco, learnedWordIds, masteredWordIds) ||
      unlockedIds.includes(deco.id),
  );
  const litDecorCount = placedDecorations.length;
  const decorTotal = baseDecorations.length;
  const roomIsSparse =
    litDecorCount === 0 && Object.values(roomBlocks).every((b) => !b);
  const litDecorKey = placedDecorations.map((d) => d.id).join("|");

  // MW-57: short celebrate when a word decoration newly lights (not a card).
  useEffect(() => {
    const litIds = litDecorKey ? litDecorKey.split("|") : [];
    if (seenDecorIdsRef.current === null) {
      seenDecorIdsRef.current = new Set(litIds);
      return;
    }
    const fresh = litIds.filter((id) => !seenDecorIdsRef.current!.has(id));
    if (fresh.length === 0) return;
    for (const id of litIds) seenDecorIdsRef.current.add(id);
    const newest = baseDecorations.find(
      (d) => d.id === fresh[fresh.length - 1],
    );
    if (!newest) return;
    setDecorToast(`${newest.emoji} 点亮了 ${newest.nameCn}！`);
    const timer = window.setTimeout(() => setDecorToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [litDecorKey]);

  const cost = ROOM_BLOCK_COST[selectedBlock];
  const canAfford = resources[cost.resource] >= cost.amount;
  const hasPlaceableMats =
    resources.wood >= 1 ||
    resources.stone >= 1 ||
    resources.glass >= 1 ||
    resources.wool >= 1;
  const roomBlocksForGoal = roomBlocks;
  const goal = getWeaponGoalSnapshot(unlockedIds, resources, roomBlocksForGoal, {
    learnedWordIds,
    masteredWordIds,
    unlockedIds,
    defeatedMonsterIds,
    villagerChatTurnsDone,
  });
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
      const needLabel =
        COST_HINT_CN[cost.resource as keyof typeof COST_HINT_CN] ??
        cost.resource;
      setHint(`需要 ${cost.amount} ${needLabel}，先出门打怪`);
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
      {decorToast ? (
        <p className="mw-deco-lit-toast relative z-[3]" role="status">
          {decorToast}
        </p>
      ) : null}
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
            <div className="mw-hub-decos" aria-hidden={litDecorCount === 0}>
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

            {/* MW-66 / Ship B: empty-room anchors — player silhouette + lived-in stage */}
            <div
              className={`mw-hub-player ${roomIsSparse ? "mw-hub-player-sparse" : ""}`}
              aria-hidden
            >
              <span className="mw-hub-player-silhouette">
                <span className="mw-hub-player-head" />
                <span className="mw-hub-player-torso" />
                <span className="mw-hub-player-legs" />
              </span>
              <span className="mw-hub-player-tag">我</span>
            </div>

            <a
              href="#decorate"
              className={`mw-hub-decor-meter ${
                litDecorCount === 0 ? "mw-hub-decor-meter-empty" : ""
              }`}
              aria-label={`装扮进度 ${litDecorCount} / ${decorTotal}`}
              title="学词点亮房间装饰"
            >
              <span className="mw-hub-decor-meter-label" aria-hidden>
                装扮
              </span>
              <span className="mw-hub-decor-meter-pips" aria-hidden>
                {baseDecorations.map((deco) => (
                  <span
                    key={deco.id}
                    className={`mw-hub-decor-pip ${
                      placedDecorations.some((d) => d.id === deco.id) ? "on" : ""
                    }`}
                  />
                ))}
              </span>
              <span className="mw-hub-decor-meter-count">
                {litDecorCount}/{decorTotal}
              </span>
            </a>

            <div className="mw-hub-wall-row">
              {ROOM_WALL_SLOTS.map(renderSlot)}
            </div>

            <div className="mw-hub-fixtures">
              <Link
                href={rackHref}
                className={`mw-hub-fixture mw-hub-fixture-link mw-hub-prop-rack ${
                  equipped ? "mw-hub-rack-filled" : "mw-hub-rack-empty mw-hub-rack-waiting"
                } ${emphasizeCraft ? "mw-hub-rack-ready" : ""}`}
                title={
                  equipped
                    ? `${equipped.nameCn}已挂上`
                    : nextSlot
                      ? `待挂：${nextSlot.nameCn}`
                      : "武器架 · 待挂"
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
                    <span className="mw-hub-rack-waiting-art">
                      <span className="mw-hub-rack-peg" />
                      <span className="mw-hub-rack-ghost">
                        <GameIcon
                          src={nextSlot?.icon ?? assetMap.sword}
                          alt=""
                          size="sm"
                          className="opacity-35"
                        />
                      </span>
                      <span className="mw-hub-rack-peg mw-hub-rack-peg-b" />
                    </span>
                  )}
                  <span className="mw-hub-rack-post" />
                </span>
                <span className="mw-hub-prop-label">{rackLabel}</span>
                {!equipped ? (
                  <span className="mw-hub-rack-wait-chip" aria-hidden>
                    待挂
                  </span>
                ) : null}
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
                  {meta.costLabelCn} ×{stock}
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
                : roomIsSparse && emphasizeFight
                  ? "这是我的房间 — 点门出门打怪，攒材料挂剑、铺家"
                  : litDecorCount > 0 && emphasizeFight
                    ? "空武器架 — 点门出门打怪；森林打羊掉羊毛，矿脉水晶怪掉玻璃"
                    : emphasizeFight
                      ? "空武器架 — 点门出门打怪攒材料"
                      : canAfford
                        ? "点空槽铺地板或墙（木板耗木·圆石耗石·玻璃耗玻璃·羊毛耗羊毛）"
                        : "换一块有材料的：羊毛打羊，玻璃打水晶怪"}
        </p>
      </div>
    </section>
  );
}
