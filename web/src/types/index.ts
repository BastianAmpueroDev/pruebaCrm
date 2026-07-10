export type Role = 'ADMIN' | 'SALES';

export type Stage =
  | 'LEAD_NUEVO'
  | 'CONTACTADO'
  | 'DIAGNOSTICO'
  | 'PROPUESTA_ENVIADA'
  | 'NEGOCIACION'
  | 'GANADO'
  | 'PERDIDO';

export type Priority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Opportunity {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  opportunityName: string;
  description: string;
  estimatedValue: string;
  currency: string;
  stage: Stage;
  priority: Priority;
  probability: number;
  owner: string;
  nextFollowUpDate: string;
  lastInteractionSummary?: string;
  aiRecommendation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardMetrics {
  totalPipeline: number;
  weightedValue: number;
  totalOpportunities: number;
  avgProbability: number;
  byStage: Record<Stage, { count: number; value: number }>;
  byPriority: Record<Priority, number>;
  upcomingFollowups: Partial<Opportunity>[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title?: string;
  createdAt: string;
  messages?: Message[];
}
