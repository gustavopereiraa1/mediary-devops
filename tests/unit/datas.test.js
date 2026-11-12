import { describe, expect, test } from 'vitest'
import {
  agoraParaInput,
  anoMesDe,
  apiParaInput,
  formatarDataHora,
  inputParaApi,
  nomeDoMes,
} from '../../src/utils/datas'

describe('conversão de datas entre API e formulário', () => {
  test('apiParaInput converte o formato da API para o input', () => {
    expect(apiParaInput('2026-11-10 14:30:00')).toBe('2026-11-10T14:30')
  })

  test('apiParaInput devolve vazio quando não há data', () => {
    expect(apiParaInput(null)).toBe('')
  })

  test('inputParaApi converte o formato do input para a API', () => {
    expect(inputParaApi('2026-11-10T14:30')).toBe('2026-11-10 14:30:00')
  })

  test('inputParaApi devolve null quando o campo está vazio', () => {
    expect(inputParaApi('')).toBeNull()
  })

  test('agoraParaInput gera a data atual no formato do input', () => {
    expect(agoraParaInput()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})

describe('exibição de datas', () => {
  test('formatarDataHora mostra a data no padrão brasileiro', () => {
    expect(formatarDataHora('2026-11-10 14:30:00')).toBe('10/11/2026 às 14:30')
  })

  test('formatarDataHora devolve vazio sem data', () => {
    expect(formatarDataHora('')).toBe('')
  })

  test('anoMesDe extrai ano e mês como números', () => {
    expect(anoMesDe('2026-03-05 08:00:00')).toEqual({ ano: 2026, mes: 3 })
  })

  test('nomeDoMes devolve o nome do mês', () => {
    expect(nomeDoMes(1)).toBe('Janeiro')
    expect(nomeDoMes(12)).toBe('Dezembro')
  })
})
