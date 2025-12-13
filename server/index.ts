import { cpus, totalmem, freemem, loadavg, hostname, uptime, platform, arch } from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface ProcessInfo {
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

interface CpuUsage {
  core: number;
  usage: number;
  user: number;
  system: number;
  idle: number;
}

interface SystemMetrics {
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

// Store previous CPU times for calculating usage
let prevCpuTimes: { user: number; nice: number; sys: number; idle: number; irq: number }[] = [];

function getCpuUsage(): CpuUsage[] {
  const cpuInfo = cpus();
  const usage: CpuUsage[] = [];

  cpuInfo.forEach((cpu, index) => {
    const total = cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
    const prev = prevCpuTimes[index];

    if (prev) {
      const prevTotal = prev.user + prev.nice + prev.sys + prev.idle + prev.irq;
      const totalDiff = total - prevTotal;
      const idleDiff = cpu.times.idle - prev.idle;
      const userDiff = cpu.times.user - prev.user;
      const sysDiff = cpu.times.sys - prev.sys;

      if (totalDiff > 0) {
        usage.push({
          core: index,
          usage: Math.round(((totalDiff - idleDiff) / totalDiff) * 100),
          user: Math.round((userDiff / totalDiff) * 100),
          system: Math.round((sysDiff / totalDiff) * 100),
          idle: Math.round((idleDiff / totalDiff) * 100),
        });
      } else {
        usage.push({ core: index, usage: 0, user: 0, system: 0, idle: 100 });
      }
    } else {
      // First run, estimate from current times
      const usagePercent = Math.round(((total - cpu.times.idle) / total) * 100);
      usage.push({
        core: index,
        usage: usagePercent,
        user: Math.round((cpu.times.user / total) * 100),
        system: Math.round((cpu.times.sys / total) * 100),
        idle: Math.round((cpu.times.idle / total) * 100),
      });
    }

    prevCpuTimes[index] = { ...cpu.times };
  });

  return usage;
}

async function getProcesses(): Promise<ProcessInfo[]> {
  const os = platform();
  let command: string;

  if (os === "darwin") {
    // macOS - use ps with specific format
    command = "ps aux -r | head -50";
  } else {
    // Linux
    command = "ps aux --sort=-%cpu | head -50";
  }

  try {
    const { stdout } = await execAsync(command);
    const lines = stdout.trim().split("\n");
    const processes: ProcessInfo[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length >= 11) {
        processes.push({
          user: parts[0],
          pid: parseInt(parts[1], 10),
          cpu: parseFloat(parts[2]),
          mem: parseFloat(parts[3]),
          vsz: formatBytes(parseInt(parts[4], 10) * 1024),
          rss: formatBytes(parseInt(parts[5], 10) * 1024),
          tty: parts[6],
          stat: parts[7],
          start: parts[8],
          time: parts[9],
          command: parts.slice(10).join(" ").substring(0, 80),
        });
      }
    }

    return processes;
  } catch (error) {
    console.error("Error getting processes:", error);
    return [];
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "K", "M", "G", "T"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
}

async function getMemoryInfo(): Promise<{ total: number; free: number; used: number; percent: number }> {
  const totalMemory = totalmem();
  const os = platform();

  if (os === "darwin") {
    // macOS: use vm_stat to get accurate available memory
    // freemem() only reports "free" pages, not inactive/purgeable which are also available
    try {
      const { stdout } = await execAsync("vm_stat");
      const lines = stdout.split("\n");

      // Parse page size
      const pageSizeMatch = lines[0].match(/page size of (\d+) bytes/);
      const pageSize = pageSizeMatch ? parseInt(pageSizeMatch[1], 10) : 16384;

      // Parse memory pages
      let freePages = 0;
      let inactivePages = 0;
      let purgeablePages = 0;
      let speculativePages = 0;

      for (const line of lines) {
        if (line.includes("Pages free:")) {
          freePages = parseInt(line.match(/(\d+)/)?.[1] || "0", 10);
        } else if (line.includes("Pages inactive:")) {
          inactivePages = parseInt(line.match(/(\d+)/)?.[1] || "0", 10);
        } else if (line.includes("Pages purgeable:")) {
          purgeablePages = parseInt(line.match(/(\d+)/)?.[1] || "0", 10);
        } else if (line.includes("Pages speculative:")) {
          speculativePages = parseInt(line.match(/(\d+)/)?.[1] || "0", 10);
        }
      }

      // Available memory = free + inactive + purgeable + speculative
      const availableMemory = (freePages + inactivePages + purgeablePages + speculativePages) * pageSize;
      const usedMemory = totalMemory - availableMemory;

      return {
        total: totalMemory,
        free: availableMemory,
        used: usedMemory,
        percent: Math.round((usedMemory / totalMemory) * 100),
      };
    } catch {
      // Fallback to freemem if vm_stat fails
    }
  } else if (os === "linux") {
    // Linux: read /proc/meminfo for MemAvailable
    try {
      const { stdout } = await execAsync("cat /proc/meminfo");
      const lines = stdout.split("\n");

      let memAvailable = 0;
      for (const line of lines) {
        if (line.startsWith("MemAvailable:")) {
          memAvailable = parseInt(line.match(/(\d+)/)?.[1] || "0", 10) * 1024; // Convert KB to bytes
          break;
        }
      }

      if (memAvailable > 0) {
        const usedMemory = totalMemory - memAvailable;
        return {
          total: totalMemory,
          free: memAvailable,
          used: usedMemory,
          percent: Math.round((usedMemory / totalMemory) * 100),
        };
      }
    } catch {
      // Fallback to freemem if /proc/meminfo fails
    }
  }

  // Fallback for other platforms
  const freeMemory = freemem();
  const usedMemory = totalMemory - freeMemory;
  return {
    total: totalMemory,
    free: freeMemory,
    used: usedMemory,
    percent: Math.round((usedMemory / totalMemory) * 100),
  };
}

async function getSystemMetrics(): Promise<SystemMetrics> {
  const cpuInfo = cpus();
  const memInfo = await getMemoryInfo();
  const processes = await getProcesses();

  return {
    hostname: hostname(),
    platform: platform(),
    arch: arch(),
    uptime: uptime(),
    loadAvg: loadavg(),
    cpuCount: cpuInfo.length,
    cpuModel: cpuInfo[0]?.model || "Unknown",
    cpuUsage: getCpuUsage(),
    totalMem: memInfo.total,
    freeMem: memInfo.free,
    usedMem: memInfo.used,
    memPercent: memInfo.percent,
    processes,
    processCount: processes.length,
    timestamp: Date.now(),
  };
}

const server = Bun.serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/api/metrics") {
      const metrics = await getSystemMetrics();
      return new Response(JSON.stringify(metrics), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
});

console.log(`🖥️  btop server running at http://localhost:${server.port}`);
