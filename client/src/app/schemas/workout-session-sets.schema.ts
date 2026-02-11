import type { RxJsonSchema } from 'rxdb';

export interface WorkoutSessionSet {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  durationSec: number | null;
  completedAt: string | null;
  updatedAt: string;
  deleted: boolean;
}

export const workoutSessionSetsSchema: RxJsonSchema<WorkoutSessionSet> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    sessionExerciseId: { type: 'string', maxLength: 36 },
    setNumber: { type: 'number' },
    reps: { type: ['number', 'null'] },
    weightKg: { type: ['number', 'null'] },
    durationSec: { type: ['number', 'null'] },
    completedAt: { type: ['string', 'null'], format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 30 },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'sessionExerciseId', 'setNumber', 'updatedAt', 'deleted'],
  indexes: ['sessionExerciseId', 'updatedAt'],
};
