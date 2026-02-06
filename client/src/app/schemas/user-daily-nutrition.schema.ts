import type { RxJsonSchema } from 'rxdb';

export interface UserDailyNutrition {
  id: string;
  userId: string;
  date: string;
  totalCaloriesIntake: number | null;
  totalProtein: number | null;
  totalCarbs: number | null;
  totalFat: number | null;
  metricsData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export const userDailyNutritionSchema: RxJsonSchema<UserDailyNutrition> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    userId: { type: 'string', maxLength: 36 },
    date: { type: 'string', format: 'date' },
    totalCaloriesIntake: { type: ['number', 'null'] },
    totalProtein: { type: ['number', 'null'] },
    totalCarbs: { type: ['number', 'null'] },
    totalFat: { type: ['number', 'null'] },
    metricsData: { type: ['object', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'userId', 'date', 'updatedAt', 'deleted'],
  indexes: ['userId', ['userId', 'date'], 'updatedAt'],
};
