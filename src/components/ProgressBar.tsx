interface ProgressBarProps {
  current: number;
  total: number;
  labels?: string[];
}

export function ProgressBar({ current, total, labels }: ProgressBarProps) {
  const pct = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {labels &&
          labels.map((label, i) => (
            <span
              key={i}
              className={`text-[10px] font-medium transition-colors duration-300 ${
                i + 1 <= current ? 'text-gold-400' : 'text-white/30'
              }`}
            >
              {label}
            </span>
          ))}
      </div>
      <div className="h-1.5 w-full bg-ink-600 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
