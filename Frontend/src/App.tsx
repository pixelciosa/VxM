import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import BusinessDocs from './components/BusinessDocs';
import HistoryPage from './components/HistoryPage';
import ProfilePage from './components/ProfilePage';
import LibraryAdmin from './components/admin/LibraryAdmin';
import UserAdmin from './components/admin/UserAdmin';
import DataAdmin from './components/admin/DataAdmin';
import Footer from './components/landing/Footer';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, signInWithGoogle } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Cargando...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-vx-primary to-vx-accent rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl font-bold text-white">V</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Acceso Restringido</h1>
          <p className="text-gray-400 mb-8">Debes iniciar sesión para acceder a esta simulación.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-white text-black font-bold py-3 rounded-xl transition-all hover:bg-gray-200"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Cargando...</div>;
  }

  const isAdmin = role === 'admin' || role === 'super_admin';

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-vx-primary/30 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/chat/:sessionId" 
              element={
                <ProtectedRoute>
                  <ChatInterface />
                </ProtectedRoute>
              } 
            />
            <Route path="/docs" element={<BusinessDocs />} />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            {/* Admin Routes */}
            <Route 
              path="/admin/library" 
              element={
                <AdminRoute>
                  <LibraryAdmin />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <UserAdmin />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/data" 
              element={
                <AdminRoute>
                  <DataAdmin />
                </AdminRoute>
              } 
            />
            {/* Redirect any other path to / for now */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
