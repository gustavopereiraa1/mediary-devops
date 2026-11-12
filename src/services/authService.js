import api from './api'

export async function buscarUsuarioLogado() {
  const resposta = await api.get('/api/me')
  return resposta.data
}

export async function entrar(email, senha) {
  const resposta = await api.post('/api/login', { email, senha })
  return resposta.data.user
}

export async function cadastrar(nome, email, senha) {
  const resposta = await api.post('/api/cadastro', { nome, email, senha })
  return resposta.data
}

export async function sair() {
  await api.get('/api/logout')
}
