import { defineConfig } from 'vite';
import { terser } from 'rollup-plugin-terser';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'diapo-core',
      fileName: () => `diapo-core.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
      output: {
        plugins: [
          terser({
            format: {
              comments: false,
            },
          }),
        ],

      },
    },
  },
});