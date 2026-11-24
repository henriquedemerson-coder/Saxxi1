export function ProgressBar({ value, height = 10 }: { value: number; height?: number }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div
      className="w-full rounded-full bg-secondary overflow-hidden relative"
      style={{ height }}
    >
      <div
        className="h-full bg-holo animate-shimmer rounded-full relative"
        style={{ width: `${v}%` }}
      >
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: "var(--progress-highlight)" }} />
      </div>
    </div>
  );
}
