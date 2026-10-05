import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: 'src/index.js',
      name: 'diapo-core',
      fileName: () => 'diapo-core.js',
      formats: ['es'],
    },
  },
});
``