// Tipos aceitos pela API (mesmas chaves da tabela "sintomas" do banco)
export const TIPOS_SINTOMA = [
  { valor: 'DOR', rotulo: 'Dor', icone: '💢' },
  { valor: 'NAUSEA', rotulo: 'Náusea', icone: '🤢' },
  { valor: 'FADIGA', rotulo: 'Fadiga', icone: '😴' },
  { valor: 'VERTIGEM', rotulo: 'Vertigem', icone: '💫' },
  { valor: 'FALTA_AR', rotulo: 'Falta de ar', icone: '😮‍💨' },
  { valor: 'TOSSE', rotulo: 'Tosse', icone: '🤧' },
  { valor: 'DIARREIA', rotulo: 'Diarreia', icone: '🚽' },
  { valor: 'CONSTIPACAO', rotulo: 'Constipação', icone: '🫃' },
  { valor: 'COCEIRA', rotulo: 'Coceira', icone: '🖐️' },
  { valor: 'OUTRO', rotulo: 'Outro', icone: '•••' },
]

// Subtipos só existem para DOR
export const SUBTIPOS_DOR = [
  'CABEÇA', 'ABDOMINAL', 'MUSCULAR', 'COSTAS', 'ARTICULAÇÃO', 'GARGANTA', 'OUTRO',
]

export function buscarTipo(valor) {
  return TIPOS_SINTOMA.find(tipo => tipo.valor === valor) ?? TIPOS_SINTOMA.at(-1)
}
