import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeeklyCalendarWidgetProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function WeeklyCalendarWidget({ selectedIndex, onSelect }: WeeklyCalendarWidgetProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="mb-2 w-full">
      <div className="mb-4 flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">February 2026</h2>
        <div className="flex gap-2">
          <button className="cursor-pointer rounded-full p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="cursor-pointer rounded-full p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const isActive = index === selectedIndex;
          const isPast = index < selectedIndex; // Mock past checks
          const dayNum = 2 + index;

          return (
            <div
              key={day}
              onClick={() => onSelect(index)}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border py-3 transition-all ${
                isActive
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-lg shadow-red-900/20'
                  : 'border-transparent bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
              } `}
            >
              <span className="mb-1 text-[10px] font-semibold tracking-wider uppercase opacity-80">
                {day}
              </span>
              <span
                className={`text-base font-bold ${isActive ? 'text-white' : 'text-[var(--text-primary)]'}`}
              >
                {dayNum}
              </span>

              {/* Indicator Dot */}
              <div
                className={`mt-1.5 h-1.5 w-1.5 rounded-full ${isActive ? 'bg-white' : isPast ? 'bg-[var(--accent)]' : 'bg-transparent'} `}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
