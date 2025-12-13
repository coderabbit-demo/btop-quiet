import { useState, useMemo } from 'react';
import type { ProcessInfo, SortField, SortDirection } from '../types';

interface ProcessTableProps {
  processes: ProcessInfo[];
  filter: string;
}

export function ProcessTable({ processes, filter }: ProcessTableProps) {
  const [sortField, setSortField] = useState<SortField>('cpu');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedProcesses = useMemo(() => {
    let filtered = processes;

    if (filter) {
      const lowerFilter = filter.toLowerCase();
      filtered = processes.filter(
        p =>
          p.command.toLowerCase().includes(lowerFilter) ||
          p.user.toLowerCase().includes(lowerFilter) ||
          p.pid.toString().includes(filter)
      );
    }

    return [...filtered].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'pid':
          aVal = a.pid;
          bVal = b.pid;
          break;
        case 'user':
          aVal = a.user;
          bVal = b.user;
          break;
        case 'cpu':
          aVal = a.cpu;
          bVal = b.cpu;
          break;
        case 'mem':
          aVal = a.mem;
          bVal = b.mem;
          break;
        case 'command':
          aVal = a.command;
          bVal = b.command;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [processes, filter, sortField, sortDirection]);

  const getSortIndicator = (field: SortField): string => {
    if (sortField !== field) return ' ';
    return sortDirection === 'asc' ? '▲' : '▼';
  };

  const getCpuColor = (cpu: number): string => {
    if (cpu < 10) return 'var(--color-text)';
    if (cpu < 30) return 'var(--color-green)';
    if (cpu < 60) return 'var(--color-yellow)';
    if (cpu < 85) return 'var(--color-orange)';
    return 'var(--color-red)';
  };

  const getMemColor = (mem: number): string => {
    if (mem < 5) return 'var(--color-text)';
    if (mem < 15) return 'var(--color-green)';
    if (mem < 30) return 'var(--color-yellow)';
    if (mem < 50) return 'var(--color-orange)';
    return 'var(--color-red)';
  };

  return (
    <div className="process-table">
      <div className="table-header">
        <span
          className="col-pid sortable"
          onClick={() => handleSort('pid')}
        >
          PID{getSortIndicator('pid')}
        </span>
        <span
          className="col-user sortable"
          onClick={() => handleSort('user')}
        >
          USER{getSortIndicator('user')}
        </span>
        <span
          className="col-cpu sortable"
          onClick={() => handleSort('cpu')}
        >
          CPU%{getSortIndicator('cpu')}
        </span>
        <span
          className="col-mem sortable"
          onClick={() => handleSort('mem')}
        >
          MEM%{getSortIndicator('mem')}
        </span>
        <span className="col-virt">VIRT</span>
        <span className="col-res">RES</span>
        <span className="col-state">S</span>
        <span className="col-time">TIME</span>
        <span
          className="col-command sortable"
          onClick={() => handleSort('command')}
        >
          COMMAND{getSortIndicator('command')}
        </span>
      </div>
      <div className="table-body">
        {filteredAndSortedProcesses.map((process) => (
          <div
            key={process.pid}
            className={`table-row ${selectedPid === process.pid ? 'selected' : ''}`}
            onClick={() => setSelectedPid(process.pid === selectedPid ? null : process.pid)}
          >
            <span className="col-pid">{process.pid}</span>
            <span className="col-user">{process.user.substring(0, 8)}</span>
            <span className="col-cpu" style={{ color: getCpuColor(process.cpu) }}>
              {process.cpu.toFixed(1).padStart(5, ' ')}
            </span>
            <span className="col-mem" style={{ color: getMemColor(process.mem) }}>
              {process.mem.toFixed(1).padStart(5, ' ')}
            </span>
            <span className="col-virt">{process.vsz}</span>
            <span className="col-res">{process.rss}</span>
            <span className="col-state">{process.stat.charAt(0)}</span>
            <span className="col-time">{process.time}</span>
            <span className="col-command">{process.command}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
