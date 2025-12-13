interface StatusBarProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  refreshRate: number;
  onRefreshRateChange: (rate: number) => void;
}

export function StatusBar({ filter, onFilterChange, refreshRate, onRefreshRateChange }: StatusBarProps) {
  const shortcuts = [
    { key: 'F1', label: 'Help' },
    { key: 'F2', label: 'Setup' },
    { key: 'F3', label: 'Search' },
    { key: 'F4', label: 'Filter' },
    { key: 'F5', label: 'Tree' },
    { key: 'F6', label: 'Sort' },
    { key: 'F9', label: 'Kill' },
    { key: 'F10', label: 'Quit' },
  ];

  return (
    <div className="status-bar">
      <div className="filter-section">
        <span className="filter-label">Filter:</span>
        <input
          type="text"
          className="filter-input"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Type to filter..."
        />
      </div>
      <div className="refresh-section">
        <span className="refresh-label">Refresh:</span>
        <select
          className="refresh-select"
          value={refreshRate}
          onChange={(e) => onRefreshRateChange(Number(e.target.value))}
        >
          <option value={500}>0.5s</option>
          <option value={1000}>1s</option>
          <option value={2000}>2s</option>
          <option value={5000}>5s</option>
        </select>
      </div>
      <div className="shortcuts">
        {shortcuts.map(({ key, label }) => (
          <span key={key} className="shortcut">
            <span className="shortcut-key">{key}</span>
            <span className="shortcut-label">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
