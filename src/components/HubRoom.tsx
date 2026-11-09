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

            <div className="mw-hub-wall-row">
              {ROOM_WALL_SLOTS.map(renderSlot)}
            </div>

            <div className="mw-hub-fixtures">
              <div
                className="mw-hub-fixture mw-hub-fixture-inert mw-hub-prop-rack"
                title="武器架（即将开放）"
                aria-disabled="true"
              >
                <span className="mw-hub-prop-art" aria-hidden>
                  <span className="mw-hub-rack-post" />
                  <GameIcon src={assetMap.sword} alt="" size="sm" />
                  <span className="mw-hub-rack-post" />
                </span>
                <span className="mw-hub-prop-label">武器架</span>
              </div>

              <Link
                href="/crafting"
                className="mw-hub-fixture mw-hub-fixture-link mw-hub-fixture-secondary mw-hub-prop-table"
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
                <span className="mw-hub-prop-label">工作台</span>
              </Link>

              <Link
                href="/review"
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

        <p className="mw-hub-hint" role="status">
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
