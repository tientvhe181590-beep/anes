import type { DashboardMacros } from '../types/dashboard.types';

interface MacrosSummaryProps {
  macros: DashboardMacros;
}

const items: { key: keyof DashboardMacros; label: string; color: string }[] = [
  { key: 'protein', label: 'Protein', color: 'var(--accent)' },
  { key: 'carbs', label: 'Carbs', color: 'var(--positive)' },
  { key: 'fat', label: 'Fat', color: 'var(--warning)' },
];

export function MacrosSummary({ macros }: MacrosSummaryProps) {
  return (
    <div className="flex justify-between gap-2">
      {items.map(({ key, label, color }) => (
        <div
          key={key}
          className="flex flex-1 flex-col items-center rounded-xl bg-[var(--surface-elevated)] px-3 py-3"
        >
          <span className="text-lg font-bold" style={{ color }}>
            {Math.round(macros[key])}g
          </span>
          <span className="text-xs text-[var(--text-secondary)]">{label}</span>
        </div>
      ))}
    </div>
  );
}
