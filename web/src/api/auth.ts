import client from './client';
import type { User } from '../types';

export const login = (email: string, password: string) =>
  client.post<{ access_token: string; user: User }>('/auth/login', { email, password });

export const me = () => client.get<User>('/auth/me');

export const register = (data: { email: string; password: string; name: string; role?: string }) =>
  client.post<User>('/auth/register', data);
