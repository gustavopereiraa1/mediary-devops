import { useAuth } from '../hooks/useAuth'

const PAGINAS = [
  { id: 'home', rotulo: 'Início' },
  { id: 'sintomas', rotulo: 'Sintomas' },
  { id: 'sobre', rotulo: 'Sobre' },
]

function Navbar({ paginaAtual, onNavegar }) {
  const { usuario, sair } = useAuth()

  function sairDaConta() {
    sair()
    onNavegar('home')
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <button
          type="button"
          className="logo"
          onClick={() => onNavegar('home')}
        >
          <span className="logo-icon">M</span>
          <span>Mediary</span>
        </button>

        <nav className="menu">
          {PAGINAS.map((pagina) => (
            <button
              key={pagina.id}
              type="button"
              className={paginaAtual === pagina.id ? 'ativo' : ''}
              onClick={() => onNavegar(pagina.id)}
            >
              {pagina.rotulo}
            </button>
          ))}

          {usuario ? (
            <div className="menu-usuario">
              <span>Olá, {usuario.nome.split(' ')[0]}</span>

              <button
                type="button"
                className="btn-sair"
                onClick={sairDaConta}
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-entrar"
              onClick={() => onNavegar('sintomas')}
            >
              Entrar
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
