import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
        proxy: {
          '/api/bytedance': {
            target: 'https://ark.ap-southeast.bytepluses.com/api/v3',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/bytedance/, ''),
            secure: false,
          },
          '/api/bytedance-image': {
            target: 'https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.volces.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/bytedance-image/, ''),
            secure: false,
            headers: {
              'Referer': 'https://console.byteplus.com/',
              'Origin': 'https://console.byteplus.com'
            }
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
