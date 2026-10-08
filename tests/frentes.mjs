// Regras da tela de frentes: dias parado, urgência de decisão, ordem da lista.
import { diasParado, montarFrentes, nivelFrente, posicaoNaRegua, resumoFrentes, textoDecisao, urgenciaDecisao, avancoEsperado } from '../src/lib/frentes.js'
import { diasEntre, somarDias } from '../src/lib/formato.js'

let ok = 0
let tot = 0
function conferir(descricao, real, esperado) {
  tot++
  if (JSON.stringify(real) === JSON.stringify(esperado)) ok++
  else console.log(`  ✗ ${descricao}\n     esperado: ${JSON.stringify(esperado)}\n     veio:     ${JSON.stringify(real)}`)
}

const hoje = '2026-10-08'

conferir('diasEntre atravessa o fim do mês', diasEntre('2026-09-24', hoje), 14)
conferir('somarDias volta no mês anterior', somarDias(hoje, -14), '2026-09-24')
conferir('diasParado: andou hoje = 0', diasParado(hoje, hoje), 0)
conferir('diasParado: sem registro = null', diasParado(null, hoje), null)
conferir('diasParado: registro no futuro não fica negativo', diasParado('2026-10-10', hoje), 0)

conferir('decisão daqui a 2 dias é crítica', urgenciaDecisao('2026-10-10', hoje), 'critica')
conferir('decisão ontem é vencida', urgenciaDecisao('2026-10-07', hoje), 'vencida')
conferir('decisão daqui a 9 dias é próxima', urgenciaDecisao('2026-10-17', hoje), 'proxima')
conferir('decisão daqui a 30 dias tem folga', urgenciaDecisao('2026-11-07', hoje), 'folga')

conferir('10 dias parado é atrasado', nivelFrente(10, 'folga'), 'atrasado')
conferir('decisão crítica deixa vermelho mesmo andando', nivelFrente(0, 'critica'), 'atrasado')
conferir('5 dias parado é atenção', nivelFrente(5, null), 'atencao')
conferir('4 dias e decisão com folga é ok', nivelFrente(4, 'folga'), 'ok')

conferir('texto: decidir hoje', textoDecisao(hoje, hoje), 'Decidir hoje')
conferir('texto: vencida no singular', textoDecisao('2026-10-07', hoje), 'Decisão vencida há 1 dia')
conferir('texto: data longe mostra a data', textoDecisao('2026-11-03', hoje), 'Decidir até 03/11')

const servicos = [
  { id: 'a', status: 'em_andamento', ultimo_avanco: '2026-10-06', data_limite_decisao: null },          // 2d ok
  { id: 'b', status: 'em_andamento', ultimo_avanco: '2026-09-24', data_limite_decisao: '2026-11-30' },  // 14d atrasado
  { id: 'c', status: 'em_andamento', ultimo_avanco: '2026-10-07', data_limite_decisao: '2026-10-09' },  // 1d mas decisão crítica
  { id: 'd', status: 'em_andamento', ultimo_avanco: '2026-10-02', data_limite_decisao: null },          // 6d atenção
  { id: 'e', status: 'concluido', ultimo_avanco: '2026-08-01', data_limite_decisao: null },             // fora
  { id: 'f', status: 'nao_iniciado', ultimo_avanco: null, data_limite_decisao: '2026-10-09' },          // fora
]
const frentes = montarFrentes(servicos, hoje)
conferir('só entra o que está em andamento', frentes.length, 4)
conferir('ordem: vermelhos (mais parado primeiro), depois âmbar, depois verde', frentes.map((f) => f.id), ['b', 'c', 'd', 'a'])

const r = resumoFrentes(frentes, hoje)
conferir('conta só as paradas há 10+ dias', r.paradas, 1)
conferir('conta decisões nos próximos 7 dias', r.decidirEmUmaSemana, 1)
conferir('entrega em risco quando há frente vermelha', r.entrega, 'em_risco')
conferir('entrega no prazo sem nada amarelo ou vermelho', resumoFrentes(montarFrentes([servicos[0]], hoje), hoje).entrega, 'no_prazo')

conferir('avanço esperado na metade do prazo', avancoEsperado('2026-01-01', '2026-12-31', '2026-07-02'), 50)
conferir('avanço esperado não passa de 100', avancoEsperado('2026-01-01', '2026-02-01', hoje), 100)

conferir('régua: 5 dias fica a um terço', posicaoNaRegua(5), 33)
conferir('régua: passou da escala, para no fim', posicaoNaRegua(40), 100)
conferir('régua: sem registro começa no zero', posicaoNaRegua(null), 0)

console.log(`${ok}/${tot} — frentes`)
process.exit(ok === tot ? 0 : 1)
