import type { RxJsonSchema } from 'rxdb';

export interface Recipe {
  id: string;
  name: string;
  instructions: string | null;
  totalCalories: number | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export const recipesSchema: RxJsonSchema<Recipe> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    name: { type: 'string', maxLength: 255 },
    instructions: { type: ['string', 'null'] },
    totalCalories: { type: ['number', 'null'] },
    imageUrl: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 30 },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'name', 'updatedAt', 'deleted'],
  indexes: ['updatedAt'],
};
