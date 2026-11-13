"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { WeaponGoalStrip } from "@/components/WeaponGoalStrip";
import { ExploreZone, ExploreZoneId } from "@/data/exploreZones";
import { backgroundMap } from "@/lib/assets";
import { listExploreZoneStates } from "@/lib/exploreZones";
import { getWordMonsterLabel } from "@/lib/wrongWord";
import { useGameStore } from "@/store/useGameStore";

type EnterTarget = {
  href: string;
  nameCn: string;
  nameEn: string;
  background: string;
  tone: string;
};

const ENTER_MS = 900;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ZoneScenePreview({
  monsterIds,
  locked = false,
}: {
  monsterIds: readonly string[];
  locked?: boolean;
}) {
  const shown = monsterIds.slice(0, 4);
  return (
    <span
      className={`mw-explore-portal-scene${locked ? " mw-explore-portal-scene-locked" : ""}`}
      aria-hidden
    >
      <span className="mw-explore-portal-scene-ground" />
      {shown.map((id, index) => {
        const label = getWordMonsterLabel(id);
        return (
          <span
            key={id}
            className="mw-explore-portal-mob"
            style={{ ["--mw-mob-i" as string]: String(index) }}
          >
            {label.emoji}
          </span>
        );
      })}
    </span>
  );
}

