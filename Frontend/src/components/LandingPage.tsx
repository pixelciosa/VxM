import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { libraryApi, agentsApi, sessionsApi, analyticsApi } from '../services/api';
import { Context, Archetype, ChatSession, Platform } from '../types';
import { Link, useNavigate } from 'react-router-dom';

// Refactored Sub-Components
import SessionCard from './landing/SessionCard';
import ContextCard from './landing/ContextCard';
import ArchetypeCard from './landing/ArchetypeCard';
import PlatformSelector from './landing/PlatformSelector';
import Navbar from './landing/Navbar';

// Lazy-loaded Modals for Code Splitting
const AuthModal = React.lazy(() => import('./AuthModal'));
const LaunchModal = React.lazy(() => import('./landing/LaunchModal'));

const LandingPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedContext, setSelectedContext] = useState<Context | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('whatsapp');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'Any'>('Any');
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ctxs, archs, sess] = await Promise.all([
          libraryApi.getContexts(),
          libraryApi.getArchetypes(),
          user ? sessionsApi.listSessions() : Promise.resolve([])
        ]);
        setContexts(ctxs);
        setArchetypes(archs);
        setSessions(sess);
      } catch (err) {
        console.error('Error fetching landing data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleContextSelect = useCallback((ctx: Context) => {
    setSelectedContext(ctx);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    analyticsApi.trackEvent({ event_name: 'context_selected', context_id: ctx.id });
  }, []);

  const handleArchetypeSelect = useCallback((arch: Archetype) => {
    setSelectedArchetype(arch);
    setShowLaunchModal(true);
    analyticsApi.trackEvent({
      event_name: 'archetype_selected',
      archetype_id: arch.id,
      context_id: selectedContext?.id
    });
  }, [selectedContext]);

  const handleStartSimulation = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedContext || !selectedArchetype) return;
    try {
      setIsLoading(true);
      const { session_id } = await agentsApi.createOrGetAgent(
        selectedContext.id,
        selectedArchetype.id,
        selectedPlatform,
        selectedGender
      );
      analyticsApi.trackEvent({
        event_name: 'session_start',
        properties: { type: 'simulation' },
        context_id: selectedContext.id,
        archetype_id: selectedArchetype.id
      });
      navigate(`/chat/${session_id}`);
    } catch (err) {
      console.error('Error starting agent:', err);
      alert('Error al conectar con la IA. Revisa tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealAppConnection = () => {
    if (!selectedContext || !selectedArchetype) return;

    analyticsApi.trackEvent({
      event_name: 'session_start',
      properties: { type: 'deep_link' },
      platform: selectedPlatform,
      context_id: selectedContext.id,
      archetype_id: selectedArchetype.id
    });

    const message = `Hola Vx+, quiero iniciar mi camino de "${selectedContext.name}" como "${selectedArchetype.name}".`;
    let url = '';

    if (selectedPlatform === 'whatsapp') {
      url = `https://wa.me/15550109999?text=${encodeURIComponent(message)}`;
    } else {
      const payload = `${selectedContext.id.substring(0, 8)}_${selectedArchetype.id.substring(0, 8)}`;
      url = `https://t.me/VxPlusBot?start=${payload}`;
    }

    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-vx-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-vx-primary animate-pulse font-bold tracking-widest">Iniciando Red Neuronal…</p>
      </div>
    );
  }

  const renderContent = () => {
    if (step === 1) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-vx-primary via-purple-400 to-vx-neon mb-6">Vx+</h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 font-light tracking-wide">
            Superpoderes Humanos <span className="text-white font-bold">Desbloqueados</span>
          </p>

          {sessions.length > 0 ? (
            <div className="w-full max-w-5xl mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg uppercase tracking-widest opacity-80 border-l-4 border-vx-accent pl-2">Continuar</h3>
                <Link to="/history" className="text-xs font-bold text-vx-primary hover:underline uppercase">Ver todos</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sessions.slice(0, 3).map(s => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            </div>
          ) : null}

          <h3 className="text-white text-lg mb-8 uppercase tracking-widest opacity-80">Nuevo Camino</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            {contexts.map((c) => (
              <ContextCard key={c.id} context={c} onSelect={handleContextSelect} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4 animate-fade-in">
        <button 
          onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
          className="mb-8 text-gray-500 hover:text-white transition flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i> Volver a caminos
        </button>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Camino: <span className="text-vx-primary">{selectedContext?.name}</span></h3>
        
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 mt-6">
          <PlatformSelector selectedPlatform={selectedPlatform} onSelect={setSelectedPlatform} />
        </div>

        <p className="text-white text-lg mb-8 uppercase tracking-widest opacity-80">Ahora, ¿quién quieres que te acompañe?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {archetypes.map((a) => (
            <ArchetypeCard key={a.id} archetype={a} onSelect={handleArchetypeSelect} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-950 flex flex-col">
      <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />

      {/* Main Content */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Footer */}


      <React.Suspense fallback={null}>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        
        {selectedContext && selectedArchetype ? (
          <LaunchModal 
            isOpen={showLaunchModal}
            onClose={() => setShowLaunchModal(false)}
            selectedContext={selectedContext}
            selectedArchetype={selectedArchetype}
            selectedPlatform={selectedPlatform}
            selectedGender={selectedGender}
            onGenderSelect={setSelectedGender}
            onStartSimulation={handleStartSimulation}
            onRealAppConnection={handleRealAppConnection}
          />
        ) : null}
      </React.Suspense>
    </div>
  );
};

export default LandingPage;

