type ProgressBarProps = {
  percent: number;
  label?: string;
};

export function ProgressBar({ percent, label }: ProgressBarProps) {
  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="w-full">
      {label ? (
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-muted">
          <span>{label}</span>
          <span>{safePercent}%</span>
        </div>
      ) : null}
      <div className="h-4 w-full overflow-hidden rounded-full border-2 border-[#c7d4b4] bg-white">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}
