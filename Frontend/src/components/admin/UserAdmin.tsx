import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Users, ShieldAlert } from 'lucide-react';
import AppUserTable from './AppUserTable';
import AdminUserTable from './AdminUserTable';

const UserAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'app' | 'backend'>('app');

  const tabs = [
    { id: 'app', name: 'Usuarios App', icon: <Users size={18} /> },
    { id: 'backend', name: 'Usuarios Backend', icon: <ShieldAlert size={18} /> },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Administración de Usuarios</h1>
        <p className="text-gray-400">Gestiona los accesos, estados y roles de los usuarios de la plataforma.</p>
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
        {activeTab === 'app' && (
          <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Usuarios de la Aplicación</h3>
            <p className="text-gray-400 mb-6">Lista de usuarios finales registrados en el simulador.</p>
            <AppUserTable />
          </div>
        )}
        
        {activeTab === 'backend' && (
          <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Usuarios del Backend</h3>
            <p className="text-gray-400 mb-6">Administradores, asistentes y perfiles con acceso al panel de control.</p>
            <AdminUserTable />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserAdmin;
