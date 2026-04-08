import React, { useState, useEffect } from 'react';
import { libraryApi } from '../../services/api';
import { SafetyPrompt } from '../../types';
import { Edit2, Plus, Save, X, History, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';

const SafetyPromptTable: React.FC = () => {
  const [prompts, setPrompts] = useState<SafetyPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SafetyPrompt>>({});
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const data = await libraryApi.listSafetyPrompts();
      setPrompts(data);
    } catch (error) {
      console.error('Error fetching safety prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: SafetyPrompt) => {
    setEditingId(p.id);
    setEditForm(p);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setShowNewForm(false);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await libraryApi.updateSafetyPrompt(editingId, editForm);
      } else {
        await libraryApi.createSafetyPrompt(editForm);
      }
      setEditingId(null);
      setEditForm({});
      setShowNewForm(false);
      fetchPrompts();
    } catch (error) {
      console.error('Error saving safety prompt:', error);
    }
  };

  const toggleStatus = async (p: SafetyPrompt) => {
    try {
      await libraryApi.updateSafetyPrompt(p.id, { is_active: !p.is_active });
      fetchPrompts();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  if (loading) return <div className="py-10 text-center text-gray-500">Cargando lineamientos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => {
            setShowNewForm(true);
            setEditForm({ name: '', content: '', is_active: true } as any);
          }}
          className="bg-vx-primary hover:bg-vx-primary/80 text-black font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> Nuevo Lineamiento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {showNewForm && (
          <div className="bg-vx-primary/5 border border-vx-primary/30 rounded-3xl p-6 animate-fade-in">
             <div className="flex justify-between mb-4">
                <input 
                  className="bg-gray-800 border border-vx-primary/30 rounded-lg px-3 py-2 text-sm w-1/2 text-white font-bold"
                  placeholder="Nombre de la Política"
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="px-4 py-2 bg-green-500/20 text-green-500 rounded-xl hover:bg-green-500/30 font-bold text-xs flex items-center gap-2"><Save size={14}/> Guardar</button>
                  <button onClick={handleCancel} className="px-4 py-2 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500/30 font-bold text-xs flex items-center gap-2"><X size={14}/> Cancelar</button>
                </div>
             </div>
             <textarea 
               className="w-full h-32 bg-gray-900 border border-white/10 rounded-xl p-4 text-sm text-gray-300 font-mono"
               placeholder="Contenido del lineamiento de seguridad, ética o privacidad..."
               value={editForm.content}
               onChange={e => setEditForm({...editForm, content: e.target.value})}
             />
          </div>
        )}

        {prompts.map(p => (
          <div key={p.id} className="bg-gray-900/30 border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${p.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                   <h4 className="text-white font-bold">{p.name}</h4>
                   <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Versión {p.version || 1}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(p)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${p.is_active ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-500'}`}
                >
                  {p.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {p.is_active ? 'Habilitado' : 'Deshabilitado'}
                </button>
                <button 
                  onClick={() => handleEdit(p)}
                  className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>

            {editingId === p.id ? (
              <div className="space-y-4 animate-fade-in">
                <textarea 
                  className="w-full h-32 bg-gray-800 border border-vx-primary/30 rounded-xl p-4 text-sm text-white font-mono"
                  value={editForm.content}
                  onChange={e => setEditForm({...editForm, content: e.target.value})}
                />
                <div className="flex justify-end gap-2">
                   <button onClick={handleSave} className="px-4 py-2 bg-vx-primary text-black rounded-xl font-bold text-xs">Guardar Cambios</button>
                   <button onClick={handleCancel} className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl font-bold text-xs">Descartar</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 leading-relaxed font-mono bg-black/20 p-4 rounded-xl border border-white/5">
                {p.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafetyPromptTable;
