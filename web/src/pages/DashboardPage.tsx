import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { getMetrics } from '../api/dashboard';
import type { DashboardMetrics } from '../types';
import { Link } from 'react-router-dom';

const STAGE_LABELS: Record<string, string> = {
  LEAD_NUEVO: 'Lead Nuevo', CONTACTADO: 'Contactado', DIAGNOSTICO: 'Diagnóstico',
  PROPUESTA_ENVIADA: 'Propuesta', NEGOCIACION: 'Negociación', GANADO: 'Ganado', PERDIDO: 'Perdido',
};
const PRIORITY_COLORS: Record<string, string> = { BAJA: '#94a3b8', MEDIA: '#60a5fa', ALTA: '#f59e0b', CRITICA: '#ef4444' };

function fmt(val: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
}

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMetrics().then(r => setMetrics(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Cargando métricas...</div>;
  if (!metrics) return <div className="p-8 text-red-500">Error cargando métricas</div>;

  const stageData = Object.entries(metrics.byStage)
    .filter(([, val]) => val.count > 0)
    .map(([stage, val]) => ({ name: STAGE_LABELS[stage] ?? stage, value: val.value, count: val.count }));

  const priorityData = Object.entries(metrics.byPriority)
    .filter(([, count]) => count > 0)
    .map(([priority, count]) => ({ name: priority, value: count }));

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pipeline Total', value: fmt(metrics.totalPipeline) },
          { label: 'Valor Ponderado', value: fmt(metrics.weightedValue) },
          { label: 'Oportunidades', value: String(metrics.totalOpportunities) },
          { label: 'Prob. Promedio', value: `${metrics.avgProbability}%` },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Valor por Etapa</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stageData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v: number) => `$${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: unknown) => fmt(Number(v))} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Distribución por Prioridad</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {priorityData.map((entry) => <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? '#94a3b8'} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {metrics.upcomingFollowups.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Seguimientos próximos (7 días)</h3>
          <div className="space-y-2">
            {metrics.upcomingFollowups.map((f) => (
              <Link key={f.id} to={`/opportunities/${f.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{f.companyName}</p>
                  <p className="text-xs text-gray-500">{f.owner} · {f.stage}</p>
                </div>
                <p className="text-sm text-gray-700 font-medium">{new Date(f.nextFollowUpDate!).toLocaleDateString('es-CL')}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
