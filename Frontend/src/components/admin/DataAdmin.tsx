import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { BarChart3, Coins, Zap, Activity } from 'lucide-react';
import TokenControl from './TokenControl';

const DataAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'analytics'>('tokens');

  const tabs = [
    { id: 'tokens', name: 'Control de Tokens', icon: <Coins size={18} /> },
    { id: 'analytics', name: 'DataLab Analytics', icon: <BarChart3 size={18} /> },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Administración de Datos</h1>
        <p className="text-gray-400">Monitorea el consumo de recursos y el rendimiento de la IA.</p>
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
        {activeTab === 'tokens' && (
          <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Consumo de Tokens</h3>
            <p className="text-gray-400 mb-6">Desglose del gasto de tokens por modelo e investigación.</p>
            <TokenControl />
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-8">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">DataLab Analytics</h3>
                  <p className="text-gray-400">Visualización de interacciones capturadas.</p>
                </div>
                <div className="p-3 bg-vx-primary/10 text-vx-primary rounded-2xl">
                  <Activity size={24} />
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Eventos Totales', value: '1,284', trend: '+12%', icon: <Zap size={20}/> },
                  { label: 'Usuarios Activos', value: '86', trend: '+5%', icon: <Users size={20}/> },
                  { label: 'Sesiones Hoy', value: '312', trend: '+18%', icon: <BarChart3 size={20}/> },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-gray-500">{stat.icon}</div>
                      <span className="text-green-500 text-xs font-bold">{stat.trend}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{stat.label}</div>
                  </div>
                ))}
             </div>

             <div className="mt-10 h-64 bg-black/20 rounded-3xl border border-white/5 flex items-center justify-center">
                <div className="text-gray-600 italic">Los gráficos de DataLab se integrarán con la API de visualización en la siguiente fase...</div>
             </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Simple icon component accepting size
const Users = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export default DataAdmin;
