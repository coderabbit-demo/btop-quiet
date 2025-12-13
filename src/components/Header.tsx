interface HeaderProps {
  hostname: string;
  platform: string;
  arch: string;
  uptime: number;
  loadAvg: number[];
  processCount: number;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);

  return parts.join(' ');
}

export function Header({ hostname, platform, arch, uptime, loadAvg, processCount }: HeaderProps) {
  return (
    <div className="header">
      <div className="header-left">
        <span className="logo">
          <span className="logo-b">b</span>
          <span className="logo-top">top</span>
        </span>
        <span className="host-info">
          <span className="hostname">{hostname}</span>
          <span className="platform">{platform}/{arch}</span>
        </span>
      </div>
      <div className="header-center">
        <span className="uptime">
          Uptime: <span className="value">{formatUptime(uptime)}</span>
        </span>
      </div>
      <div className="header-right">
        <span className="load-avg">
          Load: <span className="value">{loadAvg.map(l => l.toFixed(2)).join(' ')}</span>
        </span>
        <span className="proc-count">
          Tasks: <span className="value">{processCount}</span>
        </span>
      </div>
    </div>
  );
}
