import { nomeDoMes } from '../utils/datas'

// Navegação entre meses: a API devolve os sintomas de um mês por vez
function SeletorMes({ ano, mes, desabilitado, onMudar }) {
  function mesAnterior() {
    onMudar(mes === 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: mes - 1 })
  }

  function proximoMes() {
    onMudar(mes === 12 ? { ano: ano + 1, mes: 1 } : { ano, mes: mes + 1 })
  }

  return (
    <div className="seletor-mes">
      <button
        type="button"
        aria-label="Mês anterior"
        onClick={mesAnterior}
        disabled={desabilitado}
      >
        ‹
      </button>

      <strong>{nomeDoMes(mes)} de {ano}</strong>

      <button
        type="button"
        aria-label="Próximo mês"
        onClick={proximoMes}
        disabled={desabilitado}
      >
        ›
      </button>
    </div>
  )
}

export default SeletorMes
