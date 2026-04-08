import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Layers, UserCircle2, ShieldCheck, Tag } from 'lucide-react';
import ContextTable from './ContextTable';
import ArchetypeTable from './ArchetypeTable';
import SafetyPromptTable from './SafetyPromptTable';
import AgentNamesTable from './AgentNamesTable';

const LibraryAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contexts' | 'archetypes' | 'safety' | 'names'>('contexts');

  const tabs = [
    { id: 'contexts', name: 'Contextos', icon: <Layers size={18} /> },
    { id: 'archetypes', name: 'Arquetipos', icon: <UserCircle2 size={18} /> },
    { id: 'names', name: 'Nombres', icon: <Tag size={18} /> },
    { id: 'safety', name: 'Seguridad y Ética', icon: <ShieldCheck size={18} /> },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Administración de Biblioteca</h1>
        <p className="text-gray-400">Gestiona los contextos, arquetipos, nombres y prompts de seguridad.</p>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-2xl mb-8 w-fit border border-white/5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-gray-800 text-white shadow-lg'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'contexts' && (
          <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Contextos</h3>
            <p className="text-gray-400 mb-6">Lista de contextos disponibles en la plataforma.</p>
            <ContextTable />
          </div>
        )}
        
        {activeTab === 'archetypes' && (
          <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Arquetipos</h3>
            <p className="text-gray-400 mb-6">Lista de arquetipos de personalidad disponibles.</p>
            <ArchetypeTable />
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Prompts de Seguridad</h3>
            <p className="text-gray-400 mb-6">Configuración de lineamientos éticos y de privacidad.</p>
            <SafetyPromptTable />
          </div>
        )}

        {activeTab === 'names' && (
          <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Nombres de Agentes</h3>
            <p className="text-gray-400 mb-6">Gestiona el pool de nombres aleatorios por Camino y Arquetipo.</p>
            <AgentNamesTable />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default LibraryAdmin;
