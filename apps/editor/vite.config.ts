import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Prevent duplicate React/Konva instances when workspace packages are linked.
    dedupe: ['react', 'react-dom', 'konva', 'react-konva'],
  },
})
