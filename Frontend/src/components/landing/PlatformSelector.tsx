import React from 'react';
import { Platform } from '../../types';

interface PlatformSelectorProps {
  selectedPlatform: Platform;
  onSelect: (p: Platform) => void;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ selectedPlatform, onSelect }) => {
  return (
    <div className="bg-gray-800 p-1 rounded-full inline-flex items-center">
      {(['whatsapp', 'telegram'] as Platform[]).map(p => (
        <button 
          key={p} 
          onClick={() => onSelect(p)} 
          className={`px-6 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition-colors ${
            selectedPlatform === p 
              ? p === 'whatsapp' ? 'bg-[#25D366] text-white shadow-lg' : 'bg-[#0088cc] text-white shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <i className={`fab fa-${p} text-lg`}></i> {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default React.memo(PlatformSelector);
