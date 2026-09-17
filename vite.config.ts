import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/helper/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(import.meta.dirname, './src/app'),
      '@features': path.resolve(import.meta.dirname, './src/features'),
      '@shared': path.resolve(import.meta.dirname, './src/shared'),
      '@theme': path.resolve(import.meta.dirname, './src/theme'),
      '@registry': path.resolve(import.meta.dirname, './src/registry'),
      '@layouts': path.resolve(import.meta.dirname, './src/layouts'),
      '@config': path.resolve(import.meta.dirname, './src/config'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/xlsx') || id.includes('node_modules/file-saver')) {
            return 'vendor_xlsx';
          }
          if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion')) {
            return 'vendor_mui';
          }
          if (
            id.includes('node_modules/@reduxjs') ||
            id.includes('node_modules/react-redux') ||
            id.includes('node_modules/@tanstack')
          ) {
            return 'vendor_state';
          }
          if (id.includes('node_modules/typescript')) {
            return 'vendor_typescript';
          }
        },
      },
    },
  },
});
