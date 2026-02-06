import type { RxJsonSchema } from 'rxdb';

export interface UserWorkoutSchedule {
  id: string;
  userId: string;
  templateId: string;
  scheduledDate: string;
  status: 'Locked' | 'Unlocked' | 'Completed' | 'Skipped';
  completedAt: string | null;
  totalCaloriesBurned: number | null;
  rating: number | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export const userWorkoutScheduleSchema: RxJsonSchema<UserWorkoutSchedule> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    userId: { type: 'string', maxLength: 36 },
    templateId: { type: 'string', maxLength: 36 },
    scheduledDate: { type: 'string', format: 'date', maxLength: 10 },
    status: { type: 'string', enum: ['Locked', 'Unlocked', 'Completed', 'Skipped'] },
    completedAt: { type: ['string', 'null'], format: 'date-time' },
    totalCaloriesBurned: { type: ['number', 'null'] },
    rating: { type: ['number', 'null'], minimum: 1, maximum: 5 },
    feedback: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 30 },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'userId', 'templateId', 'scheduledDate', 'status', 'updatedAt', 'deleted'],
  indexes: ['userId', ['userId', 'scheduledDate'], 'updatedAt'],
};
