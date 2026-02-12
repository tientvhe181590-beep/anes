import type { OnboardingData, MuscleGroup } from '../types/onboarding.types';

interface StepFocusAreaProps {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  getError: (field: string) => string | null;
}

const muscleGroups: { id: MuscleGroup; label: string; emoji: string }[] = [
  { id: 'Chest', label: 'Chest', emoji: '🫁' },
  { id: 'Back', label: 'Back', emoji: '🔙' },
  { id: 'Shoulders', label: 'Shoulders', emoji: '🤷' },
  { id: 'Arms', label: 'Arms', emoji: '💪' },
  { id: 'Core', label: 'Core', emoji: '🎯' },
  { id: 'Legs', label: 'Legs', emoji: '🦵' },
];

export function StepFocusArea({ data, updateData, getError }: StepFocusAreaProps) {
  const selected = data.targetMuscleGroups;

  function toggle(group: MuscleGroup) {
    const next = selected.includes(group)
      ? selected.filter((g) => g !== group)
      : [...selected, group];
    updateData({ targetMuscleGroups: next });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Focus areas</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Tap the muscle groups you want to focus on
        </p>
      </div>

      {/* SVG Body visualization */}
      <div className="flex justify-center">
        <svg viewBox="0 0 200 400" className="h-64 w-auto" aria-label="Body muscle group selector">
          {/* Body outline */}
          <ellipse
            cx="100"
            cy="40"
            rx="25"
            ry="30"
            fill="var(--surface-elevated)"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
          />
          {/* Neck */}
          <rect
            x="90"
            y="68"
            width="20"
            height="12"
            rx="4"
            fill="var(--surface-elevated)"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
          />

          {/* Shoulders - clickable */}
          <rect
            x="42"
            y="80"
            width="28"
            height="22"
            rx="8"
            fill={selected.includes('Shoulders') ? 'var(--accent-soft)' : 'var(--surface-elevated)'}
            stroke={selected.includes('Shoulders') ? 'var(--accent)' : 'var(--border-strong)'}
            strokeWidth="1.5"
            className="cursor-pointer transition-colors"
            style={
              selected.includes('Shoulders') ? { filter: 'drop-shadow(0 0 6px var(--accent))' } : {}
            }
            onClick={() => toggle('Shoulders')}
          />
          <rect
            x="130"
            y="80"
            width="28"
            height="22"
            rx="8"
            fill={selected.includes('Shoulders') ? 'var(--accent-soft)' : 'var(--surface-elevated)'}
            stroke={selected.includes('Shoulders') ? 'var(--accent)' : 'var(--border-strong)'}
            strokeWidth="1.5"
            className="cursor-pointer transition-colors"
            style={
              selected.includes('Shoulders') ? { filter: 'drop-shadow(0 0 6px var(--accent))' } : {}
            }
            onClick={() => toggle('Shoulders')}
          />

          {/* Chest - clickable */}
          <rect
            x="70"
            y="80"
            width="60"
            height="40"
            rx="8"
            fill={selected.includes('Chest') ? 'var(--accent-soft)' : 'var(--surface-elevated)'}
            stroke={selected.includes('Chest') ? 'var(--accent)' : 'var(--border-strong)'}
            strokeWidth="1.5"
            className="cursor-pointer transition-colors"
            style={
              selected.includes('Chest') ? { filter: 'drop-shadow(0 0 6px var(--accent))' } : {}
            }
            onClick={() => toggle('Chest')}
          />

          {/* Arms - clickable */}
          <rect
            x="35"
            y="104"
            width="22"
            height="60"
            rx="10"
            fill={selected.includes('Arms') ? 'var(--accent-soft)' : 'var(--surface-elevated)'}
            stroke={selected.includes('Arms') ? 'var(--accent)' : 'var(--border-strong)'}
            strokeWidth="1.5"
            className="cursor-pointer transition-colors"
            style={
              selected.includes('Arms') ? { filter: 'drop-shadow(0 0 6px var(--accent))' } : {}
            }
            onClick={() => toggle('Arms')}
          />
          <rect
            x="143"
            y="104"
            width="22"
            height="60"
            rx="10"
            fill={selected.includes('Arms') ? 'var(--accent-soft)' : 'var(--surface-elevated)'}
            stroke={selected.includes('Arms') ? 'var(--accent)' : 'var(--border-strong)'}
            strokeWidth="1.5"
            className="cursor-pointer transition-colors"
            style={
              selected.includes('Arms') ? { filter: 'drop-shadow(0 0 6px var(--accent))' } : {}
            }
            onClick={() => toggle('Arms')}
          />

          {/* Core - clickable */}
          <rect
            x="72"
            y="122"
            width="56"
            height="50"
            rx="6"
            fill={selected.includes('Core') ? 'var(--accent-soft)' : 'var(--surface-elevated)'}
            stroke={selected.includes('Core') ? 'var(--accent)' : 'var(--border-strong)'}
            strokeWidth="1.5"
            className="cursor-pointer transition-colors"
            style={
              selected.includes('Core') ? { filter: 'drop-shadow(0 0 6px var(--accent))' } : {}
            }
            onClick={() => toggle('Core')}
          />

          {/* Back - clickable (shown as mid-torso area) */}
          <rect
            x="72"
            y="172"
            width="56"
            height="30"
            rx="6"
            fill={selected.includes('Back') ? 'var(--accent-soft)' : 'var(--surface-elevated)'}
            stroke={selected.includes('Back') ? 'var(--accent)' : 'var(--border-strong)'}
            strokeWidth="1.5"
            className="cursor-pointer transition-colors"
            style={
              selected.includes('Back') ? { filter: 'drop-shadow(0 0 6px var(--accent))' } : {}
            }
            onClick={() => toggle('Back')}
          />

          {/* Legs - clickable */}
          <rect
            x="66"
            y="206"
            width="28"
            height="90"
            rx="12"
            fill={selected.includes('Legs') ? 'var(--accent-soft)' : 'var(--surface-elevated)'}
            stroke={selected.includes('Legs') ? 'var(--accent)' : 'var(--border-strong)'}
            strokeWidth="1.5"
            className="cursor-pointer transition-colors"
            style={
              selected.includes('Legs') ? { filter: 'drop-shadow(0 0 6px var(--accent))' } : {}
            }
            onClick={() => toggle('Legs')}
          />
          <rect
            x="106"
            y="206"
            width="28"
            height="90"
            rx="12"
            fill={selected.includes('Legs') ? 'var(--accent-soft)' : 'var(--surface-elevated)'}
            stroke={selected.includes('Legs') ? 'var(--accent)' : 'var(--border-strong)'}
            strokeWidth="1.5"
            className="cursor-pointer transition-colors"
            style={
              selected.includes('Legs') ? { filter: 'drop-shadow(0 0 6px var(--accent))' } : {}
            }
            onClick={() => toggle('Legs')}
          />

          {/* Feet */}
          <ellipse
            cx="80"
            cy="302"
            rx="14"
            ry="8"
            fill="var(--surface-elevated)"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
          />
          <ellipse
            cx="120"
            cy="302"
            rx="14"
            ry="8"
            fill="var(--surface-elevated)"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
          />

          {/* Labels */}
          {selected.includes('Shoulders') && (
            <text
              x="100"
              y="95"
              textAnchor="middle"
              fill="var(--accent)"
              fontSize="8"
              fontWeight="bold"
            >
              SHOULDERS
            </text>
          )}
          {selected.includes('Chest') && (
            <text
              x="100"
              y="104"
              textAnchor="middle"
              fill="var(--accent)"
              fontSize="8"
              fontWeight="bold"
            >
              CHEST
            </text>
          )}
          {selected.includes('Arms') && (
            <text x="100" y="138" textAnchor="middle" fill="var(--accent)" fontSize="0" />
          )}
          {selected.includes('Core') && (
            <text
              x="100"
              y="151"
              textAnchor="middle"
              fill="var(--accent)"
              fontSize="8"
              fontWeight="bold"
            >
              CORE
            </text>
          )}
          {selected.includes('Back') && (
            <text
              x="100"
              y="191"
              textAnchor="middle"
              fill="var(--accent)"
              fontSize="8"
              fontWeight="bold"
            >
              BACK
            </text>
          )}
          {selected.includes('Legs') && (
            <text
              x="100"
              y="255"
              textAnchor="middle"
              fill="var(--accent)"
              fontSize="8"
              fontWeight="bold"
            >
              LEGS
            </text>
          )}
        </svg>
      </div>

      {/* Toggle chips below the body for accessibility */}
      <div className="flex flex-wrap justify-center gap-2">
        {muscleGroups.map((group) => {
          const active = selected.includes(group.id);
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => toggle(group.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
              }`}
              style={active ? { boxShadow: '0 0 8px var(--accent)' } : {}}
            >
              {group.emoji} {group.label}
            </button>
          );
        })}
      </div>

      {getError('targetMuscleGroups') && (
        <p className="text-center text-xs text-[var(--negative)]" role="alert">
          {getError('targetMuscleGroups')}
        </p>
      )}
    </div>
  );
}
