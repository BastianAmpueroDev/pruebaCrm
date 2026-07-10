import { useState, useEffect, useRef, type FormEvent } from 'react';
import { chat, getConversations, getConversation } from '../api/assistant';
import type { Message, Conversation } from '../types';

export function AssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTED = [
    '¿Cuál es el valor total del pipeline?',
    '¿Qué clientes necesitan seguimiento esta semana?',
    '¿Cuáles son las oportunidades con mayor probabilidad de cierre?',
    'Resume las oportunidades en negociación',
    'Recomiéndame las 3 acciones más importantes de hoy',
  ];

  useEffect(() => {
    getConversations().then(r => setConversations(r.data));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async (convId: string) => {
    setActiveConvId(convId);
    const res = await getConversation(convId);
    setMessages(res.data.messages ?? []);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput('');
    setLoading(true);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await chat(text, activeConvId);
      const { conversationId, message } = res.data;

      if (!activeConvId) {
        setActiveConvId(conversationId);
        const convs = await getConversations();
        setConversations(convs.data);
      }

      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: message, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Error al procesar tu mensaje. Verifica que la API KEY de Anthropic esté configurada.', createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); sendMessage(input); };
  const newConversation = () => { setActiveConvId(undefined); setMessages([]); };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <button onClick={newConversation} className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            + Nueva conversación
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <button key={conv.id} onClick={() => loadConversation(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeConvId === conv.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              <p className="truncate font-medium">{conv.title ?? 'Conversación'}</p>
              <p className="text-xs text-gray-400">{new Date(conv.createdAt).toLocaleDateString('es-CL')}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-100 p-4 bg-white">
          <h2 className="font-semibold text-gray-900">Asistente Comercial IA</h2>
          <p className="text-xs text-gray-500">Powered by Claude Haiku · Tool calling sobre datos reales del CRM</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-2xl mb-2">🤖</p>
              <p className="text-gray-600 font-medium mb-1">Asistente Comercial APIUX CRM</p>
              <p className="text-gray-400 text-sm mb-6">Consulta sobre oportunidades, métricas y seguimientos</p>
              <div className="space-y-2 max-w-md mx-auto">
                {SUGGESTED.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg text-sm text-gray-700 hover:text-blue-700 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex gap-3">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Pregunta sobre el pipeline, seguimientos, métricas..." disabled={loading}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
          <button type="submit" disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
