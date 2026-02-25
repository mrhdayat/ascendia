import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        koleksi: resolve(__dirname, 'koleksi.html'),
        pameran: resolve(__dirname, 'pameran.html'),
        tentang: resolve(__dirname, 'tentang.html'),
        kontak: resolve(__dirname, 'kontak.html'),
      },
    },
  },
});
