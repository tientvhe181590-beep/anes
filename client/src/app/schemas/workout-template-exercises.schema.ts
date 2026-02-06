import type { RxJsonSchema } from 'rxdb';

export interface WorkoutTemplateExercise {
  id: string;
  templateId: string;
  exerciseId: string;
  orderIndex: number;
  targetReps: number | null;
  targetDurationSec: number | null;
  restTimeSec: number | null;
  updatedAt: string;
  deleted: boolean;
}

export const workoutTemplateExercisesSchema: RxJsonSchema<WorkoutTemplateExercise> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    templateId: { type: 'string', maxLength: 36 },
    exerciseId: { type: 'string', maxLength: 36 },
    orderIndex: { type: 'number' },
    targetReps: { type: ['number', 'null'] },
    targetDurationSec: { type: ['number', 'null'] },
    restTimeSec: { type: ['number', 'null'] },
    updatedAt: { type: 'string', format: 'date-time' },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'templateId', 'exerciseId', 'orderIndex', 'updatedAt', 'deleted'],
  indexes: ['templateId', 'updatedAt'],
};
