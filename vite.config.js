import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        instructions: 'Instructions.html',
        character: 'Character.html',
        game: 'Game.html'
      },
      output: {
        manualChunks(id) {
          // Vendor chunk for node_modules
          if (id.includes('node_modules')) {
            if (id.includes('three')) {
              return 'vendor-three';
            }
            return 'vendor'; // Other dependencies
          }

          // Game-related code
          if (id.includes('/game/')) {
            return 'game-core';
          }

          // Character-related code
          if (id.includes('/character/')) {
            return 'character-core';
          }

          // Shared code
          if (id.includes('/shared/') || id.includes('/utils/')) {
            return 'shared';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['three']
  }
});