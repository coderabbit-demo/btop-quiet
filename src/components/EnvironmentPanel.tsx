import { useState, useEffect, useMemo } from 'react';

interface EnvVariable {
  name: string;
  value: string;
}

interface EnvironmentPanelProps {
  filter?: string;
}

export function EnvironmentPanel({ filter = '' }: EnvironmentPanelProps) {
  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchEnvironment() {
      try {
        const response = await fetch('http://localhost:3001/api/environment');
        const data = await response.json();
        setEnvVars(data.variables);
      } catch (error) {
        console.error('Failed to fetch environment variables:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEnvironment();
  }, []);

  const filteredVars = useMemo(() => {
    if (!filter) return envVars;
    const lowerFilter = filter.toLowerCase();
    return envVars.filter(
      v =>
        v.name.toLowerCase().includes(lowerFilter) ||
        v.value.toLowerCase().includes(lowerFilter)
    );
  }, [envVars, filter]);

  const displayVars = expanded ? filteredVars : filteredVars.slice(0, 10);

  if (loading) {
    return (
      <div className="env-panel">
        <div className="env-header">
          <span className="env-title">Environment Variables</span>
        </div>
        <div className="env-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="env-panel">
      <div className="env-header">
        <span className="env-title">Environment Variables</span>
        <span className="env-count">{filteredVars.length} variables</span>
      </div>
      <div className="env-list">
        {displayVars.map((envVar) => (
          <div key={envVar.name} className="env-row">
            <span className="env-name">{envVar.name}</span>
            <span className="env-value">{envVar.value}</span>
          </div>
        ))}
      </div>
      {filteredVars.length > 10 && (
        <button
          className="env-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : `Show all ${filteredVars.length} variables`}
        </button>
      )}
    </div>
  );
}
