import type { RxJsonSchema } from 'rxdb';

export interface UserPhysicalStats {
  id: string;
  userId: string;
  weightKg: number | null;
  heightCm: number | null;
  bmi: number | null;
  bmr: number | null;
  activityLevel: 'Low' | 'Medium' | 'High' | null;
  recordedAt: string | null;
  healthData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export const userPhysicalStatsSchema: RxJsonSchema<UserPhysicalStats> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    userId: { type: 'string', maxLength: 36 },
    weightKg: { type: ['number', 'null'] },
    heightCm: { type: ['number', 'null'] },
    bmi: { type: ['number', 'null'] },
    bmr: { type: ['number', 'null'] },
    activityLevel: { type: ['string', 'null'], enum: ['Low', 'Medium', 'High', null] },
    recordedAt: { type: ['string', 'null'], format: 'date' },
    healthData: { type: ['object', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'userId', 'updatedAt', 'deleted'],
  indexes: ['userId', 'updatedAt'],
};
