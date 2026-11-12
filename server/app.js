import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.dirname(fileURLToPath(import.meta.url))
const PASTA_DIST = path.join(raiz, '..', 'dist')

// Cria o servidor do Mediary:
// - /api/* é repassado para a API Flask (mesma origem, então o cookie de sessão funciona)
// - o restante entrega o front-end React já compilado (pasta dist)
export function criarApp({ apiUrl = 'http://127.0.0.1:5000', pastaDist = PASTA_DIST } = {}) {
  const app = express()

  // Usado pelo Docker e pelo deploy para saber se o servidor Node está de pé
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  app.use(createProxyMiddleware({
    target: apiUrl,
    changeOrigin: true,
    pathFilter: '/api',
  }))

  app.use(express.static(pastaDist))

  // Qualquer outra rota devolve o index.html (a navegação é feita pelo React)
  app.get('/{*caminho}', (req, res) => {
    res.sendFile(path.join(pastaDist, 'index.html'))
  })

  return app
}
