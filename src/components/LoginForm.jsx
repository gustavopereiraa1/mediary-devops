import { useState } from 'react'
import MensagemErro from './MensagemErro'
import { useAuth } from '../hooks/useAuth'
import { mensagemDeErro } from '../services/api'

function LoginForm({ emailInicial = '' }) {
  const { entrar } = useAuth()

  const [email, setEmail] = useState(emailInicial)
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function enviarFormulario(event) {
    event.preventDefault()
    setErro('')
    setEnviando(true)

    try {
      await entrar(email.trim(), senha)
    } catch (erroDaApi) {
      setErro(mensagemDeErro(erroDaApi, 'Não foi possível entrar.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="formulario-auth" onSubmit={enviarFormulario}>
      <MensagemErro mensagem={erro} />

      <div className="campo">
        <label htmlFor="login-email">E-mail</label>
        <input
          id="login-email"
          type="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="login-senha">Senha</label>
        <input
          id="login-senha"
          type="password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <button type="submit" className="btn-principal btn-largo" disabled={enviando}>
        {enviando ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}

export default LoginForm
