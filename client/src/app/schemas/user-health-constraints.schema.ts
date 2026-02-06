import type { RxJsonSchema } from 'rxdb';

export interface UserHealthConstraint {
  id: string;
  userId: string;
  conditionId: string;
  severityNotes: string | null;
  updatedAt: string;
  deleted: boolean;
}

export const userHealthConstraintsSchema: RxJsonSchema<UserHealthConstraint> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    userId: { type: 'string', maxLength: 36 },
    conditionId: { type: 'string', maxLength: 36 },
    severityNotes: { type: ['string', 'null'] },
    updatedAt: { type: 'string', format: 'date-time' },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'userId', 'conditionId', 'updatedAt', 'deleted'],
  indexes: ['userId', 'updatedAt'],
};
