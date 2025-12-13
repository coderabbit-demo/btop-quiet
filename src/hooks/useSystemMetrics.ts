import { useState, useEffect, useCallback } from 'react';
import type { SystemMetrics } from '../types';

const API_URL = 'http://localhost:3001/api/metrics';

interface UseSystemMetricsResult {
  metrics: SystemMetrics | null;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useSystemMetrics(refreshRate: number): UseSystemMetricsResult {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshRate);
    return () => clearInterval(interval);
  }, [fetchMetrics, refreshRate]);

  return { metrics, error, loading, refresh: fetchMetrics };
}
