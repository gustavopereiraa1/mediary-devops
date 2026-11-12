import { mkdtempSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import request from 'supertest'
import { describe, expect, test } from 'vitest'
import { criarApp } from '../../server/app'

// Pasta dist falsa, para testar o servidor sem precisar rodar o build
const pastaDist = mkdtempSync(path.join(os.tmpdir(), 'mediary-dist-'))
writeFileSync(path.join(pastaDist, 'index.html'), '<h1>Mediary</h1>')

// Porta sem nada rodando: simula a API Flask fora do ar
const app = criarApp({ apiUrl: 'http://127.0.0.1:9', pastaDist })

describe('servidor Node do Mediary', () => {
  test('GET /health responde ok', async () => {
    const resposta = await request(app).get('/health')
    expect(resposta.status).toBe(200)
    expect(resposta.body).toEqual({ status: 'ok' })
  })

  test('GET / entrega o front-end', async () => {
    const resposta = await request(app).get('/')
    expect(resposta.status).toBe(200)
    expect(resposta.text).toContain('Mediary')
  })

  test('rotas desconhecidas também entregam o front-end', async () => {
    const resposta = await request(app).get('/qualquer/pagina')
    expect(resposta.text).toContain('Mediary')
  })

  test('/api é repassado para a API (erro quando ela está fora do ar)', async () => {
    const resposta = await request(app).get('/api/health')
    expect(resposta.status).toBeGreaterThanOrEqual(500)
  })
})
