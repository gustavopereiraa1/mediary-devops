function Home({ onNavegar }) {
  return (
    <section className="home">
      <div className="hero">
        <div className="hero-text">
          <span className="tag">DIÁRIO DE SINTOMAS</span>

          <h1>
            Cuide das suas informações.
            <span> Organize seus sintomas.</span>
          </h1>

          <p>
            O Mediary ajuda você a registrar seus sintomas,
            com início, término e descrição, e a acompanhar
            tudo mês a mês. Os registros ficam salvos com segurança
            na sua conta.
          </p>

          <button
            className="btn-principal"
            onClick={() => onNavegar('sintomas')}
          >
            Ver sintomas
          </button>
        </div>

        <div className="hero-card">
          <div className="hero-icon">♥</div>
          <h2>Mediary</h2>
          <p>Seu diário de sintomas</p>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <span>01</span>
          <h3>Organização</h3>
          <p>
            Centralize seus registros em um único lugar, acessível de qualquer dispositivo.
          </p>
        </div>

        <div className="info-card">
          <span>02</span>
          <h3>Acompanhamento</h3>
          <p>
            Veja seus registros organizados por mês, com início e término.
          </p>
        </div>

        <div className="info-card">
          <span>03</span>
          <h3>Simplicidade</h3>
          <p>
            Uma interface pensada para facilitar a utilização.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Home