import type { RxJsonSchema } from 'rxdb';

export interface WorkoutTemplate {
  id: string;
  programId: string;
  dayNumber: number;
  focusArea: string | null;
  estimatedDurationMins: number | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export const workoutTemplatesSchema: RxJsonSchema<WorkoutTemplate> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    programId: { type: 'string', maxLength: 36 },
    dayNumber: { type: 'number' },
    focusArea: { type: ['string', 'null'] },
    estimatedDurationMins: { type: ['number', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 30 },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'programId', 'dayNumber', 'updatedAt', 'deleted'],
  indexes: ['programId', 'updatedAt'],
};
