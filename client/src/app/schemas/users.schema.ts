import type { RxJsonSchema } from 'rxdb';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  dateOfBirth: string | null;
  role: 'member' | 'admin';
  membershipTier: 'Free' | 'Premium';
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export const userSchema: RxJsonSchema<User> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    email: { type: 'string', maxLength: 255 },
    passwordHash: { type: 'string' },
    fullName: { type: ['string', 'null'] },
    gender: { type: ['string', 'null'], enum: ['Male', 'Female', 'Other', null] },
    dateOfBirth: { type: ['string', 'null'], format: 'date' },
    role: { type: 'string', enum: ['member', 'admin'], default: 'member' },
    membershipTier: { type: 'string', enum: ['Free', 'Premium'], default: 'Free' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 30 },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'email', 'passwordHash', 'updatedAt', 'deleted'],
  indexes: ['email', 'updatedAt'],
};
