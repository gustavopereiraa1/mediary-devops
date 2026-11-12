import { buscarTipo } from '../constants/sintomas'
import { formatarDataHora } from '../utils/datas'

function SymptomCard({ sintoma, excluindo, onEditar, onExcluir }) {
  const tipo = buscarTipo(sintoma.tipo)
  const emAndamento = !sintoma.fim

  const titulo = sintoma.subtipo
    ? `${tipo.rotulo} · ${sintoma.subtipo.charAt(0) + sintoma.subtipo.slice(1).toLowerCase()}`
    : tipo.rotulo

  return (
    <article className="symptom-card">

      <div className="symptom-top">

        <div className="symptom-icon" aria-hidden="true">
          {tipo.icone}
        </div>

        <span className={`status-sintoma ${emAndamento ? 'andamento' : 'encerrado'}`}>
          {emAndamento ? 'Em andamento' : 'Encerrado'}
        </span>

      </div>

      <h2>{titulo}</h2>

      <p>{sintoma.descricao || 'Sem descrição.'}</p>

      <div className="symptom-footer">
        <span>Início</span>
        <strong>{formatarDataHora(sintoma.inicio)}</strong>
      </div>

      {!emAndamento && (
        <div className="symptom-footer symptom-footer-fim">
          <span>Término</span>
          <strong>{formatarDataHora(sintoma.fim)}</strong>
        </div>
      )}

      <div className="symptom-acoes">

        <button
          type="button"
          className="btn-card"
          onClick={onEditar}
          disabled={excluindo}
        >
          Editar
        </button>

        <button
          type="button"
          className="btn-card btn-card-excluir"
          onClick={onExcluir}
          disabled={excluindo}
        >
          {excluindo ? 'Excluindo...' : 'Excluir'}
        </button>

      </div>

    </article>
  )
}

export default SymptomCard
