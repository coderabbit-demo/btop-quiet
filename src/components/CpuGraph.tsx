import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { CpuUsage } from '../types';

interface CpuGraphProps {
  cpuUsage: CpuUsage[];
}

interface HistoryPoint {
  time: number;
  [key: string]: number;
}

const HISTORY_LENGTH = 60;
const COLORS = [
  '#f472b6', // pink
  '#a78bfa', // purple
  '#60a5fa', // blue
  '#34d399', // green
  '#fbbf24', // yellow
  '#fb923c', // orange
  '#f87171', // red
  '#2dd4bf', // teal
  '#e879f9', // fuchsia
  '#38bdf8', // sky
  '#a3e635', // lime
  '#facc15', // amber
];

export function CpuGraph({ cpuUsage }: CpuGraphProps) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    const newPoint: HistoryPoint = { time: Date.now() };
    cpuUsage.forEach((cpu) => {
      newPoint[`cpu${cpu.core}`] = cpu.usage;
    });

    setHistory((prev) => {
      const updated = [...prev, newPoint];
      if (updated.length > HISTORY_LENGTH) {
        return updated.slice(-HISTORY_LENGTH);
      }
      return updated;
    });
  }, [cpuUsage]);

  const avgUsage = cpuUsage.length > 0
    ? Math.round(cpuUsage.reduce((sum, cpu) => sum + cpu.usage, 0) / cpuUsage.length)
    : 0;

  return (
    <div className="cpu-graph">
      <div className="graph-header">
        <span className="graph-title">CPU</span>
        <span className="graph-value" style={{ color: getUsageColor(avgUsage) }}>
          {avgUsage}%
        </span>
      </div>
      <div className="graph-container">
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              {cpuUsage.map((cpu, i) => (
                <linearGradient key={cpu.core} id={`cpuGradient${cpu.core}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.1} />
                </linearGradient>
              ))}
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
              formatter={(value: number, name: string) => [
                `${value}%`,
                name.replace('cpu', 'Core '),
              ]}
            />
            {cpuUsage.map((cpu, i) => (
              <Area
                key={cpu.core}
                type="linear"
                dataKey={`cpu${cpu.core}`}
                stroke={COLORS[i % COLORS.length]}
                fill={`url(#cpuGradient${cpu.core})`}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="cpu-cores-grid">
        {cpuUsage.map((cpu, i) => (
          <div key={cpu.core} className="core-indicator">
            <div
              className="core-bar"
              style={{
                background: `linear-gradient(to right, ${COLORS[i % COLORS.length]} ${cpu.usage}%, transparent ${cpu.usage}%)`,
              }}
            />
            <span className="core-label" style={{ color: COLORS[i % COLORS.length] }}>
              {cpu.core}
            </span>
            <span className="core-value">{cpu.usage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getUsageColor(usage: number): string {
  if (usage < 30) return '#34d399';
  if (usage < 60) return '#fbbf24';
  if (usage < 85) return '#fb923c';
  return '#f87171';
}
