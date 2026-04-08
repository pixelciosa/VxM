import React from 'react';
import { Context, Archetype, Platform } from '../../types';
import GenderSelector from './GenderSelector';

interface LaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContext: Context;
  selectedArchetype: Archetype;
  selectedPlatform: Platform;
  selectedGender: 'M' | 'F' | 'Any';
  onGenderSelect: (g: 'M' | 'F' | 'Any') => void;
  onStartSimulation: () => void;
  onRealAppConnection: () => void;
}

const LaunchModal: React.FC<LaunchModalProps> = ({
  isOpen,
  onClose,
  selectedContext,
  selectedArchetype,
  selectedPlatform,
  selectedGender,
  onGenderSelect,
  onStartSimulation,
  onRealAppConnection
}) => {
  if (!isOpen) return null;
  const isWA = selectedPlatform === 'whatsapp';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl max-w-md w-full p-8 relative shadow-2xl shadow-vx-primary/20">
        <button onClick={onClose} aria-label="Cerrar modal" className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <i className="fas fa-times text-xl" aria-hidden="true"></i>
        </button>
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-vx-primary to-vx-neon rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <i className="fas fa-satellite-dish text-3xl text-white" aria-hidden="true"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Conexión Lista</h2>
          <p className="text-gray-400">
            Has configurado al <span className="text-white font-semibold">{selectedArchetype.name}</span> para el camino <span className="text-white font-semibold">{selectedContext.name}</span>.
          </p>
        </div>

        <GenderSelector selectedGender={selectedGender} onSelect={onGenderSelect} />

        <div className="space-y-4">
          <button
            onClick={onRealAppConnection}
            className={`w-full ${isWA ? 'bg-green-600 hover:bg-green-500' : 'bg-sky-500 hover:bg-sky-400'} text-white p-4 rounded-xl flex items-center justify-center gap-4 transition-colors transition-transform transform hover:scale-[1.02] shadow-lg`}
          >
            <i className={`fab fa-${isWA ? 'whatsapp' : 'telegram'} text-3xl`} aria-hidden="true"></i>
            <div className="text-left">
              <div className="font-bold text-lg">Abrir en {isWA ? 'WhatsApp' : 'Telegram'}</div>
              <div className="text-xs opacity-80 font-mono">Real App Integration</div>
            </div>
          </button>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
            <div className="relative flex justify-center"><span className="px-2 bg-gray-900 text-gray-500 text-xs uppercase tracking-wider">O prueba la demo</span></div>
          </div>
          
          <button
            onClick={onStartSimulation}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white p-4 rounded-xl flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"><i className="fas fa-desktop text-gray-300" aria-hidden="true"></i></div>
              <div className="text-left"><div className="font-bold">Simulador Web</div><div className="text-xs text-gray-400">Prototipo React interactivo</div></div>
            </div>
            <i className="fas fa-chevron-right text-gray-500 group-hover:text-white" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LaunchModal);
