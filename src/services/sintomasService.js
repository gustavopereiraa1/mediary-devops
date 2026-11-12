import api from './api'

// READ: sintomas de um mês (mes vai de 1 a 12)
export async function listarSintomasDoMes(ano, mes) {
  const resposta = await api.get(`/api/sintomas/mes/${ano}/${mes}`)
  return resposta.data
}

// CREATE
export async function criarSintoma(sintoma) {
  const resposta = await api.post('/api/sintomas', sintoma)
  return resposta.data
}

// UPDATE
export async function atualizarSintoma(id, sintoma) {
  const resposta = await api.put(`/api/sintomas/${id}`, sintoma)
  return resposta.data
}

// DELETE
export async function excluirSintoma(id) {
  await api.delete(`/api/sintomas/${id}`)
}
