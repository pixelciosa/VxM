import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        alert('Registro exitoso. Revisa tu email si es necesario confirmar la cuenta.');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error en la autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-vx-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-vx-accent/20 rounded-full blur-3xl pointer-events-none"></div>

        <button 
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <i className="fas fa-times text-xl" aria-hidden="true"></i>
        </button>

        <div className="text-center mb-8 relative">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-vx-primary to-vx-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">V</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Accede a tus agentes y simulaciones' : 'Empieza tu camino con IA proactiva'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 ml-1">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-vx-primary/50 transition-colors"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 ml-1">Contraseña</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-vx-primary/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="text-red-400 text-xs text-center py-1 bg-red-400/10 rounded-lg">{error}</div>}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-bold py-3 rounded-xl transition-colors transition-transform transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'Entrar' : 'Registrarme'
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4 py-2 relative">
          <div className="flex-1 border-t border-white/5"></div>
          <span className="text-[10px] text-gray-600 uppercase tracking-widest">O continúa con</span>
          <div className="flex-1 border-t border-white/5"></div>
        </div>

        <button 
          onClick={() => signInWithGoogle()}
          className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors border border-white/5 flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" width="16" height="16" />
          Google
        </button>

        <div className="mt-8 text-center relative">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-500 hover:text-vx-primary transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
