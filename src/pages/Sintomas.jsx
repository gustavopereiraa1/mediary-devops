import { useState } from 'react'
import SymptomCard from '../components/SymptomCard'
import SymptomForm from '../components/SymptomForm'
import SeletorMes from '../components/SeletorMes'
import MensagemErro from '../components/MensagemErro'
import Carregando from '../components/Carregando'
import { useSintomas } from '../hooks/useSintomas'
import { anoMesDe, agoraParaInput } from '../utils/datas'

function Sintomas() {
  const [mesSelecionado, setMesSelecionado] = useState(() => anoMesDe(agoraParaInput()))
  const { sintomas, carregando, erro, carregar, criar, atualizar, excluir } =
    useSintomas(mesSelecionado.ano, mesSelecionado.mes)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  // null = cadastrando um sintoma novo; objeto = editando esse sintoma
  const [sintomaEmEdicao, setSintomaEmEdicao] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [erroAoSalvar, setErroAoSalvar] = useState('')
  const [idExcluindo, setIdExcluindo] = useState(null)

  function abrirFormulario() {
    setSintomaEmEdicao(null)
    setErroAoSalvar('')
    setMostrarFormulario(true)
  }

  function iniciarEdicao(sintoma) {
    setSintomaEmEdicao(sintoma)
    setErroAoSalvar('')
    setMostrarFormulario(true)
  }

  function fecharFormulario() {
    setSintomaEmEdicao(null)
    setMostrarFormulario(false)
  }

  // Create e Update: o mesmo formulário serve para os dois casos
  async function salvarSintoma(dadosDoFormulario) {
    setSalvando(true)
    setErroAoSalvar('')

    try {
      if (sintomaEmEdicao === null) {
        await criar(dadosDoFormulario)
      } else {
        await atualizar(sintomaEmEdicao.id, dadosDoFormulario)
      }

      fecharFormulario()

      // Mostra o mês do sintoma salvo; se já for o mês atual, recarrega a lista
      const mesDoSintoma = anoMesDe(dadosDoFormulario.inicio)
      const mesmoMes = mesDoSintoma.ano === mesSelecionado.ano && mesDoSintoma.mes === mesSelecionado.mes

      if (mesmoMes) {
        carregar()
      } else {
        setMesSelecionado(mesDoSintoma)
      }
    } catch (erroDaApi) {
      setErroAoSalvar(erroDaApi.message)
    } finally {
      setSalvando(false)
    }
  }

  // Delete
  async function removerSintoma(id) {
    const confirmou = window.confirm('Deseja excluir este sintoma?')

    if (!confirmou) {
      return
    }

    setIdExcluindo(id)
    await excluir(id)
    setIdExcluindo(null)
  }

  function renderizarLista() {
    if (carregando) {
      return <Carregando texto="Buscando seus sintomas..." />
    }

    if (erro && sintomas.length === 0) {
      return <MensagemErro mensagem={erro} onTentarNovamente={carregar} />
    }

    if (sintomas.length === 0) {
      return (
        <div className="estado-vazio">
          <div className="estado-vazio-icon">+</div>

          <h2>Nenhum sintoma neste mês</h2>

          <p>
            Clique em "Registrar sintoma" para adicionar
            um novo registro.
          </p>
        </div>
      )
    }

    return (
      <>
        <MensagemErro mensagem={erro} onTentarNovamente={carregar} />

        <div className="sintomas-grid">
          {sintomas.map((sintoma) => (
            <SymptomCard
              key={sintoma.id}
              sintoma={sintoma}
              excluindo={idExcluindo === sintoma.id}
              onEditar={() => iniciarEdicao(sintoma)}
              onExcluir={() => removerSintoma(sintoma.id)}
            />
          ))}
        </div>
      </>
    )
  }

  const editando = sintomaEmEdicao !== null

  if (mostrarFormulario) {
    return (
      <section className="pagina">
        <div className="formulario-container">

          <div className="pagina-header">
            <div>
              <span className="tag">
                {editando ? 'EDITAR REGISTRO' : 'NOVO REGISTRO'}
              </span>

              <h1>{editando ? 'Editar sintoma' : 'Registrar sintoma'}</h1>

              <p>
                Descreva as informações relacionadas ao sintoma.
              </p>
            </div>
          </div>

          <SymptomForm
            sintomaInicial={sintomaEmEdicao}
            salvando={salvando}
            erroDaApi={erroAoSalvar}
            onSalvar={salvarSintoma}
            onCancelar={fecharFormulario}
          />
        </div>
      </section>
    )
  }

  return (
    <section className="pagina">
      <div className="pagina-header">
        <div>
          <span className="tag">REGISTROS</span>

          <h1>Meus sintomas</h1>

          <p>
            Seus registros salvos no servidor, organizados por mês.
          </p>
        </div>

        <button
          className="btn-principal"
          onClick={abrirFormulario}
        >
          + Registrar sintoma
        </button>
      </div>

      <SeletorMes
        ano={mesSelecionado.ano}
        mes={mesSelecionado.mes}
        desabilitado={carregando}
        onMudar={setMesSelecionado}
      />

      {renderizarLista()}
    </section>
  )
}

export default Sintomas
