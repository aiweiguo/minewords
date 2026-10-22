"use client";

import Link from "next/link";
import { useState } from "react";

import { GameIcon } from "@/components/GameIcon";
import { assetMap } from "@/lib/assets";
import {
  ROOM_BLOCK_COST,
  ROOM_FLOOR_SLOTS,
  ROOM_WALL_SLOTS,
  useGameStore,
} from "@/store/useGameStore";
import { RoomBlockType, RoomSlotId } from "@/types";

const blockMeta: Record<
  RoomBlockType,
  { labelCn: string; className: string; resourceKey: "wood" | "stone" }
> = {
  plank: {
    labelCn: "木板",
    className: "mw-block-plank",
    resourceKey: "wood",
  },
  cobble: {
    labelCn: "圆石",
    className: "mw-block-cobble",
    resourceKey: "stone",
  },
};

type HubRoomProps = {
  selectedBlock: RoomBlockType;
  onSelectBlock: (block: RoomBlockType) => void;
};

export function HubRoom({ selectedBlock, onSelectBlock }: HubRoomProps) {
  const roomBlocks = useGameStore((s) => s.roomBlocks);
  const resources = useGameStore((s) => s.resources);
  const placeRoomBlock = useGameStore((s) => s.placeRoomBlock);
  const [flashSlot, setFlashSlot] = useState<RoomSlotId | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const cost = ROOM_BLOCK_COST[selectedBlock];
  const canAfford = resources[cost.resource] >= cost.amount;
  const hasPlaceableMats = resources.wood >= 1 || resources.stone >= 1;
  const emphasizeFight = !hasPlaceableMats;
  const emphasizePlace = hasPlaceableMats;

  function tryPlace(slotId: RoomSlotId) {
    if (roomBlocks[slotId]) {
      setHint("这里已经有方块了");
      return;
    }
    if (!canAfford) {
      setHint(`需要 ${cost.amount} ${cost.resource === "wood" ? "木头" : "石头"}，先出门打怪`);
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

  return (
    <section className="mw-hub-room mw-game-panel overflow-hidden">
      <div className="mw-hub-sky" aria-hidden />

      <header className="relative z-[1] flex items-center justify-between gap-2 px-3 pt-3 sm:px-4">
        <h1 className="mw-hub-title">
          <span className="mw-pixel-title text-primary">MineWords</span>
          <span className="mw-hub-title-sep" aria-hidden>
            ·
          </span>
          <span>我的家</span>
        </h1>
      </header>

      <div className="relative z-[1] mx-3 mt-2 sm:mx-4">
        <div className="mw-hub-room-stage">
          <div className="mw-hub-wall-row">
            {ROOM_WALL_SLOTS.map(renderSlot)}
          </div>

          <div className="mw-hub-fixtures">
            <div
              className="mw-hub-fixture mw-hub-fixture-inert"
              title="武器架（即将开放）"
              aria-disabled="true"
            >
              <GameIcon src={assetMap.sword} alt="" size="sm" />
              <span>武器架</span>
            </div>
            <Link href="/crafting" className="mw-hub-fixture mw-hub-fixture-link mw-hub-fixture-secondary">
              <GameIcon src={assetMap.axe} alt="" size="sm" />
              <span>工作台</span>
            </Link>
            <Link
              href="/review"
              className={`mw-hub-fixture mw-hub-fixture-link mw-hub-door ${
                emphasizeFight ? "mw-hub-door-primary" : ""
              }`}
            >
              <span className="text-2xl" aria-hidden>
                🚪
              </span>
              <span>出门打怪</span>
            </Link>
          </div>

          <div className="mw-hub-floor-row">
            {ROOM_FLOOR_SLOTS.map(renderSlot)}
          </div>

          <div className="mw-hub-ground" aria-hidden>
            <div className="mw-hub-grass" />
            <div className="mw-hub-dirt" />
          </div>
        </div>
      </div>

      <div className="relative z-[1] space-y-2 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
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
                <span className="font-black">{meta.labelCn}</span>
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

        <p className="text-sm font-semibold text-muted" role="status">
          {hint
            ? hint
            : emphasizeFight
              ? "空房间 — 点门出门打怪攒木头"
              : canAfford
                ? "点空槽铺地板或墙"
                : "换一块有材料的，或出门再攒"}
        </p>
      </div>
    </section>
  );
}
