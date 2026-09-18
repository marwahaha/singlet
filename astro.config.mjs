import { defineConfig } from 'astro/config';
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://marwahaha.github.io',
  base: process.env.BASE_PATH || '/singlet/',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false }
});
