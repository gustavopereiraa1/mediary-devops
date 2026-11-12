import { useState } from 'react'
import Navbar from './components/Navbar'
import Carregando from './components/Carregando'
import Home from './pages/Home'
import Sintomas from './pages/Sintomas'
import Sobre from './pages/Sobre'
import Entrar from './pages/Entrar'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
  const [paginaAtual, setPaginaAtual] = useState('home')
  const { usuario, verificandoSessao } = useAuth()

  function renderizarPagina() {
    if (paginaAtual === 'sintomas') {
      if (verificandoSessao) {
        return <Carregando texto="Verificando sessão..." />
      }

      // A página de sintomas usa a API, que exige login
      return usuario ? <Sintomas /> : <Entrar />
    }

    if (paginaAtual === 'sobre') {
      return <Sobre />
    }

    return <Home onNavegar={setPaginaAtual} />
  }

  return (
    <div className="app">
      <Navbar
        paginaAtual={paginaAtual}
        onNavegar={setPaginaAtual}
      />

      <main className="conteudo">
        {renderizarPagina()}
      </main>

      <footer className="footer">
        <p>© 2026 Mediary — Diário de Sintomas</p>
      </footer>
    </div>
  )
}

export default App
