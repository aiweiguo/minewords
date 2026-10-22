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
  { labelEn: string; labelCn: string; className: string }
> = {
  plank: {
    labelEn: "Plank",
    labelCn: "木板",
    className: "mw-block-plank",
  },
  cobble: {
    labelEn: "Cobble",
    labelCn: "圆石",
    className: "mw-block-cobble",
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
  const placedCount = Object.keys(roomBlocks).length;

  function tryPlace(slotId: RoomSlotId) {
    if (roomBlocks[slotId]) {
      setHint("这里已经有方块了 · Slot already filled");
      return;
    }
    if (!canAfford) {
      setHint(
        `需要 ${cost.amount} ${cost.resource} · Need ${cost.amount} ${cost.resource}`,
      );
      return;
    }
    const ok = placeRoomBlock(slotId, selectedBlock);
    if (ok) {
      setFlashSlot(slotId);
      window.setTimeout(() => setFlashSlot(null), 450);
      setHint(
        `放好了 ${blockMeta[selectedBlock].labelCn}！· Placed ${blockMeta[selectedBlock].labelEn}`,
      );
    }
  }

  function renderSlot(slotId: RoomSlotId) {
    const filled = roomBlocks[slotId];
    const isFloor = slotId.startsWith("floor-");
    return (
      <button
        key={slotId}
        type="button"
        aria-label={
          filled
            ? `${blockMeta[filled].labelEn} ${slotId}`
            : `Empty ${slotId}, place ${selectedBlock}`
        }
        onClick={() => tryPlace(slotId)}
        className={`mw-room-slot ${isFloor ? "mw-room-slot-floor" : "mw-room-slot-wall"} ${
          filled ? blockMeta[filled].className : "mw-room-slot-empty"
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

      <div className="relative z-[1] flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div>
          <p className="mw-pixel-title text-sm text-primary sm:text-base">
            MineWords
          </p>
          <h1 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">
            我的家 My Base
          </h1>
          <p className="mt-1 text-sm font-semibold text-muted">
            建房 · 武装 · 出门探索
            <span className="mt-0.5 block text-xs">Build · arm · explore</span>
          </p>
        </div>
        <p className="rounded border-2 border-[var(--panel-wood)] bg-black/35 px-2 py-1 text-xs font-bold text-muted">
          已放 {placedCount}
          <span className="block text-[10px]">placed</span>
        </p>
      </div>

      <div className="relative z-[1] mx-3 mt-3 sm:mx-4">
        <div className="mw-hub-room-stage">
          <div className="mw-hub-wall-row">
            {ROOM_WALL_SLOTS.map(renderSlot)}
          </div>

          <div className="mw-hub-fixtures">
            <div className="mw-hub-fixture" title="Weapon rack">
              <GameIcon src={assetMap.sword} alt="" size="sm" />
              <span>武器架</span>
              <span className="text-[10px] text-muted">Rack</span>
            </div>
            <Link href="/crafting" className="mw-hub-fixture mw-hub-fixture-link">
              <GameIcon src={assetMap.axe} alt="" size="sm" />
              <span>工作台</span>
              <span className="text-[10px] text-muted">Craft</span>
            </Link>
            <Link
              href="/review"
              className="mw-hub-fixture mw-hub-fixture-link mw-hub-door"
            >
              <span className="text-2xl" aria-hidden>
                🚪
              </span>
              <span>出门</span>
              <span className="text-[10px] font-bold text-primary">Fight</span>
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

      <div className="relative z-[1] space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(blockMeta) as RoomBlockType[]).map((type) => {
            const meta = blockMeta[type];
            const typeCost = ROOM_BLOCK_COST[type];
            const afford = resources[typeCost.resource] >= typeCost.amount;
            const selected = selectedBlock === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelectBlock(type)}
                className={`mw-block-picker ${meta.className} ${
                  selected ? "mw-block-picker-on" : ""
                } ${afford ? "" : "opacity-70"}`}
              >
                <span className="font-black">
                  {meta.labelCn} {meta.labelEn}
                </span>
                <span className="text-[11px] font-semibold text-black/70">
                  {typeCost.resource} ×{typeCost.amount}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-sm font-semibold text-muted">
          {canAfford
            ? "点空槽放置方块 · Tap an empty slot to place"
            : `材料不够，去打怪攒 ${cost.resource} · Fight for ${cost.resource}`}
        </p>
        {hint ? (
          <p className="text-sm font-bold text-secondary" role="status">
            {hint}
          </p>
        ) : null}
      </div>
    </section>
  );
}
