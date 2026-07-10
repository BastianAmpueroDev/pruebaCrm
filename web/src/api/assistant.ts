import client from './client';
import type { Conversation } from '../types';

export const chat = (message: string, conversationId?: string) =>
  client.post<{ conversationId: string; message: string; toolsUsed: string[] }>(
    '/assistant/chat',
    { message, conversationId },
  );

export const getConversations = () =>
  client.get<Conversation[]>('/assistant/conversations');

export const getConversation = (id: string) =>
  client.get<Conversation>(`/assistant/conversations/${id}`);
