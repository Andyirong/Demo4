import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        sourcemap: false
      },
      plugins: [react()],
      css: {
        devSourcemap: false
      },
      sourcemap: false,
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          // 强制使用单一版本的 eventemitter3 来解决版本冲突
          'eventemitter3': path.resolve(__dirname, 'node_modules/eventemitter3')
        }
      },
      optimizeDeps: {
        // 强制预构建这些包
        include: [
          '@privy-io/react-auth',
          'recharts',
          'eventemitter3'
        ],
        // 强制使用统一版本的 eventemitter3
        force: true,
        // 不进行依赖预构建的包
        exclude: ['@base-org/account']
      },
      esbuild: {
        target: 'es2020',
        sourcemap: false
      },
      build: {
        sourcemap: false,
        rollupOptions: {
          external: [],
          output: {
            manualChunks: {
              'privy': ['@privy-io/react-auth']
            }
          }
        }
      }
    };
});