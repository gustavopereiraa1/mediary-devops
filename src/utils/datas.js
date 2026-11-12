// A API usa o formato "YYYY-MM-DD HH:MM:SS" e o <input type="datetime-local"> usa "YYYY-MM-DDTHH:MM"

const NOMES_DOS_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function doisDigitos(numero) {
  return String(numero).padStart(2, '0')
}

// Data/hora atual no formato do input (horário local)
export function agoraParaInput() {
  const agora = new Date()
  const data = `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`
  return `${data}T${doisDigitos(agora.getHours())}:${doisDigitos(agora.getMinutes())}`
}

// "2026-11-10 14:30:00" -> "2026-11-10T14:30"
export function apiParaInput(valor) {
  return valor ? valor.slice(0, 16).replace(' ', 'T') : ''
}

// "2026-11-10T14:30" -> "2026-11-10 14:30:00"
export function inputParaApi(valor) {
  return valor ? `${valor.replace('T', ' ')}:00` : null
}

// "2026-11-10 14:30:00" -> "10/11/2026 às 14:30"
export function formatarDataHora(valor) {
  if (!valor) {
    return ''
  }

  const [data, hora] = valor.split(' ')
  const [ano, mes, dia] = data.split('-')

  return `${dia}/${mes}/${ano} às ${hora.slice(0, 5)}`
}

// Ano e mês (1 a 12) de uma data da API ou do input
export function anoMesDe(valor) {
  const [ano, mes] = valor.slice(0, 7).split('-')
  return { ano: Number(ano), mes: Number(mes) }
}

export function nomeDoMes(mes) {
  return NOMES_DOS_MESES[mes - 1]
}
