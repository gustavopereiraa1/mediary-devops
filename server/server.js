import { criarApp } from './app.js'

const porta = Number(process.env.PORT ?? 3000)
const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:5000'

criarApp({ apiUrl }).listen(porta, () => {
  console.log(`Mediary rodando em http://localhost:${porta} (API: ${apiUrl})`)
})
