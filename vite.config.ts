import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served at https://barrow1990.github.io/dvc/, not the domain root.
  base: '/dvc/',
  plugins: [react()],
})
