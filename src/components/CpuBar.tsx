import type { CpuUsage } from '../types';

interface CpuBarProps {
  cpu: CpuUsage;
}

export function CpuBar({ cpu }: CpuBarProps) {
  const getBarColor = (usage: number): string => {
    if (usage < 30) return 'var(--color-green)';
    if (usage < 60) return 'var(--color-yellow)';
    if (usage < 85) return 'var(--color-orange)';
    return 'var(--color-red)';
  };

  const renderBar = (usage: number, maxBlocks: number = 20): string => {
    const filled = Math.round((usage / 100) * maxBlocks);
    const blocks = '|'.repeat(filled);
    const empty = ' '.repeat(maxBlocks - filled);
    return blocks + empty;
  };

  return (
    <div className="cpu-bar">
      <span className="cpu-label">{cpu.core.toString().padStart(2, ' ')}</span>
      <span className="bar-bracket">[</span>
      <span
        className="bar-fill"
        style={{ color: getBarColor(cpu.usage) }}
      >
        {renderBar(cpu.usage)}
      </span>
      <span className="bar-bracket">]</span>
      <span className="cpu-percent" style={{ color: getBarColor(cpu.usage) }}>
        {cpu.usage.toString().padStart(3, ' ')}%
      </span>
    </div>
  );
}
