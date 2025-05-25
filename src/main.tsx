import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { SupabaseProvider } from './lib/supabase/SupabaseContext';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SupabaseProvider>
      <BrowserRouter>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#00ff66',
                secondary: '#000',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff0000',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </SupabaseProvider>
  </React.StrictMode>
);