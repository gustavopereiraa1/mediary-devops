import { useState } from 'react'
import MensagemErro from './MensagemErro'
import { useAuth } from '../hooks/useAuth'
import { mensagemDeErro } from '../services/api'

function CadastroForm({ onCadastrou }) {
  const { cadastrar } = useAuth()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function enviarFormulario(event) {
    event.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setEnviando(true)

    try {
      await cadastrar(nome.trim(), email.trim(), senha)
      onCadastrou(email.trim())
    } catch (erroDaApi) {
      setErro(mensagemDeErro(erroDaApi, 'Não foi possível criar a conta.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="formulario-auth" onSubmit={enviarFormulario}>
      <MensagemErro mensagem={erro} />

      <div className="campo">
        <label htmlFor="cadastro-nome">Nome</label>
        <input
          id="cadastro-nome"
          type="text"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="cadastro-email">E-mail</label>
        <input
          id="cadastro-email"
          type="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="cadastro-senha">Senha</label>
        <input
          id="cadastro-senha"
          type="password"
          placeholder="Mínimo de 6 caracteres"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      <button type="submit" className="btn-principal btn-largo" disabled={enviando}>
        {enviando ? 'Criando conta...' : 'Criar conta'}
      </button>
    </form>
  )
}

export default CadastroForm
