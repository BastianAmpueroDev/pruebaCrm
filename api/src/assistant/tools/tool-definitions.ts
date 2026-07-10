import Anthropic from '@anthropic-ai/sdk';

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: 'list_opportunities',
    description:
      'Lista oportunidades del CRM con filtros opcionales. Úsala para responder preguntas sobre oportunidades por etapa, prioridad, responsable o probabilidad.',
    input_schema: {
      type: 'object',
      properties: {
        stage: {
          type: 'string',
          enum: ['LEAD_NUEVO', 'CONTACTADO', 'DIAGNOSTICO', 'PROPUESTA_ENVIADA', 'NEGOCIACION', 'GANADO', 'PERDIDO'],
          description: 'Filtrar por etapa del pipeline',
        },
        priority: {
          type: 'string',
          enum: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'],
          description: 'Filtrar por prioridad',
        },
        owner: {
          type: 'string',
          description: 'Filtrar por nombre del responsable',
        },
        min_probability: {
          type: 'number',
          description: 'Probabilidad mínima de cierre (0-100)',
        },
        sort_by: {
          type: 'string',
          enum: ['probability', 'estimatedValue', 'nextFollowUpDate', 'createdAt'],
          description: 'Campo por el que ordenar',
        },
        sort_order: {
          type: 'string',
          enum: ['asc', 'desc'],
          description: 'Orden ascendente o descendente',
        },
        limit: {
          type: 'number',
          description: 'Número máximo de resultados (default 10)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_opportunity',
    description: 'Obtiene el detalle completo de una oportunidad específica por ID.',
    input_schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID UUID de la oportunidad',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_pipeline_metrics',
    description:
      'Obtiene métricas agregadas del pipeline: valor total, valor ponderado por probabilidad, conteo por etapa y por prioridad, probabilidad promedio.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_upcoming_followups',
    description: 'Obtiene oportunidades con seguimiento programado en los próximos N días.',
    input_schema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Número de días hacia adelante a consultar (default 7)',
        },
      },
      required: [],
    },
  },
];
