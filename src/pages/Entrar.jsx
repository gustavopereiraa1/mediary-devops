import { useState } from 'react'
import LoginForm from '../components/LoginForm'
import CadastroForm from '../components/CadastroForm'

function Entrar() {
  const [modo, setModo] = useState('login')
  const [emailCadastrado, setEmailCadastrado] = useState('')

  function aposCadastro(email) {
    setEmailCadastrado(email)
    setModo('login')
  }

  return (
    <section className="pagina auth-pagina">
      <div className="auth-card">
        <span className="tag">ÁREA DO USUÁRIO</span>

        <h1>{modo === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</h1>

        <p className="auth-subtitulo">
          Seus sintomas ficam salvos no servidor e você acessa de qualquer lugar.
        </p>

        <div className="auth-abas">
          <button
            type="button"
            className={modo === 'login' ? 'ativo' : ''}
            onClick={() => setModo('login')}
          >
            Entrar
          </button>

          <button
            type="button"
            className={modo === 'cadastro' ? 'ativo' : ''}
            onClick={() => setModo('cadastro')}
          >
            Criar conta
          </button>
        </div>

        {emailCadastrado && modo === 'login' && (
          <p className="mensagem-sucesso">
            Conta criada! Agora é só entrar com sua senha.
          </p>
        )}

        {modo === 'login' ? (
          <LoginForm key={emailCadastrado} emailInicial={emailCadastrado} />
        ) : (
          <CadastroForm onCadastrou={aposCadastro} />
        )}
      </div>
    </section>
  )
}

export default Entrar
