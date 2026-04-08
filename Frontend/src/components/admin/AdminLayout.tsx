import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Library, Users, BarChart3, ChevronLeft, LayoutDashboard } from 'lucide-react';
import Navbar from '../landing/Navbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-vx-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  const isAdmin = role === 'admin' || role === 'super_admin';

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { name: 'Biblioteca', path: '/admin/library', icon: <Library size={20} /> },
    { name: 'Usuarios', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Datos & Tokens', path: '/admin/data', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="flex-1 bg-gray-950 flex flex-col min-h-screen">
      <Navbar onAuthClick={() => {}} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900/50 border-r border-white/5 hidden md:flex flex-col p-6 space-y-2">
          <div className="mb-8 px-2">
            <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Administración</h2>
          </div>
          
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                location.pathname.startsWith(item.path)
                  ? 'bg-vx-primary/20 text-vx-primary border border-vx-primary/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          
          <div className="mt-auto pt-6 border-t border-white/5">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-all text-sm font-bold">
              <ChevronLeft size={20} />
              Volver a la App
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
