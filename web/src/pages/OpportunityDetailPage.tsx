import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOpportunity } from '../api/opportunities';
import type { Opportunity } from '../types';

function fmt(val: string | number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(val));
}

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) getOpportunity(id).then(r => setOpp(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-gray-500">Cargando...</div>;
  if (!opp) return <div className="p-8 text-red-500">Oportunidad no encontrada</div>;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/opportunities" className="text-gray-400 hover:text-gray-600">← Volver</Link>
        <Link to={`/opportunities/${id}/edit`} className="ml-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Editar</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{opp.opportunityName}</h2>
          <p className="text-gray-500 mt-1">{opp.companyName}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {([
            ['Contacto', `${opp.contactName} · ${opp.contactEmail}`],
            ['Responsable', opp.owner],
            ['Etapa', opp.stage],
            ['Prioridad', opp.priority],
            ['Valor estimado', fmt(opp.estimatedValue)],
            ['Probabilidad', `${opp.probability}%`],
            ['Próximo seguimiento', new Date(opp.nextFollowUpDate).toLocaleDateString('es-CL')],
            ['Estado', opp.isActive ? 'Activo' : 'Inactivo'],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label}>
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="font-medium text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-gray-500 text-xs mb-1">Descripción</p>
          <p className="text-gray-800 text-sm">{opp.description}</p>
        </div>

        {opp.lastInteractionSummary && (
          <div>
            <p className="text-gray-500 text-xs mb-1">Último resumen de interacción</p>
            <p className="text-gray-800 text-sm">{opp.lastInteractionSummary}</p>
          </div>
        )}

        {opp.aiRecommendation && (
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-800 text-xs font-semibold mb-1">Recomendación IA</p>
            <p className="text-blue-900 text-sm">{opp.aiRecommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
