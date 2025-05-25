import React from 'react';
import { Outlet } from 'react-router-dom';
import Logo from '../components/ui/Logo';

const CheckoutLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-krava-black">
      <header className="py-4 border-b border-krava-gray-800">
        <div className="container mx-auto px-4">
          <Logo size="md" />
        </div>
      </header>
      
      <main className="py-8">
        <Outlet />
      </main>
      
      <footer className="py-6 border-t border-krava-gray-800 text-krava-gray-400 text-sm">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Krava. Todos os direitos reservados.</p>
          <p className="mt-2">
            <a href="#" className="hover:text-krava-green transition-colors">Termos de Uso</a>
            {' • '}
            <a href="#" className="hover:text-krava-green transition-colors">Política de Privacidade</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutLayout;