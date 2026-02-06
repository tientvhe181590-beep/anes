import type { RxJsonSchema } from 'rxdb';

export interface Exercise {
  id: string;
  name: string;
  type: 'TimeBased' | 'RepBased';
  videoUrl: string | null;
  isDownloadable: boolean;
  videoSource: 'YouTube' | 'SelfHosted';
  caloriesPerMin: number | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export const exercisesSchema: RxJsonSchema<Exercise> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    name: { type: 'string', maxLength: 255 },
    type: { type: 'string', enum: ['TimeBased', 'RepBased'] },
    videoUrl: { type: ['string', 'null'] },
    isDownloadable: { type: 'boolean', default: false },
    videoSource: { type: 'string', enum: ['YouTube', 'SelfHosted'], default: 'YouTube' },
    caloriesPerMin: { type: ['number', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 30 },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'name', 'type', 'updatedAt', 'deleted'],
  indexes: ['updatedAt'],
};
