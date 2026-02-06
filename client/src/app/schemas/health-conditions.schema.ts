import type { RxJsonSchema } from 'rxdb';

export interface HealthCondition {
  id: string;
  name: string;
  type: 'Injury' | 'Medical' | 'Allergy';
  updatedAt: string;
  deleted: boolean;
}

export const healthConditionsSchema: RxJsonSchema<HealthCondition> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    name: { type: 'string', maxLength: 255 },
    type: { type: 'string', enum: ['Injury', 'Medical', 'Allergy'] },
    updatedAt: { type: 'string', format: 'date-time' },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'name', 'type', 'updatedAt', 'deleted'],
  indexes: ['updatedAt'],
};
