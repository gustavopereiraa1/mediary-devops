import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import * as authService from '../services/authService'

function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [verificandoSessao, setVerificandoSessao] = useState(true)

  // Ao abrir o app, pergunta para a API se já existe uma sessão ativa
  useEffect(() => {
    authService
      .buscarUsuarioLogado()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setVerificandoSessao(false))
  }, [])

  async function entrar(email, senha) {
    const usuarioLogado = await authService.entrar(email, senha)
    setUsuario(usuarioLogado)
  }

  async function sair() {
    try {
      await authService.sair()
    } finally {
      setUsuario(null)
    }
  }

  // Usado quando a API responde 401 (sessão expirou).
  // useCallback mantém a mesma função entre renderizações, evitando
  // que os efeitos que dependem dela rodem de novo sem necessidade.
  const encerrarSessaoLocal = useCallback(() => {
    setUsuario(null)
  }, [])

  const valor = {
    usuario,
    verificandoSessao,
    entrar,
    sair,
    cadastrar: authService.cadastrar,
    encerrarSessaoLocal,
  }

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
