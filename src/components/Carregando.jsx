function Carregando({ texto = 'Carregando...' }) {
  return (
    <div className="carregando" role="status">
      <span className="carregando-spinner" />
      <p>{texto}</p>
    </div>
  )
}

export default Carregando
