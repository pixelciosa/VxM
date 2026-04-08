import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { AppUser } from '../../types';
import { Search, Mail, Calendar, Power } from 'lucide-react';

const AppUserTable: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listAppUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching app users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="py-10 text-center text-gray-500">Cargando usuarios...</div>;

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
        <input 
          type="text"
          placeholder="Buscar por nombre o email..."
          className="w-full bg-gray-800 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-vx-primary/50 transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-widest">
              <th className="px-4 py-4 font-bold">Usuario</th>
              <th className="px-4 py-4 font-bold">Registro</th>
              <th className="px-4 py-4 font-bold">Estado</th>
              <th className="px-4 py-4 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-vx-primary/20 to-vx-accent/20 rounded-full flex items-center justify-center text-vx-primary font-bold">
                      {user.display_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-white">{user.display_name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail size={12} /> {user.email || 'Sin email'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} /> {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-4">
                   <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-full w-fit bg-green-500/10 text-green-500`}>
                    Activo
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" title="Desactivar">
                    <Power size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppUserTable;
