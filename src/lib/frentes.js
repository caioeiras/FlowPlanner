// Regras da tela principal: quanto tempo cada frente está parada, quão perto
// está a data limite de decisão, e em que ordem a lista aparece.
import { diasEntre } from './formato.js'

// Limiares de "dias sem andar". Palpite inicial — ajustar com o uso.
export const DIAS_ATENCAO = 5
export const DIAS_ATRASO = 10
// Decisão com até 3 dias é crítica; até 10, já merece atenção.
export const DECISAO_CRITICA = 3
export const DECISAO_PROXIMA = 10

const PESO = { atrasado: 2, atencao: 1, ok: 0 }

export function diasParado(ultimoAvanco, hoje) {
  if (!ultimoAvanco) return null
  return Math.max(0, diasEntre(ultimoAvanco, hoje))
}

export function nivelParado(dias) {
  if (dias == null) return 'ok'
  if (dias >= DIAS_ATRASO) return 'atrasado'
  if (dias >= DIAS_ATENCAO) return 'atencao'
  return 'ok'
}

export function urgenciaDecisao(dataLimite, hoje) {
  if (!dataLimite) return null
  const falta = diasEntre(hoje, dataLimite)
  if (falta < 0) return 'vencida'
  if (falta <= DECISAO_CRITICA) return 'critica'
  if (falta <= DECISAO_PROXIMA) return 'proxima'
  return 'folga'
}

// O pior dos dois sinais decide a cor da linha.
export function nivelFrente(dias, urgencia) {
  const parado = nivelParado(dias)
  if (urgencia === 'vencida' || urgencia === 'critica' || parado === 'atrasado') return 'atrasado'
  if (urgencia === 'proxima' || parado === 'atencao') return 'atencao'
  return 'ok'
}

export function textoDecisao(dataLimite, hoje) {
  if (!dataLimite) return 'Sem decisão pendente'
  const falta = diasEntre(hoje, dataLimite)
  const [, m, d] = dataLimite.split('-')
  if (falta < 0) return `Decisão vencida há ${-falta} ${-falta === 1 ? 'dia' : 'dias'}`
  if (falta === 0) return 'Decidir hoje'
  if (falta <= DECISAO_CRITICA) return `Decidir em ${falta} ${falta === 1 ? 'dia' : 'dias'}`
  return `Decidir até ${d}/${m}`
}

// Só frentes em andamento entram na lista. Ordem: nível (vermelho primeiro),
// depois mais dias parado, depois a decisão mais próxima.
export function montarFrentes(servicos, hoje) {
  return servicos
    .filter((s) => s.status === 'em_andamento')
    .map((s) => {
      const dias = diasParado(s.ultimo_avanco ?? s.data_inicio, hoje)
      const urgencia = urgenciaDecisao(s.data_limite_decisao, hoje)
      return { ...s, dias, urgencia, nivel: nivelFrente(dias, urgencia) }
    })
    .sort((a, b) =>
      PESO[b.nivel] - PESO[a.nivel] ||
      (b.dias ?? 0) - (a.dias ?? 0) ||
      (a.data_limite_decisao ?? '9999').localeCompare(b.data_limite_decisao ?? '9999'))
}

// Os três números do topo da tela.
export function resumoFrentes(frentes, hoje) {
  const paradas = frentes.filter((f) => nivelParado(f.dias) === 'atrasado').length
  const decidirEmUmaSemana = frentes.filter((f) =>
    f.data_limite_decisao && diasEntre(hoje, f.data_limite_decisao) <= 7).length
  let entrega = 'no_prazo'
  if (frentes.some((f) => f.nivel === 'atrasado')) entrega = 'em_risco'
  else if (frentes.some((f) => f.nivel === 'atencao')) entrega = 'atencao'
  return { paradas, decidirEmUmaSemana, entrega }
}

// Régua de dias parado: escala fixa, para duas linhas serem comparáveis a olho.
export const REGUA_DIAS = 15
export function posicaoNaRegua(dias) {
  return Math.min(100, Math.round(((dias ?? 0) / REGUA_DIAS) * 100))
}

// Quanto a obra "deveria" estar pronta hoje, em linha reta entre início e entrega.
export function avancoEsperado(dataInicio, dataEntrega, hoje) {
  const total = diasEntre(dataInicio, dataEntrega)
  if (total <= 0) return 100
  const passados = diasEntre(dataInicio, hoje)
  return Math.min(100, Math.max(0, Math.round((passados / total) * 100)))
}
