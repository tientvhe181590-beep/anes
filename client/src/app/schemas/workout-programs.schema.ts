import type { RxJsonSchema } from 'rxdb';

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string | null;
  durationWeeks: number | null;
  level: 'Basic' | 'Intermediate' | 'Advanced';
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export const workoutProgramsSchema: RxJsonSchema<WorkoutProgram> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    name: { type: 'string', maxLength: 255 },
    description: { type: ['string', 'null'] },
    durationWeeks: { type: ['number', 'null'] },
    level: { type: 'string', enum: ['Basic', 'Intermediate', 'Advanced'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'name', 'level', 'updatedAt', 'deleted'],
  indexes: ['updatedAt'],
};
