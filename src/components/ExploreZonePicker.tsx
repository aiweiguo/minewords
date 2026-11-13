"use client";

import Link from "next/link";

import { WeaponGoalStrip } from "@/components/WeaponGoalStrip";
import { ExploreZoneId } from "@/data/exploreZones";
import { listExploreZoneStates } from "@/lib/exploreZones";
import { useGameStore } from "@/store/useGameStore";

export function ExploreZonePicker() {
  const unlockedIds = useGameStore((s) => s.unlockedIds);
  const selectedExploreZoneId = useGameStore((s) => s.selectedExploreZoneId);
  const setSelectedExploreZone = useGameStore((s) => s.setSelectedExploreZone);
  const zones = listExploreZoneStates(unlockedIds);

  function chooseZone(zoneId: ExploreZoneId) {
    setSelectedExploreZone(zoneId);
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
            <span>选区域</span>
          </h1>
          <p className="mw-explore-sub">打怪攒材料 · 喂当前武器目标</p>
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
                  onClick={() => chooseZone(zone.id)}
                  className={`mw-explore-portal mw-explore-portal-open mw-explore-portal-${zone.tone} ${
                    selected ? "mw-explore-portal-selected" : ""
                  }`}
                  style={style}
                >
                  <span className="mw-explore-portal-name">
                    {zone.nameCn}
                    <span className="mw-explore-portal-en">{zone.name}</span>
                  </span>
                  <span className="mw-explore-portal-blurb">{zone.blurbCn}</span>
                  <span className="mw-explore-portal-focus">
                    掉落偏 {zone.focusLabelCn} · {zone.blurbEn}
                  </span>
                  <span className="mw-explore-portal-cta">进入打怪 →</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mw-explore-hint relative z-[2]" role="status">
        木阶森林 → 洞穴 → 矿洞 → 钻石矿脉（铁剑解锁）。同一只怪说得越完整，伤害越大。
      </p>
    </section>
  );
}
