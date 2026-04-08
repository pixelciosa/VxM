import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionsApi } from '../services/api';
import { ChatSession } from '../types';
import HistoryItem from './history/HistoryItem';
import Navbar from './landing/Navbar';
const AuthModal = React.lazy(() => import('./AuthModal'));

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [view, setView] = useState<'active' | 'archived'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await sessionsApi.listSessions();
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchSessions();
  }, [user, navigate, fetchSessions]);

  // Filter based on view and search - Memoized
  const filteredSessions = useMemo(() => {
    return sessions
      .filter(s => {
        const isArchived = Boolean(s.is_archived);
        const matchesView = view === 'active' ? !isArchived : isArchived;
        const agent = (s as any).agents || s.agent;
        const titleToCheck = agent?.custom_name || 'Agente Vx';
        const archetypeToCheck = agent?.archetypes?.name || '';
        const contextToCheck = agent?.contexts?.name || '';
        
        const matchesSearch = (titleToCheck + archetypeToCheck + contextToCheck)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
          
        return matchesView && matchesSearch;
      })
      .sort((a, b) => {
        // Sort by Pinned first (only for active view), then Date
        if (view === 'active') {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
        }
        return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
      });
  }, [sessions, view, searchTerm]);

  const onResume = useCallback((id: string) => {
    navigate(`/chat/${id}`);
  }, [navigate]);

  const onTogglePin = useCallback(async (id: string) => {
    setSessions(prev => {
      const session = prev.find(s => s.id === id);
      if (!session) return prev;
      const newStatus = !session.is_pinned;
      
      // Background update (optimistic UI is already handled by returning the new array)
      sessionsApi.updateSession(id, { is_pinned: newStatus }).catch(err => {
        console.error('Error toggling pin:', err);
        // Revert on fail
        setSessions(revert => revert.map(s => s.id === id ? { ...s, is_pinned: !newStatus } : s));
      });
      
      return prev.map(s => s.id === id ? { ...s, is_pinned: newStatus } : s);
    });
  }, []);

  const onToggleArchive = useCallback(async (id: string) => {
    setSessions(prev => {
      const session = prev.find(s => s.id === id);
      if (!session) return prev;
      const newStatus = !session.is_archived;
      
      sessionsApi.updateSession(id, { is_archived: newStatus }).catch(err => {
        console.error('Error archiving:', err);
        setSessions(revert => revert.map(s => s.id === id ? { ...s, is_archived: !newStatus } : s));
      });
      
      return prev.map(s => s.id === id ? { ...s, is_archived: newStatus } : s);
    });
  }, []);

  const onDelete = useCallback(async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta sesión permanentemente? Esta acción no se puede deshacer.')) {
      return;
    }
    setSessions(prev => prev.filter(s => s.id !== id));
    try {
      await sessionsApi.deleteSession(id);
    } catch (err) {
      console.error('Error deleting session:', err);
      fetchSessions(); // restore state if failed
    }
  }, [fetchSessions]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-950">
        <div className="w-12 h-12 border-4 border-vx-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-950 flex flex-col">
      <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in flex-1">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
              <Link to="/" className="text-gray-400 hover:text-white transition">
                  <i className="fas fa-arrow-left text-xl"></i>
              </Link>
              <h1 className="text-3xl font-bold text-white">Mis Sesiones</h1>
          </div>
          
          <div className="flex bg-gray-800 p-1 rounded-lg">
              {(['active', 'archived'] as const).map(v => (
                <button 
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${view === v ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    {v === 'active' ? 'Activos' : 'Archivados'}
                </button>
              ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <i className="fas fa-search absolute left-4 top-3.5 text-gray-500" aria-hidden="true"></i>
          <input 
              type="text"
              placeholder="Buscar en tus conversaciones…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-vx-primary focus:ring-1 focus:ring-vx-primary transition-shadow"
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredSessions.length === 0 ? (
              <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-800 border-dashed">
                  <div className="text-6xl text-gray-700 mb-4">
                      <i className={`fas ${view === 'active' ? 'fa-comments' : 'fa-box-archive'}`}></i>
                  </div>
                  <p className="text-gray-500 text-lg">No hay sesiones {view === 'active' ? 'activas' : 'archivadas'} encontradas.</p>
              </div>
          ) : (
              filteredSessions.map(session => (
                  <HistoryItem 
                    key={session.id}
                    session={session}
                    view={view}
                    onResume={onResume}
                    onTogglePin={onTogglePin}
                    onToggleArchive={onToggleArchive}
                    onDelete={onDelete}
                  />
              ))
          )}
        </div>
      </div>
      <React.Suspense fallback={null}>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </React.Suspense>
    </div>
  );
};

export default HistoryPage;

