import type { WeekDayEntry } from '../types/dashboard.types';

interface WeekScheduleBarProps {
  schedule: WeekDayEntry[];
}

export function WeekScheduleBar({ schedule }: WeekScheduleBarProps) {
  return (
    <div className="flex justify-between gap-1">
      {schedule.map((entry) => (
        <div key={entry.day} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-medium text-[var(--text-secondary)]">{entry.day}</span>
          <DayIndicator status={entry.status} />
        </div>
      ))}
    </div>
  );
}

function DayIndicator({ status }: { status: WeekDayEntry['status'] }) {
  const base = 'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold';

  switch (status) {
    case 'completed':
      return <div className={`${base} bg-[var(--positive)]/20 text-[var(--positive)]`}>✓</div>;
    case 'today':
      return (
        <div className={`${base} border-2 border-[var(--accent)] text-[var(--accent)]`}>•</div>
      );
    case 'rest':
      return <div className={`${base} text-[var(--text-muted)]`}>—</div>;
    case 'upcoming':
    default:
      return (
        <div className={`${base} bg-[var(--surface-elevated)] text-[var(--text-muted)]`}>•</div>
      );
  }
}
