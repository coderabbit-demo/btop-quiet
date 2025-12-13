export interface ProcessInfo {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  vsz: string;
  rss: string;
  tty: string;
  stat: string;
  start: string;
  time: string;
  command: string;
}

export interface CpuUsage {
  core: number;
  usage: number;
  user: number;
  system: number;
  idle: number;
}

export interface SystemMetrics {
  hostname: string;
  platform: string;
  arch: string;
  uptime: number;
  loadAvg: number[];
  cpuCount: number;
  cpuModel: string;
  cpuUsage: CpuUsage[];
  totalMem: number;
  freeMem: number;
  usedMem: number;
  memPercent: number;
  processes: ProcessInfo[];
  processCount: number;
  timestamp: number;
}

export type SortField = 'pid' | 'user' | 'cpu' | 'mem' | 'command';
export type SortDirection = 'asc' | 'desc';
