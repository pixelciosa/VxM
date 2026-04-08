import React from 'react';
import { ChatSession } from '../../types';

interface HistoryItemProps {
  session: ChatSession;
  view: 'active' | 'archived';
  onResume: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ 
  session, 
  view, 
  onResume, 
  onTogglePin, 
  onToggleArchive, 
  onDelete 
}) => {
  const agent = (session as any).agents || session.agent;
  
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const avatarUrl = agent?.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(agent?.custom_name || 'Vx')}&eyes=default&eyebrow=default&mouth=smile`;

  return (
    <div 
      onClick={() => onResume(session.id)}
      className={`
        group relative bg-gray-800 border border-gray-700 hover:border-gray-500 
        p-4 rounded-xl transition-colors hover:bg-gray-750 cursor-pointer
        ${session.is_pinned && view === 'active' ? 'border-l-4 border-l-vx-primary' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4 overflow-hidden">
          {/* AVATAR WITH BADGE */}
          <div className="relative shrink-0">
            <img 
              src={avatarUrl}
              alt={`Avatar de ${agent?.custom_name || 'Agente'}`}
              className="w-12 h-12 rounded-full bg-gray-700 object-cover"
              width="48"
              height="48"
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-gray-800 shadow-sm ${session.platform === 'whatsapp' ? 'bg-green-500 text-white' : 'bg-sky-500 text-white'}`}>
              <i className={`fab ${session.platform === 'whatsapp' ? 'fa-whatsapp' : 'fa-telegram'}`} aria-hidden="true"></i>
            </div>
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white truncate text-lg">{agent?.custom_name || 'Agente Vx'}</h3>
              {session.is_pinned && view === 'active' ? (
                <i className="fas fa-thumbtack text-xs text-vx-primary rotate-45" aria-hidden="true"></i>
              ) : null}
            </div>
            <p className="text-xs text-vx-primary font-bold uppercase tracking-tight mb-1">
              {agent?.archetypes?.name} para {agent?.contexts?.name}
            </p>
            <p className="text-gray-400 text-sm truncate pr-8">
              {session.ended_at ? 'Sesión finalizada' : 'Sesión activa…'}
            </p>
            <div className="mt-2 text-[10px] text-gray-500 font-mono">
              {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(session.started_at))}
            </div>
          </div>
        </div>

        {/* Actions - Visible on mobile/tablet, hover-only on larger desktops */}
        <div className="flex items-center gap-2 pl-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
          {view === 'active' ? (
            <button 
              onClick={(e) => handleAction(e, () => onTogglePin(session.id))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${session.is_pinned ? 'bg-vx-primary text-white' : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'}`}
              aria-label={session.is_pinned ? "Desfijar" : "Fijar"}
              title={session.is_pinned ? "Desfijar" : "Fijar"}
            >
              <i className="fas fa-thumbtack text-xs" aria-hidden="true"></i>
            </button>
          ) : null}
          
          <button 
            onClick={(e) => handleAction(e, () => onToggleArchive(session.id))}
            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:bg-gray-600 transition-colors"
            aria-label={view === 'active' ? "Archivar" : "Desarchivar"}
            title={view === 'active' ? "Archivar" : "Desarchivar"}
          >
            <i className={`fas ${view === 'active' ? 'fa-box-archive' : 'fa-box-open'} text-xs`} aria-hidden="true"></i>
          </button>
          
          <button 
            onClick={(e) => handleAction(e, () => onDelete(session.id))}
            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-gray-600 transition-colors"
            aria-label="Eliminar"
            title="Eliminar"
          >
            <i className="fas fa-trash text-xs" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HistoryItem);