export function ExploreZonePicker() {
  const router = useRouter();
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const selectedExploreZoneId = useGameStore((s) => s.selectedExploreZoneId);
  const setSelectedExploreZone = useGameStore((s) => s.setSelectedExploreZone);
  const zones = listExploreZoneStates(unlockedIds);
  const [entering, setEntering] = useState<EnterTarget | null>(null);
  const enterTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (enterTimer.current != null) {
        window.clearTimeout(enterTimer.current);
      }
    };
  }, []);

  function chooseZone(zoneId: ExploreZoneId) {
    setSelectedExploreZone(zoneId);
  }

  function startEnter(target: EnterTarget, zoneId?: ExploreZoneId) {
    if (entering) return;
    if (zoneId) chooseZone(zoneId);
    // Always show a short spatial enter beat (MW-68). Reduced-motion only
    // shortens the dwell; CSS already disables the zoom keyframes.
    const dwell = prefersReducedMotion() ? 280 : ENTER_MS;
    setEntering(target);
    enterTimer.current = window.setTimeout(() => {
      router.push(target.href);
    }, dwell);
  }

  function handleZoneEnter(
    event: MouseEvent<HTMLAnchorElement>,
    zone: ExploreZone,
  ) {
    event.preventDefault();
    startEnter(
      {
        href: "/fight",
        nameCn: zone.nameCn,
        nameEn: zone.name,
        background: zone.background,
        tone: zone.tone,
      },
      zone.id,
    );
  }

  function handleVillageEnter(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    startEnter({
      href: "/trade",
      nameCn: "村庄",
      nameEn: "Village",
      background: backgroundMap.village,
      tone: "village",
    });
  }

  return (
    <section className="mw-explore mw-game-panel overflow-hidden">
      <header className="mw-explore-chrome relative z-[2] flex items-center justify-between gap-2">
        <div>
          <h1 className="mw-hub-title">
            <span className="mw-pixel-title text-primary">出门</span>
            <span className="mw-hub-title-sep" aria-hidden>
              ·
            </span>
            <span>走进区域</span>
          </h1>
          <p className="mw-explore-sub">看一眼里面有谁 · 走进去开口打怪</p>
        </div>
        <Link href="/" className="mw-explore-back">
          回基地
        </Link>
      </header>

      <WeaponGoalStrip variant="hub" className="relative z-[2]" hideCta />

      <div className="mw-explore-stage-wrap relative z-[1]">
        <div className="mw-explore-stage" role="list" aria-label="探索区域">
          <div className="mw-explore-sky" aria-hidden>
            <span className="mw-hub-sun" />
            <span className="mw-hub-cloud mw-hub-cloud-a" />
            <span className="mw-hub-cloud mw-hub-cloud-b" />
          </div>

          <div className="mw-explore-portals">
            {zones.map(({ zone, unlocked, lockCn, lockEn }) => {
              const selected = selectedExploreZoneId === zone.id;
              // Tone wash lives in CSS (::after); keep art readable under a light veil only.
              const style = {
                backgroundImage: `url(${zone.background})`,
              };

              if (!unlocked) {
                return (
                  <div
                    key={zone.id}
                    role="listitem"
                    className={`mw-explore-portal mw-explore-portal-locked mw-explore-portal-${zone.tone}`}
                    style={style}
                    aria-disabled="true"
                  >
                    <ZoneScenePreview
                      monsterIds={zone.wildMonsterIds}
                      locked
                    />
                    <span className="mw-explore-portal-lock" aria-hidden>
                      🔒
                    </span>
                    <span className="mw-explore-portal-name">
                      {zone.nameCn}
                      <span className="mw-explore-portal-en">{zone.name}</span>
                    </span>
                    <span className="mw-explore-portal-req">
                      {lockCn}
                      <span className="mw-explore-portal-req-en">{lockEn}</span>
                    </span>
                    <span className="mw-explore-portal-focus">
                      掉落偏 {zone.focusLabelCn}
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={zone.id}
                  href="/fight"
                  role="listitem"
                  onClick={(event) => handleZoneEnter(event, zone)}
                  className={`mw-explore-portal mw-explore-portal-open mw-explore-portal-${zone.tone} ${
                    selected ? "mw-explore-portal-selected" : ""
                  }`}
                  style={style}
                >
                  <ZoneScenePreview monsterIds={zone.wildMonsterIds} />
                  <span className="mw-explore-portal-name">
                    {zone.nameCn}
                    <span className="mw-explore-portal-en">{zone.name}</span>
                  </span>
                  <span className="mw-explore-portal-blurb">{zone.blurbCn}</span>
                  <span className="mw-explore-portal-focus">
                    掉落偏 {zone.focusLabelCn} · {zone.blurbEn}
                  </span>
                  <span className="mw-explore-portal-cta">走进去打怪 →</span>
                </Link>
              );
            })}

            {/*
              MW-58 / P1-2 + light P2-1: spatial「出门到村」entry.
              Deep chat already lives on /trade; this portal matches Hub「找村民」language
              instead of treating village as a separate map-only island.
            */}
            <Link
              href="/trade"
              role="listitem"
              onClick={handleVillageEnter}
              className="mw-explore-portal mw-explore-portal-open mw-explore-portal-village mw-explore-portal-village-row"
              style={{ backgroundImage: `url(${backgroundMap.village})` }}
            >
              <span className="mw-explore-village-art" aria-hidden>
                <span className="mw-hub-villager">
                  <span className="mw-hub-villager-head" />
                  <span className="mw-hub-villager-body" />
                </span>
              </span>
              <span className="mw-explore-portal-name">
                村庄
                <span className="mw-explore-portal-en">Village</span>
              </span>
              <span className="mw-explore-portal-blurb">
                找村民 · 深聊再开口交易
              </span>
              <span className="mw-explore-portal-focus">
                和基地「找村民」同一条开口路
              </span>
              <span className="mw-explore-portal-cta mw-explore-portal-cta-village">
                走进村庄 →
              </span>
            </Link>
          </div>
        </div>
      </div>

      <p className="mw-explore-hint relative z-[2]" role="status">
        木阶森林 → 洞穴 → 矿洞 → 钻石矿脉（铁剑解锁）。村庄随时可去找村民深聊交易。
      </p>

      {entering ? (
        <div
          className={`mw-explore-enter mw-explore-enter-${entering.tone}`}
          style={{ backgroundImage: `url(${entering.background})` }}
          role="status"
          aria-live="polite"
        >
          <div className="mw-explore-enter-veil" />
          <p className="mw-explore-enter-label">
            走进 {entering.nameCn}
            <span className="mw-explore-enter-en">{entering.nameEn}</span>
          </p>
        </div>
      ) : null}
    </section>
  );
}
