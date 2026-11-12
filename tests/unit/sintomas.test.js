import { describe, expect, test } from 'vitest'
import { buscarTipo, SUBTIPOS_DOR, TIPOS_SINTOMA } from '../../src/constants/sintomas'

describe('tipos de sintoma', () => {
  test('buscarTipo encontra um tipo cadastrado', () => {
    expect(buscarTipo('DOR').rotulo).toBe('Dor')
  })

  test('buscarTipo usa "Outro" quando o tipo não existe', () => {
    expect(buscarTipo('INEXISTENTE').valor).toBe('OUTRO')
  })

  test('não existem tipos repetidos', () => {
    const valores = TIPOS_SINTOMA.map(tipo => tipo.valor)
    expect(new Set(valores).size).toBe(valores.length)
  })

  test('dor possui subtipos', () => {
    expect(SUBTIPOS_DOR).toContain('CABEÇA')
  })
})
