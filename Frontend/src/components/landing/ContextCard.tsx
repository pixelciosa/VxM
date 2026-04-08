import React from 'react';
import { Context } from '../../types';

interface ContextCardProps {
  context: Context;
  onSelect: (ctx: Context) => void;
}

const ContextCard: React.FC<ContextCardProps> = ({ context, onSelect }) => {
  return (
    <button 
      onClick={() => onSelect(context)} 
      className="bg-gray-800/50 hover:bg-gray-700 border border-gray-700 hover:border-vx-primary p-6 rounded-2xl transition-colors group flex flex-col items-center gap-4"
    >
      <div className={`w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-2xl group-hover:scale-110 transition ${context.color || 'text-vx-primary'}`}>
        <i className={`fas ${context.icon || 'fa-rocket'}`}></i>
      </div>
      <div>
        <h4 className="text-xl font-bold text-white">{context.name}</h4>
        <p className="text-sm text-gray-400 mt-2">{context.description}</p>
      </div>
    </button>
  );
};

export default React.memo(ContextCard);
