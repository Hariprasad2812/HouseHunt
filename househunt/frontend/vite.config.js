import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Vite dev server proxies API + uploaded asset traffic to the Spring Boot
// backend (http://localhost:8080 by default) so the React app and the REST API
// can be developed against the same origin — no CORS friction in the browser.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8080', changeOrigin: true },
      '/h2-console': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
});
