function Sobre() {
  return (
    <section className="pagina">
      <div className="pagina-header">
        <div>
          <span className="tag">SOBRE O PROJETO</span>
          <h1>Conheça o Mediary</h1>
          <p>
            Uma aplicação web para registrar e acompanhar
            sintomas, integrada a uma API própria.
          </p>
        </div>
      </div>

      <div className="sobre-grid">
        <div className="sobre-card destaque">
          <span className="numero">01</span>

          <h2>O problema</h2>

          <p>
            Informações relacionadas a sintomas podem ficar
            dispersas ou difíceis de organizar. O Mediary
            propõe uma interface simples para centralizar
            esses registros.
          </p>
        </div>

        <div className="sobre-card">
          <span className="numero">02</span>

          <h2>O objetivo</h2>

          <p>
            Criar uma aplicação web organizada e intuitiva
            para registrar e visualizar informações
            relacionadas a sintomas.
          </p>
        </div>

        <div className="sobre-card">
          <span className="numero">03</span>

          <h2>O usuário</h2>

          <p>
            A aplicação é pensada para uma pessoa que deseja
            organizar seus próprios registros de sintomas.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Sobre