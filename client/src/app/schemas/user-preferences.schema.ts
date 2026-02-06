import type { RxJsonSchema } from 'rxdb';

export interface UserPreferences {
  id: string;
  userId: string;
  goalType: 'WeightLoss' | 'MuscleGain' | 'StayFit' | 'WeightGain' | null;
  targetWeight: number | null;
  sessionsPerWeek: number | null;
  availableTools: string | null;
  targetMuscleGroups: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export const userPreferencesSchema: RxJsonSchema<UserPreferences> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    userId: { type: 'string', maxLength: 36 },
    goalType: {
      type: ['string', 'null'],
      enum: ['WeightLoss', 'MuscleGain', 'StayFit', 'WeightGain', null],
    },
    targetWeight: { type: ['number', 'null'] },
    sessionsPerWeek: { type: ['number', 'null'] },
    availableTools: { type: ['string', 'null'] },
    targetMuscleGroups: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 30 },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'userId', 'updatedAt', 'deleted'],
  indexes: ['userId', 'updatedAt'],
};
