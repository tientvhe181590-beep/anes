import { Play, Clock, Zap } from 'lucide-react';

interface WorkoutCardProps {
  id: string;
  title: string;
  durationMinutes: number;
  intensity: string;
  onStart: (id: string) => void;
}

export function WorkoutCard({ id, title, durationMinutes, intensity, onStart }: WorkoutCardProps) {
  return (
    <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
          <p className="text-[var(--text-secondary)]">Today's Session</p>
        </div>
        <div className="rounded-full bg-[var(--surface-elevated)] p-2 text-[var(--accent)]">
          <Play className="h-5 w-5 fill-current" />
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{durationMinutes} min</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Zap className="h-4 w-4" />
          <span className="text-sm">{intensity} Intensity</span>
        </div>
      </div>

      <button
        onClick={() => onStart(id)}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-3 font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        Start Workout
      </button>
    </div>
  );
}
