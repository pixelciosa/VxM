import React, { useState } from 'react';
import Navbar from './landing/Navbar';
const AuthModal = React.lazy(() => import('./AuthModal'));

const BusinessDocs: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="flex-1 bg-gray-950 flex flex-col">
      <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto py-12">
          <h1 className="text-4xl font-extrabold mb-8">Vx+ Business documentation</h1>
          <p className="text-gray-400">Documentation for business logic and processes...</p>
        </div>
      </main>

      <React.Suspense fallback={null}>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </React.Suspense>
    </div>
  );
};

export default BusinessDocs;
