// Caixa de erro exibida quando a API falha
function MensagemErro({ mensagem, onTentarNovamente }) {
  if (!mensagem) {
    return null
  }

  return (
    <div className="mensagem-erro" role="alert">
      <span className="mensagem-erro-icone">!</span>

      <p>{mensagem}</p>

      {onTentarNovamente && (
        <button
          type="button"
          className="btn-secundario"
          onClick={onTentarNovamente}
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export default MensagemErro
