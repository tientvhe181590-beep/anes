import type { RxJsonSchema } from 'rxdb';

export interface WorkoutSessionExercise {
  id: string;
  scheduleId: string;
  exerciseId: string;
  isExtra: boolean;
  orderIndex: number;
  notes: string | null;
  updatedAt: string;
  deleted: boolean;
}

export const workoutSessionExercisesSchema: RxJsonSchema<WorkoutSessionExercise> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    scheduleId: { type: 'string', maxLength: 36 },
    exerciseId: { type: 'string', maxLength: 36 },
    isExtra: { type: 'boolean', default: false },
    orderIndex: { type: 'number' },
    notes: { type: ['string', 'null'] },
    updatedAt: { type: 'string', format: 'date-time' },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'scheduleId', 'exerciseId', 'orderIndex', 'updatedAt', 'deleted'],
  indexes: ['scheduleId', 'updatedAt'],
};
