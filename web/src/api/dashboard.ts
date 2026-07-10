import client from './client';
import type { DashboardMetrics } from '../types';

export const getMetrics = () => client.get<DashboardMetrics>('/dashboard/metrics');
