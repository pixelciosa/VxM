import React from 'react';
import { Archetype } from '../../types';

interface ArchetypeCardProps {
  archetype: Archetype;
  onSelect: (arch: Archetype) => void;
}

const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ archetype, onSelect }) => {
  return (
    <button 
      onClick={() => onSelect(archetype)} 
      className="bg-gray-800/50 hover:bg-gray-700 border border-gray-700 hover:border-vx-accent p-6 rounded-2xl transition-colors text-left group"
    >
      <div className="flex items-start justify-between mb-4">
        <i className={`fas ${archetype.icon || 'fa-user-astronaut'} text-3xl text-gray-500 group-hover:text-white transition`}></i>
      </div>
      <h4 className="text-xl font-bold text-white mb-1">{archetype.name}</h4>
      <p className="text-sm text-gray-400">{archetype.description}</p>
    </button>
  );
};

export default React.memo(ArchetypeCard);
