import React from 'react';

interface GenderSelectorProps {
  selectedGender: 'M' | 'F' | 'Any';
  onSelect: (g: 'M' | 'F' | 'Any') => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ selectedGender, onSelect }) => {
  const options = [
    { id: 'Any', label: 'Cualquiera', icon: 'fa-genderless' },
    { id: 'M', label: 'Hombre', icon: 'fa-mars' }, 
    { id: 'F', label: 'Mujer', icon: 'fa-venus' }
  ] as const;

  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-3 text-center">Género del Guía</p>
      <div className="bg-gray-800 p-1 rounded-2xl flex items-center justify-between">
        {options.map(g => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-colors transition-transform ${
              selectedGender === g.id 
                ? 'bg-gradient-to-r from-vx-primary to-vx-neon text-white shadow-lg scale-105' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <i className={`fas ${g.icon} text-base`}></i>
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(GenderSelector);
