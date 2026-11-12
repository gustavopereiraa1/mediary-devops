import { useCallback, useEffect, useState } from 'react'
import * as sintomasService from '../services/sintomasService'
import { ehErroDeSessao, mensagemDeErro } from '../services/api'
import { useAuth } from './useAuth'

// Busca os sintomas do mês selecionado e expõe as operações do CRUD
export function useSintomas(ano, mes) {
  const { encerrarSessaoLocal } = useAuth()

  // "versao" aumenta quando o usuário pede para recarregar a lista
  const [versao, setVersao] = useState(0)
  const consulta = `${ano}-${mes}-${versao}`

  // Guarda de qual consulta veio a resposta, para saber se ainda está carregando
  const [resultado, setResultado] = useState({ consulta: null, sintomas: [], erro: '' })
  const carregando = resultado.consulta !== consulta

  // Se a sessão expirou (401), volta para a tela de login
  const tratarErro = useCallback((erroDaApi, mensagemPadrao) => {
    if (ehErroDeSessao(erroDaApi)) {
      encerrarSessaoLocal()
    }

    return mensagemDeErro(erroDaApi, mensagemPadrao)
  }, [encerrarSessaoLocal])

  // READ
  useEffect(() => {
    let ativo = true // ignora a resposta se o usuário já trocou de mês

    sintomasService
      .listarSintomasDoMes(ano, mes)
      .then((sintomas) => {
        if (ativo) setResultado({ consulta, sintomas, erro: '' })
      })
      .catch((erroDaApi) => {
        if (ativo) {
          const erro = tratarErro(erroDaApi, 'Não foi possível carregar os sintomas.')
          setResultado({ consulta, sintomas: [], erro })
        }
      })

    return () => {
      ativo = false
    }
  }, [ano, mes, consulta, tratarErro])

  const carregar = useCallback(() => {
    setVersao(atual => atual + 1)
  }, [])

  // CREATE e UPDATE lançam o erro para o formulário mostrar a mensagem
  async function criar(dados) {
    try {
      await sintomasService.criarSintoma(dados)
    } catch (erroDaApi) {
      throw new Error(tratarErro(erroDaApi, 'Não foi possível salvar o sintoma.'), { cause: erroDaApi })
    }
  }

  async function atualizar(id, dados) {
    try {
      await sintomasService.atualizarSintoma(id, dados)
    } catch (erroDaApi) {
      throw new Error(tratarErro(erroDaApi, 'Não foi possível salvar as alterações.'), { cause: erroDaApi })
    }
  }

  // DELETE: só remove da tela depois que a API confirmar
  async function excluir(id) {
    try {
      await sintomasService.excluirSintoma(id)
      setResultado(anterior => ({
        ...anterior,
        erro: '',
        sintomas: anterior.sintomas.filter(sintoma => sintoma.id !== id),
      }))
    } catch (erroDaApi) {
      const erro = tratarErro(erroDaApi, 'Não foi possível excluir o sintoma.')
      setResultado(anterior => ({ ...anterior, erro }))
    }
  }

  return {
    sintomas: resultado.sintomas,
    erro: resultado.erro,
    carregando,
    carregar,
    criar,
    atualizar,
    excluir,
  }
}
