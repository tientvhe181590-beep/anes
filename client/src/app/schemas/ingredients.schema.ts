import type { RxJsonSchema } from 'rxdb';

export interface Ingredient {
  id: string;
  name: string;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  updatedAt: string;
  deleted: boolean;
}

export const ingredientsSchema: RxJsonSchema<Ingredient> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    name: { type: 'string', maxLength: 255 },
    caloriesPer100g: { type: ['number', 'null'] },
    proteinPer100g: { type: ['number', 'null'] },
    carbsPer100g: { type: ['number', 'null'] },
    fatPer100g: { type: ['number', 'null'] },
    updatedAt: { type: 'string', format: 'date-time' },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'name', 'updatedAt', 'deleted'],
  indexes: ['updatedAt'],
};
