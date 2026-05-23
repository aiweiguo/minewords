import { ProgressBar } from "@/components/ProgressBar";

type StatCardProps = {
  playerName: string;
  level: number;
  xp: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  percent: number;
};

export function StatCard({
  playerName,
  level,
  xp,
  currentLevelXp,
  xpForNextLevel,
  percent,
}: StatCardProps) {
  return (
    <section className="mw-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-secondary">MineEnglish Quest</p>
          <h1 className="mt-1 text-3xl font-black text-primary">MineWords</h1>
          <p className="mt-2 text-lg font-bold">{playerName}</p>
        </div>
        <div className="rounded-2xl bg-primary px-4 py-3 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-wide">Level</p>
          <p className="text-3xl font-black">{level}</p>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar
          percent={percent}
          label={`XP: ${currentLevelXp} / ${xpForNextLevel} (Total ${xp})`}
        />
      </div>
    </section>
  );
}
