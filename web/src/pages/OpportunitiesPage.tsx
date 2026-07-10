import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOpportunities, exportOpportunities, deleteOpportunity } from '../api/opportunities';
import type { Opportunity, Stage, Priority } from '../types';
import { useAuth } from '../context/AuthContext';

const STAGE_COLORS: Record<Stage, string> = {
  LEAD_NUEVO: 'bg-gray-100 text-gray-700', CONTACTADO: 'bg-blue-100 text-blue-700',
  DIAGNOSTICO: 'bg-purple-100 text-purple-700', PROPUESTA_ENVIADA: 'bg-yellow-100 text-yellow-700',
  NEGOCIACION: 'bg-orange-100 text-orange-700', GANADO: 'bg-green-100 text-green-700', PERDIDO: 'bg-red-100 text-red-700',
};
const PRIORITY_COLORS: Record<Priority, string> = { BAJA: 'text-gray-500', MEDIA: 'text-blue-600', ALTA: 'text-yellow-600', CRITICA: 'text-red-600' };
const STAGE_LABELS: Record<Stage, string> = {
  LEAD_NUEVO: 'Lead Nuevo', CONTACTADO: 'Contactado', DIAGNOSTICO: 'Diagnóstico',
  PROPUESTA_ENVIADA: 'Propuesta Enviada', NEGOCIACION: 'Negociación', GANADO: 'Ganado', PERDIDO: 'Perdido',
};

function fmt(val: string | number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(val));
}

export function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (stage) params.stage = stage;
      if (priority) params.priority = priority;
      const res = await getOpportunities(params);
      setOpportunities(res.data.data);
      setMeta(res.data.meta);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, stage, priority]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchData(); };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    await deleteOpportunity(id);
    fetchData();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Oportunidades</h2>
        <div className="flex gap-2">
          <button onClick={() => exportOpportunities({ stage, priority, search })} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Exportar CSV
          </button>
          <Link to="/opportunities/new" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">+ Nueva</Link>
        </div>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex gap-3 flex-wrap">
        <input type="text" placeholder="Buscar empresa u oportunidad..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={stage} onChange={e => { setStage(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Todas las etapas</option>
          {(Object.entries(STAGE_LABELS) as [Stage, string][]).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
        </select>
        <select value={priority} onChange={e => { setPriority(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Todas las prioridades</option>
          {(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'] as Priority[]).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Buscar</button>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Cargando...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Empresa', 'Oportunidad', 'Etapa', 'Prioridad', 'Valor', 'Prob.', 'Responsable', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {opportunities.map(opp => (
                <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{opp.companyName}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-48 truncate">{opp.opportunityName}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STAGE_COLORS[opp.stage]}`}>{STAGE_LABELS[opp.stage]}</span></td>
                  <td className="px-4 py-3 font-semibold text-xs uppercase"><span className={PRIORITY_COLORS[opp.priority]}>{opp.priority}</span></td>
                  <td className="px-4 py-3 text-gray-700">{fmt(opp.estimatedValue)}</td>
                  <td className="px-4 py-3"><span className="font-bold text-gray-900">{opp.probability}%</span></td>
                  <td className="px-4 py-3 text-gray-600">{opp.owner}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/opportunities/${opp.id}`} className="text-blue-600 hover:underline text-xs">Ver</Link>
                      <Link to={`/opportunities/${opp.id}/edit`} className="text-gray-600 hover:underline text-xs">Editar</Link>
                      {user?.role === 'ADMIN' && (
                        <button onClick={() => handleDelete(opp.id, opp.opportunityName)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>{meta.total} oportunidades · Página {meta.page} de {meta.totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Anterior</button>
            <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
