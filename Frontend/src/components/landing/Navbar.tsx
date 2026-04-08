import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, LogOut, FileText, Home, MessageSquare } from 'lucide-react';

interface NavbarProps {
  onAuthClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAuthClick }) => {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = role === 'admin' || role === 'super_admin';

  interface NavLink {
    name: string;
    path: string;
    icon: React.ReactNode;
    protected?: boolean;
    isExternal?: boolean;
  }

  const navLinks: NavLink[] = [
    { name: 'Inicio', path: '/', icon: <Home size={18} /> },
    { name: 'Historial', path: '/history', icon: <MessageSquare size={18} />, protected: true },
    { name: 'Editar Perfil', path: '/profile', icon: <User size={18} />, protected: true },
  ];

  if (isAdmin) {
    navLinks.push({ 
      name: 'Panel de Control', 
      path: '/admin/library', 
      icon: <FileText size={18} />
    });
  }

  const filteredLinks = navLinks.filter(link => !link.protected || (link.protected && user));

  return (
    <nav className="p-4 md:p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-gray-950/80">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-vx-primary to-vx-neon rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-vx-primary/40 transition-all duration-300">
            <span className="text-xl font-bold text-white">V</span>
          </div>
          <span className="text-white font-black tracking-tighter text-xl ml-1">Vx<span className="text-vx-primary">+</span></span>
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
        {filteredLinks.map(link => (
          link.isExternal ? (
            <a 
              key={link.path}
              href={link.path}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-sm font-bold transition-all text-gray-400 hover:text-white hover:bg-white/5"
            >
              {link.name}
            </a>
          ) : (
            <Link 
              key={link.path}
              to={link.path} 
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${location.pathname === link.path ? 'text-vx-primary bg-vx-primary/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {link.name}
            </Link>
          )
        ))}
      </div>

      <div className="flex items-center gap-4">
        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSeZBJAMpku4rgmUsJ5FKg7no_csCPZWLal6Ob451QGci66jWw/viewform?usp=header', '_blank', 'noopener,noreferrer')}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-full text-xs font-semibold border border-gray-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-comment-dots text-green-500" aria-hidden="true"></i> Feedback
          </button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="w-9 h-9 rounded-full bg-vx-primary/20 flex items-center justify-center text-vx-primary border border-vx-primary/30 hover:bg-vx-primary/30 transition-colors" title="Ver Perfil">
                <User size={18} />
              </Link>
              <button
                onClick={signOut}
                className="text-xs font-bold bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full border border-white/10 transition"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="bg-white text-black font-bold py-2 px-6 rounded-full text-sm hover:scale-105 transition-all flex items-center gap-2"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" width="16" height="16" />
              Entrar
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="lg:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 top-[73px] bg-gray-950 z-50 transition-all duration-300 lg:hidden h-[calc(100vh-73px)] ${isMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-full invisible pointer-events-none'}`}>
        <div className="flex flex-col p-6 space-y-2">
          {filteredLinks.map(link => (
            link.isExternal ? (
              <a 
                key={link.path}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all text-gray-400 hover:text-white hover:bg-white/5"
              >
                {link.icon}
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.path}
                to={link.path} 
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${location.pathname === link.path ? 'bg-vx-primary/20 text-vx-primary border border-vx-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {link.icon}
                {link.name}
              </Link>
            )
          ))}
          
          <div className="pt-8 space-y-4">
            <button
                onClick={() => {
                  window.open('https://docs.google.com/forms/d/e/1FAIpQLSeZBJAMpku4rgmUsJ5FKg7no_csCPZWLal6Ob451QGci66jWw/viewform?usp=header', '_blank', 'noopener,noreferrer');
                  setIsMenuOpen(false);
                }}
                className="w-full bg-gray-900 text-gray-300 p-4 rounded-2xl font-bold border border-gray-800 flex items-center justify-center gap-3"
            >
              <i className="fas fa-comment-dots text-green-500"></i> Feedback / Sugerencias
            </button>

            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-red-500/10 text-red-500 p-4 rounded-2xl font-bold border border-red-500/20 flex items-center justify-center gap-3"
              >
                <LogOut size={20} /> Salir de la cuenta
              </button>
            ) : (
              <button
                onClick={() => {
                  onAuthClick();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-white text-black p-4 rounded-2xl font-bold flex items-center justify-center gap-3"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" /> Entrar con Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
