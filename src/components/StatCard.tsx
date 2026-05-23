import { GameIcon } from "@/components/GameIcon";
import { ProgressBar } from "@/components/ProgressBar";
import { assetMap } from "@/lib/assets";

type StatCardProps = {
  playerName: string;
  level: number;
  xp: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  percent: number;
  embedded?: boolean;
};

export function StatCard({
  playerName,
  level,
  xp,
  currentLevelXp,
  xpForNextLevel,
  percent,
  embedded = false,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          {!embedded ? (
            <>
              <p className="text-sm font-semibold text-secondary">MineEnglish Quest</p>
              <h1 className="mt-1 text-3xl font-black text-primary">MineWords</h1>
              <p className="mt-2 text-lg font-bold">{playerName}</p>
            </>
          ) : (
            <p className="text-sm font-bold text-muted">Level Progress 等级进度</p>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-lg border-2 border-[var(--panel-wood)] bg-black/30 px-4 py-3 text-center">
          <GameIcon src={assetMap.star} alt="Level" size="sm" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Level</p>
            <p className="text-3xl font-black text-primary">{level}</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar
          percent={percent}
          label={`XP: ${currentLevelXp} / ${xpForNextLevel} (Total ${xp})`}
        />
      </div>
    </>
  );

  if (embedded) {
    return <div className="border-t border-[var(--panel-wood)] p-5">{content}</div>;
  }

  return <section className="mw-card p-5">{content}</section>;
}
