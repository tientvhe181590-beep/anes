import type { RxJsonSchema } from 'rxdb';

export interface ChatLog {
  id: string;
  userId: string;
  timestamp: string;
  messageContent: string;
  sender: 'User' | 'AI';
  updatedAt: string;
  deleted: boolean;
}

export const chatLogsSchema: RxJsonSchema<ChatLog> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    userId: { type: 'string', maxLength: 36 },
    timestamp: { type: 'string', format: 'date-time' },
    messageContent: { type: 'string' },
    sender: { type: 'string', enum: ['User', 'AI'] },
    updatedAt: { type: 'string', format: 'date-time' },
    deleted: { type: 'boolean', default: false },
  },
  required: ['id', 'userId', 'messageContent', 'sender', 'updatedAt', 'deleted'],
  indexes: ['userId', ['userId', 'timestamp'], 'updatedAt'],
};
