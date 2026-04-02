/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['backend/**', 'node_modules/**'],
    css: true,
    env: {
      VITE_USE_REMOTE_API: 'false',
      VITE_API_BASE_URL: 'http://localhost:3000/api',
      VITE_APP_ENV: 'test',
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'backend/',
        'backend/**',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
    },
  },
})
