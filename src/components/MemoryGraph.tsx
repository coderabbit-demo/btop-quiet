import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface MemoryGraphProps {
  used: number;
  total: number;
  percent: number;
}

interface HistoryPoint {
  time: number;
  used: number;
  percent: number;
}

const HISTORY_LENGTH = 60;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function MemoryGraph({ used, total, percent }: MemoryGraphProps) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    const newPoint: HistoryPoint = {
      time: Date.now(),
      used: used / (1024 * 1024 * 1024), // Convert to GB
      percent,
    };

    setHistory((prev) => {
      const updated = [...prev, newPoint];
      if (updated.length > HISTORY_LENGTH) {
        return updated.slice(-HISTORY_LENGTH);
      }
      return updated;
    });
  }, [used, percent]);

  const getMemoryColor = (pct: number): string => {
    if (pct < 50) return '#a78bfa';
    if (pct < 75) return '#fbbf24';
    if (pct < 90) return '#fb923c';
    return '#f87171';
  };

  const color = getMemoryColor(percent);

  return (
    <div className="memory-graph">
      <div className="graph-header">
        <span className="graph-title">Memory</span>
        <span className="graph-value" style={{ color }}>
          {percent}%
        </span>
      </div>
      <div className="graph-container">
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.7} />
                <stop offset="100%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              contentStyle={{
                background: 'rgba(22, 27, 34, 0.95)',
                border: '1px solid #30363d',
                borderRadius: '8px',
                fontSize: '11px',
              }}
              labelFormatter={() => ''}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Usage']}
            />
            <Area
              type="linear"
              dataKey="percent"
              stroke={color}
              fill="url(#memGradient)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="memory-details">
        <div className="memory-bar-container">
          <div
            className="memory-bar-fill"
            style={{
              width: `${percent}%`,
              background: `linear-gradient(90deg, ${color} 0%, ${color}88 100%)`,
              boxShadow: `0 0 20px ${color}66`,
            }}
          />
        </div>
        <div className="memory-stats">
          <span className="memory-stat">
            <span className="stat-label">Used</span>
            <span className="stat-value" style={{ color }}>{formatBytes(used)}</span>
          </span>
          <span className="memory-stat">
            <span className="stat-label">Total</span>
            <span className="stat-value">{formatBytes(total)}</span>
          </span>
          <span className="memory-stat">
            <span className="stat-label">Free</span>
            <span className="stat-value" style={{ color: '#34d399' }}>{formatBytes(total - used)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
