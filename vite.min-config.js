import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false,
      },
    },
    lib: {
      entry: 'src/index.js',
      name: 'diapo-core',
      fileName: () => 'diapo-core.min.js',
      formats: ['es'],
    },
  },
});
