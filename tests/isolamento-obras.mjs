// MULTI-OBRA: nenhuma busca devolve dado de outra obra, e cada perfil só
// recebe o que pode ver. Roda contra a camada de dados (hoje, o mock).
import * as dados from '../src/lib/dados.js'
import { mockUsuarios } from '../src/lib/mockData.js'

let ok = 0
let tot = 0
function conferir(descricao, real, esperado) {
  tot++
  if (JSON.stringify(real) === JSON.stringify(esperado)) ok++
  else console.log(`  ✗ ${descricao}\n     esperado: ${JSON.stringify(esperado)}\n     veio:     ${JSON.stringify(real)}`)
}
const u = (id) => mockUsuarios.find((x) => x.id === id)
const obrasDe = (lista) => [...new Set(lista.map((x) => x.obra_id))]

dados.definirUsuario(u('u-eng'))

// Sem obra escolhida, a camada se recusa a buscar lançamento.
dados.definirObraAtual(null)
let travou = false
try { await dados.listarServicos() } catch { travou = true }
conferir('sem obra selecionada, a busca trava', travou, true)

for (const obra of ['o1', 'o2']) {
  dados.definirObraAtual(obra)
  const s = await dados.listarServicos()
  const a = await dados.listarAmbientes()
  const p = await dados.listarPendencias()
  const m = await dados.obterMedicao()
  const d = await dados.obterDiarioDeHoje()
  conferir(`${obra}: serviços só da obra`, obrasDe(s.data), [obra])
  conferir(`${obra}: ambientes só da obra`, obrasDe(a.data), [obra])
  conferir(`${obra}: pendências só da obra`, obrasDe(p.data).every((x) => x === obra), true)
  conferir(`${obra}: medições só da obra`, obrasDe(m.data.medicoes), [obra])
  conferir(`${obra}: efetivo só da obra`, obrasDe(d.data.efetivo), [obra])
}

// A o2 não tem pendência nenhuma: é ela que mostra a tela vazia.
dados.definirObraAtual('o2')
conferir('o2 abre sem pendências', (await dados.listarPendencias()).data.length, 0)

// Histórico de um serviço da o1 pedido com a o2 aberta não vaza.
conferir('histórico da o1 não aparece na o2', (await dados.listarHistoricoServico('s1')).data.itens.length, 0)

// Quem vê quais obras.
dados.definirUsuario(u('u-cli'))
conferir('cliente só enxerga a obra dele', (await dados.listarObras()).data.map((o) => o.id), ['o1'])
dados.definirUsuario(u('u-eng'))
conferir('engenheiro enxerga as duas', (await dados.listarObras()).data.map((o) => o.id), ['o1', 'o2'])

// Valores e fornecedores por perfil.
dados.definirObraAtual('o1')
dados.definirUsuario(u('u-mestre'))
const doMestre = (await dados.listarServicos()).data
conferir('mestre não recebe valor contratado', doMestre.every((s) => s.valor_contratado === null), true)
conferir('mestre não abre a medição', (await dados.obterMedicao()).erro !== null, true)
dados.definirUsuario(u('u-cli'))
const doCliente = (await dados.listarServicos()).data
conferir('cliente não recebe nome de fornecedor', doCliente.every((s) => s.empreiteiro_nome === null), true)
conferir('cliente não recebe valor', doCliente.every((s) => s.valor_contratado === null), true)
dados.definirUsuario(u('u-eng'))
conferir('engenheiro recebe valor', (await dados.listarServicos()).data.every((s) => typeof s.valor_contratado === 'number'), true)

console.log(`${ok}/${tot} — isolamento entre obras`)
process.exit(ok === tot ? 0 : 1)
