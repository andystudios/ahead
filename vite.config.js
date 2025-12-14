import { fileURLToPath } from 'node:url'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  base: '/ahead/',
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        report: resolve(__dirname, 'report.html'),
        actionPlan: resolve(__dirname, 'action_plan.html'),
      },
    },
  },
  plugins: [react()],
})
