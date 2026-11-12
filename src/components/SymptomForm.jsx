import { useState } from 'react'
import MensagemErro from './MensagemErro'
import { TIPOS_SINTOMA, SUBTIPOS_DOR } from '../constants/sintomas'
import { agoraParaInput, apiParaInput, inputParaApi } from '../utils/datas'

// sintomaInicial: null ao cadastrar; o sintoma a ser editado ao editar
// erroDaApi: mensagem que a API devolveu ao tentar salvar (ex.: data futura)
function SymptomForm({ sintomaInicial, salvando, erroDaApi, onSalvar, onCancelar }) {
  const [tipo, setTipo] = useState(sintomaInicial?.tipo ?? 'DOR')
  const [subtipo, setSubtipo] = useState(sintomaInicial?.subtipo ?? 'CABEÇA')
  const [inicio, setInicio] = useState(apiParaInput(sintomaInicial?.inicio) || agoraParaInput())
  const [fim, setFim] = useState(apiParaInput(sintomaInicial?.fim))
  const [descricao, setDescricao] = useState(sintomaInicial?.descricao ?? '')
  const [erroValidacao, setErroValidacao] = useState('')

  function enviarFormulario(event) {
    event.preventDefault()
    setErroValidacao('')

    const descricaoLimpa = descricao.trim()

    if (tipo === 'OUTRO' && !descricaoLimpa) {
      setErroValidacao('Descreva o sintoma quando o tipo for "Outro".')
      return
    }

    if (fim && fim < inicio) {
      setErroValidacao('O término não pode ser antes do início.')
      return
    }

    onSalvar({
      tipo,
      subtipo: tipo === 'DOR' ? subtipo : null,
      descricao: descricaoLimpa || null,
      inicio: inputParaApi(inicio),
      fim: inputParaApi(fim),
    })
  }

  return (
    <form
      className="formulario-sintoma"
      onSubmit={enviarFormulario}
    >
      <MensagemErro mensagem={erroValidacao || erroDaApi} />

      <div className="campos-linha">
        <div className="campo">
          <label htmlFor="tipo">
            Sintoma
          </label>

          <select
            id="tipo"
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
          >
            {TIPOS_SINTOMA.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
        </div>

        {tipo === 'DOR' && (
          <div className="campo">
            <label htmlFor="subtipo">
              Local da dor
            </label>

            <select
              id="subtipo"
              value={subtipo}
              onChange={(event) => setSubtipo(event.target.value)}
            >
              {SUBTIPOS_DOR.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao.charAt(0) + opcao.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="campos-linha">
        <div className="campo">
          <label htmlFor="inicio">
            Início
          </label>

          <input
            id="inicio"
            type="datetime-local"
            value={inicio}
            onChange={(event) => setInicio(event.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="fim">
            Término <span className="campo-opcional">(opcional)</span>
          </label>

          <input
            id="fim"
            type="datetime-local"
            value={fim}
            min={inicio}
            onChange={(event) => setFim(event.target.value)}
          />
        </div>
      </div>

      <div className="campo">
        <label htmlFor="descricao">
          Descrição {tipo !== 'OUTRO' && <span className="campo-opcional">(opcional)</span>}
        </label>

        <textarea
          id="descricao"
          placeholder="Descreva como você está se sentindo..."
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          rows="5"
          maxLength={1000}
        />
      </div>

      <div className="formulario-acoes">
        <button
          type="button"
          className="btn-secundario"
          onClick={onCancelar}
          disabled={salvando}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="btn-principal"
          disabled={salvando}
        >
          {salvando
            ? 'Salvando...'
            : sintomaInicial ? 'Salvar alterações' : 'Salvar sintoma'}
        </button>
      </div>
    </form>
  )
}

export default SymptomForm
