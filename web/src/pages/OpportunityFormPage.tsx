import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createOpportunity, getOpportunity, updateOpportunity } from '../api/opportunities';
import type { Stage, Priority } from '../types';

const STAGES: Stage[] = ['LEAD_NUEVO', 'CONTACTADO', 'DIAGNOSTICO', 'PROPUESTA_ENVIADA', 'NEGOCIACION', 'GANADO', 'PERDIDO'];
const PRIORITIES: Priority[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

interface FormData {
  companyName: string; contactName: string; contactEmail: string; opportunityName: string;
  description: string; estimatedValue: string; currency: string; stage: Stage;
  priority: Priority; probability: string; owner: string; nextFollowUpDate: string;
  lastInteractionSummary: string; aiRecommendation: string;
}

export function OpportunityFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>({
    companyName: '', contactName: '', contactEmail: '', opportunityName: '',
    description: '', estimatedValue: '', currency: 'CLP', stage: 'LEAD_NUEVO',
    priority: 'MEDIA', probability: '50', owner: '', nextFollowUpDate: '',
    lastInteractionSummary: '', aiRecommendation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      getOpportunity(id).then(res => {
        const o = res.data;
        setForm({
          companyName: o.companyName, contactName: o.contactName, contactEmail: o.contactEmail,
          opportunityName: o.opportunityName, description: o.description,
          estimatedValue: o.estimatedValue.toString(), currency: o.currency,
          stage: o.stage, priority: o.priority, probability: o.probability.toString(),
          owner: o.owner, nextFollowUpDate: o.nextFollowUpDate.split('T')[0],
          lastInteractionSummary: o.lastInteractionSummary ?? '', aiRecommendation: o.aiRecommendation ?? '',
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = { ...form, estimatedValue: form.estimatedValue, probability: Number(form.probability) };
      if (isEdit && id) { await updateOpportunity(id, data); }
      else { await createOpportunity(data); }
      navigate('/opportunities');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const set = (name: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [name]: e.target.value }));

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/opportunities')} className="text-gray-400 hover:text-gray-600">← Volver</button>
        <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Oportunidad' : 'Nueva Oportunidad'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {([['companyName', 'Empresa'], ['opportunityName', 'Nombre de oportunidad'], ['contactName', 'Nombre de contacto'], ['contactEmail', 'Email de contacto']] as [keyof FormData, string][]).map(([name, label]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
              <input required value={form[name]} onChange={set(name)}
                type={name === 'contactEmail' ? 'email' : 'text'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
          <textarea required value={form.description} onChange={set('description')} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {([['estimatedValue', 'Valor estimado', 'number'], ['currency', 'Moneda', 'text'], ['probability', 'Probabilidad (0-100)', 'number']] as [keyof FormData, string, string][]).map(([name, label, type]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
              <input required type={type} value={form[name]} onChange={set(name)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Etapa *</label>
            <select value={form.stage} onChange={set('stage')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
            <select value={form.priority} onChange={set('priority')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable *</label>
            <input required value={form.owner} onChange={set('owner')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Próximo seguimiento *</label>
            <input required type="date" value={form.nextFollowUpDate} onChange={set('nextFollowUpDate')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Último resumen de interacción</label>
          <textarea value={form.lastInteractionSummary} onChange={set('lastInteractionSummary')} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear oportunidad'}
          </button>
          <button type="button" onClick={() => navigate('/opportunities')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
