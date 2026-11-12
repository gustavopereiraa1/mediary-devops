import { describe, expect, test } from 'vitest'
import { ehErroDeSessao, mensagemDeErro } from '../../src/services/api'

describe('mensagens de erro da API', () => {
  test('timeout mostra mensagem de demora', () => {
    expect(mensagemDeErro({ code: 'ECONNABORTED' })).toContain('demorou')
  })

  test('sem resposta indica que o servidor está fora do ar', () => {
    expect(mensagemDeErro({})).toContain('Não foi possível conectar')
  })

  test('502 também indica servidor fora do ar', () => {
    expect(mensagemDeErro({ response: { status: 502 } })).toContain('Não foi possível conectar')
  })

  test('erro 500 mostra mensagem de erro interno', () => {
    expect(mensagemDeErro({ response: { status: 500 } })).toContain('erro')
  })

  test('erro de validação usa a mensagem enviada pela API', () => {
    const erro = { response: { status: 400, data: { error: 'E-mail já cadastrado' } } }
    expect(mensagemDeErro(erro)).toBe('E-mail já cadastrado')
  })

  test('sem mensagem da API usa a mensagem padrão', () => {
    expect(mensagemDeErro({ response: { status: 400, data: {} } }, 'Falhou')).toBe('Falhou')
  })

  test('401 é erro de sessão', () => {
    expect(ehErroDeSessao({ response: { status: 401 } })).toBe(true)
    expect(ehErroDeSessao({ response: { status: 400 } })).toBe(false)
  })
})
