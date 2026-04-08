import React from 'react';
import { Link } from 'react-router-dom';
import { ChatSession } from '../../types';

interface SessionCardProps {
  session: ChatSession;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const agent = (session as any).agents || session.agent;
  
  return (
    <Link 
      to={`/chat/${session.id}`} 
      className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-left hover:border-vx-accent transition-colors group"
    >
      <h4 className="font-bold text-white truncate">{agent?.custom_name || 'Agente Vx'}</h4>
      <div className="flex flex-col gap-0.5 mt-1">
        <p className="text-[10px] text-vx-primary font-bold uppercase tracking-tight">
          {agent?.archetypes?.name} para {agent?.contexts?.name}
        </p>
        <p className="text-[9px] text-gray-500">
          Iniciado el {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(session.started_at))}
        </p>
      </div>
    </Link>
  );
};

export default React.memo(SessionCard);
