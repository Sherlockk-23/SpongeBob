import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'index.html' // 确保路径正确

    },
  },
  optimizeDeps: {
    include: ['three'], // 根据需要添加其他依赖项
  },
});