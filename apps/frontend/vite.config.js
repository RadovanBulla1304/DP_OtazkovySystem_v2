import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  preview: {
    port: 5174,
    strictPort: true
  },
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    hmr: {
      path: '/ws'
    }
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src'),
      '@componentes': path.resolve(__dirname, './src/componentes')
    }
  }
});
//Firefox may have stricter security settings for WebSocket connections on localhost.
//Check your about:config and set network.websocket.allowInsecureFromHTTPS to true.
