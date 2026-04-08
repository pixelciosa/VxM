import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { TokenStats } from '../../types';
import { Coins, AlertTriangle, TrendingUp, Cpu } from 'lucide-react';

const TokenControl: React.FC = () => {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getTokenStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching token stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-10 text-center text-gray-500">Calculando consumo...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-vx-primary/10 to-vx-accent/5 p-6 rounded-3xl border border-vx-primary/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-500">
            <Coins size={80} />
          </div>
          <div className="text-xs text-vx-primary font-bold uppercase tracking-widest mb-1">Costo Estimado</div>
          <div className="text-3xl font-bold text-white mb-2">$0.00</div>
          <p className="text-[10px] text-gray-500">Consumo bajo este mes.</p>
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 transition-all hover:bg-white/[0.07]">
          <div className="text-gray-500 mb-4"><TrendingUp size={20} /></div>
          <div className="text-2xl font-bold text-white italic">En Proceso</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Crecimiento Diario</div>
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 transition-all hover:bg-white/[0.07]">
          <div className="text-gray-500 mb-4"><Cpu size={20} /></div>
          <div className="text-2xl font-bold text-white">Gemini 1.5</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Modelo Principal</div>
        </div>

        <div className="bg-yellow-500/10 p-6 rounded-3xl border border-yellow-500/10 transition-all hover:bg-yellow-500/15">
          <div className="text-yellow-500 mb-4"><AlertTriangle size={20} /></div>
          <div className="text-2xl font-bold text-white">Saludable</div>
          <div className="text-xs text-yellow-500 uppercase tracking-widest mt-1">Status de Cuota</div>
        </div>
      </div>

      <div className="bg-black/20 p-8 rounded-3xl border border-white/5">
        <h4 className="text-white font-bold mb-6">Alertas y Límites</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div>
              <div className="text-sm text-white font-bold">Límite de Seguridad</div>
              <div className="text-xs text-gray-500">Pausar API si el consumo supera los $50 USD.</div>
            </div>
            <div className="text-vx-primary font-bold">Activo</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div>
              <div className="text-sm text-white font-bold">Notificación de Umbral</div>
              <div className="text-xs text-gray-500">Avisar al administrador al llegar al 80% de la cuota.</div>
            </div>
            <div className="text-gray-500 font-bold">Inactivo</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenControl;
