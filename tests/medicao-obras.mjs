// Medição por empreiteiro e validação do cadastro de obra.
import { resumoPorEmpreiteiro, totaisMedicao } from '../src/lib/medicao.js'
import { escolherObraInicial, textoPrazoEntrega, validarObra } from '../src/lib/obras.js'
import { podeVerFornecedor, podeVerValores } from '../src/lib/perfis.js'

let ok = 0
let tot = 0
function conferir(descricao, real, esperado) {
  tot++
  if (JSON.stringify(real) === JSON.stringify(esperado)) ok++
  else console.log(`  ✗ ${descricao}\n     esperado: ${JSON.stringify(esperado)}\n     veio:     ${JSON.stringify(real)}`)
}

// ---- medição ----
const servicos = [
  { id: 's1', empreiteiro_id: 'e1', valor_contratado: 100000, avanco_pct: 40 },
  { id: 's2', empreiteiro_id: 'e1', valor_contratado: 100000, avanco_pct: 20 },
  { id: 's3', empreiteiro_id: 'e2', valor_contratado: 50000, avanco_pct: 80 },
]
const medicoes = [
  { servico_id: 's1', valor: 30000 }, { servico_id: 's1', valor: 30000 },
  { servico_id: 's3', valor: 20000 },
]
const emps = [{ id: 'e1', nome: 'Alfa' }, { id: 'e2', nome: 'Beta' }]
const linhas = resumoPorEmpreiteiro(servicos, medicoes, emps)
const alfa = linhas.find((l) => l.nome === 'Alfa')
conferir('soma o contratado dos serviços do empreiteiro', alfa.contratado, 200000)
conferir('soma várias medições do mesmo serviço', alfa.medido, 60000)
conferir('executado é ponderado pelo valor', alfa.pctExecutado, 30)
conferir('medido 30% x executado 30%: sem alerta', alfa.alerta, false)
const beta = linhas.find((l) => l.nome === 'Beta')
conferir('medido abaixo do executado: sem alerta', beta.alerta, false)
const comAdiantamento = resumoPorEmpreiteiro(servicos, [...medicoes, { servico_id: 's2', valor: 40000 }], emps)
conferir('medido 50% com executado 30%: alerta acende', comAdiantamento.find((l) => l.nome === 'Alfa').alerta, true)
conferir('quem tem alerta vem primeiro', comAdiantamento[0].nome, 'Alfa')
conferir('totais', totaisMedicao(linhas), { contratado: 250000, medido: 80000, pctMedido: 32, alertas: 0 })

// ---- obra ----
const boa = { nome: 'Casa X', codigo: 'OB-1', cliente_nome: 'Fulano', data_inicio: '2026-01-01', data_meta_entrega: '2026-12-01', situacao: 'em_andamento' }
conferir('obra completa passa', validarObra(boa), {})
conferir('entrega antes do início é recusada', Object.keys(validarObra({ ...boa, data_meta_entrega: '2025-12-01' })), ['data_meta_entrega'])
conferir('situação fora da lista é recusada', Object.keys(validarObra({ ...boa, situacao: 'pausada' })), ['situacao'])
conferir('sem nome é recusada', Object.keys(validarObra({ ...boa, nome: '  ' })), ['nome'])

const obras = [{ id: 'o1', situacao: 'concluida' }, { id: 'o2', situacao: 'em_andamento' }]
conferir('volta na obra guardada', escolherObraInicial(obras, 'o1'), 'o1')
conferir('obra guardada sem acesso: abre a primeira em andamento', escolherObraInicial(obras, 'o9'), 'o2')
conferir('sem nenhuma obra: null', escolherObraInicial([], 'o1'), null)

conferir('prazo: faltam dias', textoPrazoEntrega('2026-10-18', '2026-10-08'), 'Faltam 10 dias')
conferir('prazo: singular', textoPrazoEntrega('2026-10-09', '2026-10-08'), 'Falta 1 dia')
conferir('prazo: hoje', textoPrazoEntrega('2026-10-08', '2026-10-08'), 'Entrega hoje')
conferir('prazo: atrasada', textoPrazoEntrega('2026-10-05', '2026-10-08'), 'Atrasada 3 dias')

// ---- perfis ----
conferir('engenheiro vê valores', podeVerValores('engenheiro'), true)
conferir('mestre não vê valores', podeVerValores('mestre'), false)
conferir('arquiteta não vê valores', podeVerValores('arquiteta'), false)
conferir('cliente não vê valores', podeVerValores('cliente'), false)
conferir('cliente não vê fornecedor', podeVerFornecedor('cliente'), false)
conferir('perfil desconhecido não vê nada', podeVerValores(undefined), false)

console.log(`${ok}/${tot} — medição, obras e perfis`)
process.exit(ok === tot ? 0 : 1)
