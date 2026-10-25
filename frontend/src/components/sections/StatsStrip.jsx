import React from 'react';
import MetricTile from '../ui/MetricTile';

export function StatsStrip() {
  const stats = [
    { value: '8', label: 'TYPES OF CHANGE IT CAN NAME', color: 'text-text' },
    { value: 'About 10 sec', label: 'TO GET RESULTS', color: 'text-text' },
    { value: '2 photos', label: 'IS ALL YOU NEED', color: 'text-accent' },
    { value: 'PDF', label: 'REPORT YOU CAN DOWNLOAD', color: 'text-text' },
  ];

  return (
    <section className="w-full bg-surface border-b border-line">
      <div className="max-w-[76rem] mx-auto grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-line">
        {stats.map((s, idx) => (
          <div key={idx} className="p-6 md:p-8">
            <MetricTile
              value={s.value}
              label={s.label}
              valueColor={s.color}
              size="lg"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsStrip;
