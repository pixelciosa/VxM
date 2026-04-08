import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-8 w-full mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-500 text-sm">© 2026 Vx+ (voyXmas). Superpoderes Humanos Desbloqueados.</p>
        <div className="mt-4 flex justify-center space-x-6">
          <a href="#" className="text-gray-400 hover:text-white transition cursor-pointer">
            <i className="fab fa-twitter text-xl"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition cursor-pointer">
            <i className="fab fa-instagram text-xl"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition cursor-pointer">
            <i className="fab fa-linkedin text-xl"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
