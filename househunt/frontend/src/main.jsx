import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App';
import { AuthProvider } from './lib/useAuth';
import { ModalRoot } from './components/ui';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ModalRoot>
          <App />
        </ModalRoot>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
