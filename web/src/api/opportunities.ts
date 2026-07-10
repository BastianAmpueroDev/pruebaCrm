import client from './client';
import type { Opportunity, PaginatedResponse } from '../types';

export const getOpportunities = (params?: Record<string, any>) =>
  client.get<PaginatedResponse<Opportunity>>('/opportunities', { params });

export const getOpportunity = (id: string) =>
  client.get<Opportunity>(`/opportunities/${id}`);

export const createOpportunity = (data: Partial<Opportunity>) =>
  client.post<Opportunity>('/opportunities', data);

export const updateOpportunity = (id: string, data: Partial<Opportunity>) =>
  client.patch<Opportunity>(`/opportunities/${id}`, data);

export const deleteOpportunity = (id: string) =>
  client.delete(`/opportunities/${id}`);

export const exportOpportunities = (params?: Record<string, any>) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  window.open(`/api/opportunities/export.csv${query}`, '_blank');
};
