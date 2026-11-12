import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, as chamadas para /api vão para o back-end Flask.
    // Assim front e API ficam na mesma origem e o cookie de sessão funciona.
    proxy: {
      '/api': 'http://127.0.0.1:5000',
    },
  },
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Arquivos cobertos pelos testes de unidade
      include: ['src/utils/**', 'src/constants/**', 'src/services/api.js', 'server/app.js'],
    },
  },
})
