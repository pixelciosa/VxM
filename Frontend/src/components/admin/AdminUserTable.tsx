import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { AdminUser } from '../../types';
import { Shield, ShieldAlert, ShieldCheck, Mail, Edit2, Save, X } from 'lucide-react';

const AdminUserTable: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listBackendUsers();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching backend users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (admin: AdminUser) => {
    setEditingId(admin.profile_id);
    setEditRole(admin.role);
  };

  const handleSave = async (profileId: string) => {
    try {
      await adminApi.updateAdminRole(profileId, editRole);
      setEditingId(null);
      fetchAdmins();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const ROLE_CONFIG: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
    'super_admin': { label: 'Super Admin', color: 'text-purple-400 bg-purple-400/10', icon: <ShieldAlert size={14} /> },
    'admin': { label: 'Admin', color: 'text-vx-primary bg-vx-primary/10', icon: <ShieldCheck size={14} /> },
    'assistant': { label: 'Assistant', color: 'text-blue-400 bg-blue-400/10', icon: <Shield size={14} /> },
    'ai_agent': { label: 'AI Agent', color: 'text-green-400 bg-green-400/10', icon: <Shield size={14} /> },
  };

  if (loading) return <div className="py-10 text-center text-gray-500">Cargando equipo...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-widest">
            <th className="px-4 py-4 font-bold">Miembro</th>
            <th className="px-4 py-4 font-bold">Rol Actual</th>
            <th className="px-4 py-4 font-bold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {admins.map(admin => {
            // @ts-ignore - Supabase join returns profiles object
            const profile = admin.profiles || {};
            const config = ROLE_CONFIG[admin.role] || ROLE_CONFIG['assistant'];

            return (
              <tr key={admin.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border border-white/5 ${config.color}`}>
                      {(profile.display_name || 'A').charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{profile.display_name || 'Desconocido'}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail size={12} /> {profile.email || 'Sin email'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {editingId === admin.profile_id ? (
                    <select 
                      className="bg-gray-800 border border-vx-primary/30 rounded-lg px-3 py-1.5 text-xs text-white"
                      value={editRole}
                      onChange={e => setEditRole(e.target.value)}
                    >
                      {Object.keys(ROLE_CONFIG).map(roleKey => (
                        <option key={roleKey} value={roleKey}>{ROLE_CONFIG[roleKey].label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase w-fit ${config.color}`}>
                      {config.icon}
                      {config.label}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {editingId === admin.profile_id ? (
                      <>
                        <button onClick={() => handleSave(admin.profile_id)} className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30"><Save size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10"><X size={16} /></button>
                      </>
                    ) : (
                      <button onClick={() => handleEdit(admin)} className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserTable;
