import React, { useState, useEffect } from 'react';
import { libraryApi } from '../../services/api';
import { AgentNameProposal, Context, Archetype } from '../../types';
import { Plus, Trash2, Filter, User } from 'lucide-react';

const AgentNamesTable: React.FC = () => {
  const [proposals, setProposals] = useState<AgentNameProposal[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'Any'>('Any');
  const [selectedContext, setSelectedContext] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Filter State
  const [filterContext, setFilterContext] = useState('all');
  const [filterArchetype, setFilterArchetype] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [names, ctxs, archs] = await Promise.all([
        libraryApi.listNameProposals(),
        libraryApi.listAllContexts(),
        libraryApi.listAllArchetypes()
      ]);
      setProposals(names);
      setContexts(ctxs);
      setArchetypes(archs);
      
      if (ctxs.length > 0) setSelectedContext(ctxs[0].id);
      if (archs.length > 0) setSelectedArchetype(archs[0].id);
    } catch (err) {
      console.error('Error fetching name proposals data:', err);
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !selectedContext || !selectedArchetype) return;

    try {
      setIsAdding(true);
      setError(null);
      await libraryApi.createNameProposal({
        name: newName.trim(),
        gender: selectedGender,
        context_id: selectedContext,
        archetype_id: selectedArchetype
      });
      setNewName('');
      fetchData();
    } catch (err: any) {
      console.error('Error adding name proposal:', err);
      if (err.response?.status === 409 || err.message?.includes('unique')) {
        setError('Ese nombre ya existe en el sistema.');
      } else {
        setError('Error al guardar el nombre.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este nombre?')) return;
    try {
      await libraryApi.deleteNameProposal(id);
      setProposals(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting name proposal:', err);
      setError('Error al eliminar.');
    }
  };

  const filteredProposals = proposals.filter(p => {
    const matchCtx = filterContext === 'all' || p.context_id === filterContext;
    const matchArch = filterArchetype === 'all' || p.archetype_id === filterArchetype;
    return matchCtx && matchArch;
  });

  if (loading) return <div className="py-10 text-center text-gray-500">Cargando nombres...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/50 p-6 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Diccionario de Nombres</h3>
          <p className="text-sm text-gray-400">Pool de nombres aleatorios para nuevos agentes.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-black text-vx-primary">{proposals.length}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500">Total</div>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="text-center">
            <div className="text-2xl font-black text-pink-500">{proposals.filter(p => p.gender === 'F').length}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500">Femeninos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-blue-500">{proposals.filter(p => p.gender === 'M').length}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500">Masculinos</div>
          </div>
        </div>
      </div>

      {/* Add New Name Form */}
      <div className="bg-gray-800/30 p-6 rounded-2xl border border-white/10 shadow-lg">
        <h4 className="text-white font-bold mb-6 flex items-center gap-2">
          <Plus size={18} className="text-vx-primary" /> Agregar Nuevo Nombre
        </h4>
        <form onSubmit={handleAddName} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="md:col-span-1">
            <label className="block text-[10px] uppercase tracking-tighter text-gray-500 mb-1.5 ml-1">Nombre</label>
            <input 
              className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-vx-primary/50 transition-colors"
              placeholder="Ej: Marco Aurelio"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-tighter text-gray-500 mb-1.5 ml-1">Género</label>
            <select 
              className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-vx-primary/50 transition-colors"
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value as any)}
            >
              <option value="M">Masculino (M)</option>
              <option value="F">Femenino (F)</option>
              <option value="Any">Cualquiera (Any)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-tighter text-gray-500 mb-1.5 ml-1">Camino (Contexto)</label>
            <select 
              className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-vx-primary/50 transition-colors font-bold text-vx-primary"
              value={selectedContext}
              onChange={e => setSelectedContext(e.target.value)}
            >
              {contexts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-tighter text-gray-500 mb-1.5 ml-1">Arquetipo</label>
            <select 
              className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-vx-primary/50 transition-colors font-bold text-vx-accent"
              value={selectedArchetype}
              onChange={e => setSelectedArchetype(e.target.value)}
            >
              {archetypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              disabled={isAdding}
              className="w-full bg-vx-primary hover:bg-vx-primary/80 disabled:opacity-50 text-black font-black py-2.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {isAdding ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : <Plus size={18} />}
              Guardar
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-xs text-red-400 bg-red-400/10 p-2 rounded-lg border border-red-400/20">{error}</p>}
      </div>

      {/* Filters & Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 py-2 border-b border-white/5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 text-gray-500 shrink-0">
            <Filter size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Filtros:</span>
          </div>
          <select 
            className="bg-gray-900 border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-300 focus:border-vx-primary/50 transition-colors outline-none"
            value={filterContext}
            onChange={e => setFilterContext(e.target.value)}
          >
            <option value="all">Todos los Caminos</option>
            {contexts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select 
            className="bg-gray-900 border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-300 focus:border-vx-primary/50 transition-colors outline-none"
            value={filterArchetype}
            onChange={e => setFilterArchetype(e.target.value)}
          >
            <option value="all">Todos los Arquetipos</option>
            {archetypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProposals.slice(0, 100).map((p) => (
            <div key={p.id} className="bg-gray-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-vx-primary/20 transition-all hover:shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${p.gender === 'F' ? 'bg-pink-500/10 text-pink-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  <User size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-bold truncate">{p.name}</div>
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-tighter font-bold">
                    <span className="text-vx-primary opacity-70">{p.contexts?.name || 'Cualquiera'}</span>
                    <span className="text-gray-600">/</span>
                    <span className="text-vx-accent opacity-70">{p.archetypes?.name || 'Cualquiera'}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(p.id)}
                className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                title="Eliminar nombre"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {filteredProposals.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-600 italic">
              No se encontraron nombres con estos filtros.
            </div>
          )}
        </div>
        {filteredProposals.length > 100 && (
          <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest py-4">
            Mostrando los primeros 100 resultados de {filteredProposals.length}
          </p>
        )}
      </div>
    </div>
  );
};

export default AgentNamesTable;
