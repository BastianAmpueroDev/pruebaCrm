import { PrismaClient, Stage, Priority, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Usuarios
  const adminHash = await bcrypt.hash('Admin123!', 10);
  const salesHash = await bcrypt.hash('Sales123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@apiux.cl' },
    update: {},
    create: {
      email: 'admin@apiux.cl',
      passwordHash: adminHash,
      name: 'Administrador APIUX',
      role: Role.ADMIN,
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: 'ventas@apiux.cl' },
    update: {},
    create: {
      email: 'ventas@apiux.cl',
      passwordHash: salesHash,
      name: 'Ejecutivo Ventas',
      role: Role.SALES,
    },
  });

  console.log(`Usuarios creados: ${admin.email}, ${sales.email}`);

  // 5 oportunidades del documento de prueba técnica
  const opportunities = [
    {
      companyName: 'Banco BCI',
      contactName: 'Rodrigo Fuentes',
      contactEmail: 'r.fuentes@bci.cl',
      opportunityName: 'Implementación CRM Corporativo',
      description:
        'Proyecto de implementación de CRM para las áreas comerciales del banco. Incluye integración con sistemas core bancarios y capacitación a 200 usuarios.',
      estimatedValue: 85000000,
      currency: 'CLP',
      stage: Stage.NEGOCIACION,
      priority: Priority.CRITICA,
      probability: 75,
      owner: 'Carlos Mendoza',
      nextFollowUpDate: new Date('2026-07-15'),
      lastInteractionSummary:
        'Reunión con equipo TI y áreas de negocio. Solicitaron ajuste en propuesta técnica. Próximo paso: presentar nueva versión de propuesta.',
      aiRecommendation:
        'Priorizar ajuste de propuesta técnica. Hay riesgo de que evalúen competidores si no respondemos en 48h.',
    },
    {
      companyName: 'Empresa Constructora Andes SpA',
      contactName: 'Valentina Torres',
      contactEmail: 'vtorres@constructoraandes.cl',
      opportunityName: 'Sistema de Gestión de Proyectos',
      description:
        'Solución para gestión integral de proyectos de construcción: avance de obras, control de materiales, gestión de subcontratistas y reportería ejecutiva.',
      estimatedValue: 42000000,
      currency: 'CLP',
      stage: Stage.PROPUESTA_ENVIADA,
      priority: Priority.ALTA,
      probability: 60,
      owner: 'Ana Jiménez',
      nextFollowUpDate: new Date('2026-07-12'),
      lastInteractionSummary:
        'Propuesta enviada el 25 de junio. Contacto confirmó recepción y dijo que la revisaría con socios. Sin respuesta desde entonces.',
      aiRecommendation:
        'Follow-up urgente. Han pasado más de 2 semanas sin respuesta. Proponer llamada de resolución de dudas.',
    },
    {
      companyName: 'Clínica Santa María',
      contactName: 'Dr. Patricio Vega',
      contactEmail: 'p.vega@clinicasantamaria.cl',
      opportunityName: 'Plataforma de Telemedicina',
      description:
        'Desarrollo de plataforma de telemedicina para consultas en línea, gestión de fichas clínicas digitales e integración con sistema HIS existente.',
      estimatedValue: 120000000,
      currency: 'CLP',
      stage: Stage.DIAGNOSTICO,
      priority: Priority.ALTA,
      probability: 40,
      owner: 'Carlos Mendoza',
      nextFollowUpDate: new Date('2026-07-18'),
      lastInteractionSummary:
        'Workshop de levantamiento de requerimientos completado. Identificamos 3 sistemas de integración críticos. Están evaluando si hacer en-house o externalizar.',
      aiRecommendation:
        'Preparar análisis de costo-beneficio vs desarrollo interno. Es el diferenciador que necesitan para decidir externalizar.',
    },
    {
      companyName: 'Retail Líder S.A.',
      contactName: 'Marcela Rojas',
      contactEmail: 'mrojas@retailider.cl',
      opportunityName: 'Analytics e Inteligencia Comercial',
      description:
        'Implementación de plataforma de analytics para análisis de comportamiento de clientes, optimización de inventario y forecasting de ventas con IA.',
      estimatedValue: 65000000,
      currency: 'CLP',
      stage: Stage.CONTACTADO,
      priority: Priority.MEDIA,
      probability: 25,
      owner: 'Ana Jiménez',
      nextFollowUpDate: new Date('2026-07-22'),
      lastInteractionSummary:
        'Primera reunión exploratoria completada. Interés genuino pero presupuesto no está aprobado. Deben presentar caso de negocio internamente.',
      aiRecommendation:
        'Apoyar con materiales de ROI y casos de éxito similares para facilitar la aprobación interna del presupuesto.',
    },
    {
      companyName: 'Municipalidad de Providencia',
      contactName: 'Jorge Castillo',
      contactEmail: 'j.castillo@providencia.cl',
      opportunityName: 'Portal Ciudadano Digital',
      description:
        'Desarrollo de portal de servicios digitales para ciudadanos: trámites en línea, agenda de servicios, pago de permisos y sistema de reclamos.',
      estimatedValue: 38000000,
      currency: 'CLP',
      stage: Stage.LEAD_NUEVO,
      priority: Priority.BAJA,
      probability: 15,
      owner: 'Carlos Mendoza',
      nextFollowUpDate: new Date('2026-07-30'),
      lastInteractionSummary:
        'Lead entrante por formulario web. Adjuntaron bases técnicas preliminares de una licitación que planean publicar en Q3.',
      aiRecommendation:
        'Calificar mejor el lead. Si es licitación, evaluar si cumplimos con requisitos y si el margen justifica el esfuerzo.',
    },
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.upsert({
      where: {
        id: (
          await prisma.opportunity
            .findFirst({ where: { opportunityName: opp.opportunityName } })
            .then((o) => o ?? { id: 'not-found' })
        ).id,
      },
      update: {},
      create: opp,
    });
  }

  console.log(`${opportunities.length} oportunidades creadas.`);
  console.log('\nCredenciales de seed:');
  console.log('  admin@apiux.cl / Admin123!  (rol: ADMIN)');
  console.log('  ventas@apiux.cl / Sales123!  (rol: SALES)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
