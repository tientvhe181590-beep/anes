import type { RxJsonSchema } from 'rxdb';

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  amountGrams: number;
  updatedAt: string;
  deleted: boolean;
}

export const recipeIngredientsSchema: RxJsonSchema<RecipeIngredient> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    recipeId: { type: 'string', maxLength: 36 },
    ingredientId: { type: 'string', maxLength: 36 },
    amountGrams: { type: 'number' },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 30 },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'recipeId', 'ingredientId', 'amountGrams', 'updatedAt', 'deleted'],
  indexes: ['recipeId', 'updatedAt'],
};
