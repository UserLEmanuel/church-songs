import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT pentru GitHub Pages:
// `base` trebuie sa fie "/<nume-repo>/". Daca redenumesti repo-ul, schimba aici.
// In dev (npm run dev) folosim "/" ca sa mearga normal pe localhost.
const REPO_NAME = 'church-songs';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? `/${REPO_NAME}/` : '/',
}));
