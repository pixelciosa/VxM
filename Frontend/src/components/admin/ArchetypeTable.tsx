import React, { useState, useEffect } from 'react';
import { libraryApi } from '../../services/api';
import { Archetype } from '../../types';
import { Edit2, Plus, Save, X, History, UserCircle2 } from 'lucide-react';

const ArchetypeTable: React.FC = () => {
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Archetype>>({});
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    fetchArchetypes();
  }, []);

  const fetchArchetypes = async () => {
    try {
      setLoading(true);
      const data = await libraryApi.listAllArchetypes();
      setArchetypes(data);
    } catch (error) {
      console.error('Error fetching archetypes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (arch: Archetype) => {
    setEditingId(arch.id);
    setEditForm(arch);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setShowNewForm(false);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await libraryApi.updateArchetype(editingId, editForm);
      } else {
        await libraryApi.createArchetype(editForm);
      }
      setEditingId(null);
      setEditForm({});
      setShowNewForm(false);
      fetchArchetypes();
    } catch (error) {
      console.error('Error saving archetype:', error);
    }
  };

  if (loading) return <div className="py-10 text-center text-gray-500">Cargando arquetipos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => {
            setShowNewForm(true);
            setEditForm({ name: '', description: '', system_prompt: '', tone: '', icon: 'fa-user-astronaut', is_active: true } as any);
          }}
          className="bg-vx-primary hover:bg-vx-primary/80 text-black font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> Nuevo Arquetipo
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-widest">
              <th className="px-4 py-4 font-bold">Nombre / Tono</th>
              <th className="px-4 py-4 font-bold">Estado</th>
              <th className="px-4 py-4 font-bold">Icono</th>
              <th className="px-4 py-4 font-bold">V.</th>
              <th className="px-4 py-4 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {showNewForm && (
              <tr className="bg-vx-primary/5 animate-fade-in">
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    <input 
                      className="bg-gray-800 border border-vx-primary/30 rounded-lg px-3 py-2 text-sm w-full text-white"
                      placeholder="Nombre"
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                    />
                    <input 
                      className="bg-gray-800 border border-white/10 rounded-lg px-3 py-1 text-xs w-full text-gray-400"
                      placeholder="Tono (ej. Sarcástico, Empático)"
                      value={editForm.tone}
                      onChange={e => setEditForm({...editForm, tone: e.target.value})}
                    />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-vx-primary text-xs font-bold uppercase">Nuevo</span>
                </td>
                <td className="px-4 py-4">
                  <input className="bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-xs w-24" value={editForm.icon} onChange={e => setEditForm({...editForm, icon: e.target.value})} />
                </td>
                <td className="px-4 py-4 text-gray-400">1</td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={handleSave} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20"><Save size={16} /></button>
                    <button onClick={handleCancel} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><X size={16} /></button>
                  </div>
                </td>
              </tr>
            )}

            {archetypes.map(arch => (
              <tr key={arch.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-4 py-4">
                  {editingId === arch.id ? (
                    <div className="space-y-2">
                       <input 
                        className="bg-gray-800 border border-vx-primary/30 rounded-lg px-3 py-2 text-sm w-full text-white"
                        value={editForm.name}
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                      />
                      <input 
                        className="bg-gray-800 border border-white/10 rounded-lg px-3 py-1 text-xs w-full text-gray-400"
                        value={editForm.tone}
                        onChange={e => setEditForm({...editForm, tone: e.target.value})}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {arch.name}
                        {arch.tone && <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-normal">{arch.tone}</span>}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{arch.description}</div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-full w-fit ${arch.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {arch.is_active ? 'Activo' : 'Inactivo'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <i className={`fas ${arch.icon} text-gray-400 text-sm opacity-70`}></i>
                    <span className="text-[10px] text-gray-500 font-mono">{arch.icon}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-400 font-mono text-xs">{arch.version || 1}</td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {editingId === arch.id ? (
                      <>
                        <button onClick={handleSave} className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30"><Save size={16} /></button>
                        <button onClick={handleCancel} className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(arch)} className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={16} /></button>
                        <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" title="Ver Historial"><History size={16} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {editingId && (
        <div className="mt-8 bg-gray-800/50 p-6 rounded-2xl border border-vx-primary/10 animate-fade-in shadow-xl">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <UserCircle2 size={16} className="text-vx-primary" /> Editar System Prompt del Arquetipo
          </h4>
          <textarea 
            className="w-full h-48 bg-gray-900 border border-white/10 rounded-xl p-4 text-sm text-gray-300 font-mono focus:border-vx-primary/50 transition-colors"
            value={editForm.system_prompt}
            onChange={e => setEditForm({...editForm, system_prompt: e.target.value})}
          />
        </div>
      )}
    </div>
  );
};

export default ArchetypeTable;
