import crypto from 'crypto';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      proxy: {
        '/.netlify/functions/cloudinary-sign': {
          target: 'http://localhost:3000',
          bypass: (req, res) => {
            const apiSecret = env.CLOUDINARY_API_SECRET;
            const apiKey = env.CLOUDINARY_API_KEY;
            
            if (!apiSecret || !apiKey) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Configura CLOUDINARY_API_KEY y SECRET en .env.local' }));
              return false;
            }

            const timestamp = Math.round(new Date().getTime() / 1000);
            const uploadPreset = env.VITE_CLOUDINARY_UPLOAD_PRESET || 'cinephile';
            
            const signatureString = `timestamp=${timestamp}&upload_preset=${uploadPreset}${apiSecret}`;
            const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              signature,
              timestamp,
              apiKey,
              uploadPreset,
              cloudName: env.VITE_CLOUDINARY_CLOUD_NAME
            }));
            return false;
          }
        },
        '/.netlify/functions/tmdb': {
          target: 'https://api.themoviedb.org/3/',
          changeOrigin: true,
          rewrite: (path) => {
            const url = new URL(path, 'http://localhost');
            const endpoint = url.searchParams.get('endpoint') || '';
            url.searchParams.delete('endpoint');
            return endpoint + url.search;
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const apiKey = env.TMDB_API_KEY;
              if (apiKey) {
                const separator = proxyReq.path.includes('?') ? '&' : '?';
                proxyReq.path += `${separator}api_key=${apiKey}`;
              }
            });
          },
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
