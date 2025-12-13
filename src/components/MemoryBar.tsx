interface MemoryBarProps {
  label: string;
  used: number;
  total: number;
  percent: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'K', 'M', 'G', 'T'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
}

export function MemoryBar({ label, used, total, percent }: MemoryBarProps) {
  const getBarColor = (usage: number): string => {
    if (usage < 50) return 'var(--color-green)';
    if (usage < 75) return 'var(--color-yellow)';
    if (usage < 90) return 'var(--color-orange)';
    return 'var(--color-red)';
  };

  const renderBar = (usage: number, maxBlocks: number = 30): string => {
    const filled = Math.round((usage / 100) * maxBlocks);
    const blocks = '|'.repeat(filled);
    const empty = ' '.repeat(maxBlocks - filled);
    return blocks + empty;
  };

  return (
    <div className="memory-bar">
      <span className="mem-label">{label}</span>
      <span className="bar-bracket">[</span>
      <span
        className="bar-fill"
        style={{ color: getBarColor(percent) }}
      >
        {renderBar(percent)}
      </span>
      <span className="bar-bracket">]</span>
      <span className="mem-info">
        {formatBytes(used)}/{formatBytes(total)}
      </span>
      <span className="mem-percent" style={{ color: getBarColor(percent) }}>
        {percent.toString().padStart(3, ' ')}%
      </span>
    </div>
  );
}
