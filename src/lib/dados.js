// ============================================================
// CAMADA DE DADOS — a única porta de entrada dos dados do app.
// Nenhuma tela lê o mock nem o Supabase direto: chama estas funções.
//
// MULTI-OBRA: a obra atual é injetada AQUI, por dentro. As telas não
// passam obra_id — assim nenhuma tela consegue esquecer o filtro.
// Toda função de lançamento chama obraAtual(), que trava se não houver obra.
//
// Por enquanto as funções leem o mock (src/lib/mockData.js). Na Etapa 7
// troca-se o miolo de cada uma pela consulta ao Supabase; as telas não mudam.
// Toda função devolve { data, erro } — a tela nunca vê o formato cru.
// ============================================================
import {
  mockAmbientes, mockDiarioServicos, mockDiarios, mockEfetivo, mockEmpreiteiros,
  mockFotos, mockMedicoes, mockMembros, mockObras, mockPendencias, mockServicos, mockUsuarios,
} from './mockData.js'
import { isoLocal } from './formato.js'
import { podeAcessar, podeVerFornecedor, podeVerValores } from './perfis.js'

let usuarioAtual = null
let obraAtualId = null

export function definirUsuario(u) { usuarioAtual = u }
export function definirObraAtual(id) { obraAtualId = id }

function obraAtual() {
  if (!obraAtualId) throw new Error('Nenhuma obra selecionada — a camada de dados não busca sem obra.')
  return obraAtualId
}

// Imita a demora da rede, para os estados de "carregando" aparecerem.
const esperar = () => new Promise((r) => setTimeout(r, 120))
async function ok(data) { await esperar(); return { data: structuredClone(data), erro: null } }
async function falha(msg) { await esperar(); return { data: null, erro: msg } }
const novoId = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`

const daObra = (lista) => lista.filter((x) => x.obra_id === obraAtual())

// ---------- usuários (modo de teste) ----------
export const listarUsuariosDeTeste = () => ok(mockUsuarios)

// ---------- obras ----------
export function listarObras() {
  if (!usuarioAtual) return falha('Sem usuário.')
  const ids = mockMembros.filter((m) => m.user_id === usuarioAtual.id).map((m) => m.obra_id)
  return ok(mockObras.filter((o) => ids.includes(o.id)))
}

export function salvarObra(dados) {
  if (usuarioAtual?.role !== 'engenheiro') return falha('Só o engenheiro cadastra obra.')
  if (dados.id) {
    const i = mockObras.findIndex((o) => o.id === dados.id)
    mockObras[i] = { ...mockObras[i], ...dados }
    return ok(mockObras[i])
  }
  const obra = { ...dados, id: novoId('obra') }
  mockObras.push(obra)
  mockMembros.push({ obra_id: obra.id, user_id: usuarioAtual.id })
  return ok(obra)
}

// ---------- frentes de serviço ----------
// Devolve os serviços da obra com a data do último avanço registrado no diário.
// Nome de empreiteiro e valores só saem para quem pode ver.
export function listarServicos() {
  const verValor = podeVerValores(usuarioAtual?.role)
  const verForn = podeVerFornecedor(usuarioAtual?.role)
  const diarios = daObra(mockDiarios)
  const lista = daObra(mockServicos).map((s) => {
    const avancos = daObra(mockDiarioServicos)
      .filter((ds) => ds.servico_id === s.id && ds.situacao !== 'nao_mexeu')
      .map((ds) => diarios.find((d) => d.id === ds.diario_id)?.data)
      .filter(Boolean)
      .sort()
    const emp = mockEmpreiteiros.find((e) => e.id === s.empreiteiro_id)
    return {
      ...s,
      ultimo_avanco: avancos.at(-1) ?? null,
      empreiteiro_nome: verForn ? emp?.nome ?? null : null,
      empreiteiro_contato: verForn ? emp?.contato ?? null : null,
      valor_contratado: verValor ? s.valor_contratado : null,
    }
  })
  return ok(lista)
}

export function listarHistoricoServico(servicoId) {
  const diarios = daObra(mockDiarios)
  const itens = daObra(mockDiarioServicos)
    .filter((ds) => ds.servico_id === servicoId)
    .map((ds) => {
      const d = diarios.find((x) => x.id === ds.diario_id)
      const autor = mockUsuarios.find((u) => u.id === d?.autor_id)
      return { id: ds.id, data: d?.data, situacao: ds.situacao, nota: ds.nota, autor: autor?.nome ?? '—' }
    })
    .sort((a, b) => b.data.localeCompare(a.data))
  const fotos = daObra(mockFotos).filter((f) => f.servico_id === servicoId).length
  return ok({ itens, fotos })
}

// ---------- diário ----------
export function obterDiarioDeHoje() {
  const hoje = isoLocal()
  const diario = daObra(mockDiarios).find((d) => d.data === hoje) ?? null
  const marcados = diario ? daObra(mockDiarioServicos).filter((ds) => ds.diario_id === diario.id) : []
  const servicos = daObra(mockServicos)
    .filter((s) => s.status !== 'concluido')
    .map((s) => ({
      id: s.id, nome: s.nome, status: s.status,
      empreiteiro_nome: mockEmpreiteiros.find((e) => e.id === s.empreiteiro_id)?.nome ?? '—',
      situacao: marcados.find((m) => m.servico_id === s.id)?.situacao ?? 'nao_mexeu',
    }))
  const efetivo = daObra(mockEfetivo).map((e) => ({
    ...e, empreiteiro_nome: mockEmpreiteiros.find((x) => x.id === e.empreiteiro_id)?.nome ?? '—',
  }))
  const fotosHoje = daObra(mockFotos).filter((f) => f.data === hoje)
  return ok({ data: hoje, diario, servicos, efetivo, fotosHoje })
}

export function salvarDiario({ clima, observacao, servicos, efetivo }) {
  if (!podeAcessar(usuarioAtual?.role, 'diario')) return falha('Seu perfil não lança diário.')
  const obra_id = obraAtual()
  const data = isoLocal()
  let diario = mockDiarios.find((d) => d.obra_id === obra_id && d.data === data)
  if (!diario) {
    diario = { id: novoId('d'), obra_id, data, autor_id: usuarioAtual.id }
    mockDiarios.push(diario)
  }
  Object.assign(diario, { clima, observacao })
  for (let i = mockDiarioServicos.length - 1; i >= 0; i--) {
    if (mockDiarioServicos[i].diario_id === diario.id) mockDiarioServicos.splice(i, 1)
  }
  for (const s of servicos.filter((x) => x.situacao !== 'nao_mexeu')) {
    mockDiarioServicos.push({ id: novoId('ds'), obra_id, diario_id: diario.id, servico_id: s.id, situacao: s.situacao, nota: observacao || 'Avanço registrado.' })
    if (s.situacao === 'concluiu') {
      const serv = mockServicos.find((x) => x.id === s.id && x.obra_id === obra_id)
      Object.assign(serv, { status: 'concluido', avanco_pct: 100 })
    } else {
      const serv = mockServicos.find((x) => x.id === s.id && x.obra_id === obra_id)
      if (serv.status === 'nao_iniciado') Object.assign(serv, { status: 'em_andamento', data_inicio: data })
    }
  }
  for (const e of efetivo) {
    const atual = mockEfetivo.find((x) => x.obra_id === obra_id && x.empreiteiro_id === e.empreiteiro_id)
    if (atual) atual.pessoas = e.pessoas
  }
  return ok(diario)
}

// ---------- medição (só engenheiro) ----------
export function obterMedicao() {
  if (!podeVerValores(usuarioAtual?.role)) return falha('Seu perfil não vê valores.')
  return ok({
    servicos: daObra(mockServicos),
    medicoes: daObra(mockMedicoes),
    empreiteiros: mockEmpreiteiros,
  })
}

// ---------- pendências de projeto ----------
export function listarPendencias() {
  const servicos = daObra(mockServicos)
  const lista = daObra(mockPendencias)
    .map((p) => ({ ...p, servico_nome: servicos.find((s) => s.id === p.servico_id)?.nome ?? null }))
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  return ok(lista)
}

export function listarServicosParaVinculo() {
  return ok(daObra(mockServicos).map((s) => ({ id: s.id, nome: s.nome })))
}

export function criarPendencia({ titulo, descricao, servico_id }) {
  if (!podeAcessar(usuarioAtual?.role, 'pendencias')) return falha('Seu perfil não cria pendência.')
  const p = { id: novoId('p'), obra_id: obraAtual(), titulo, descricao, servico_id: servico_id || null, status: 'aberta', criado_por: usuarioAtual.id, created_at: isoLocal() }
  mockPendencias.push(p)
  return ok(p)
}

export function mudarStatusPendencia(id, status) {
  const p = daObra(mockPendencias).find((x) => x.id === id)
  if (!p) return falha('Pendência não encontrada nesta obra.')
  p.status = status
  return ok(p)
}

// ---------- visão do cliente ----------
export const listarAmbientes = () => ok(daObra(mockAmbientes))

export function listarFotosRecentes(dias = 7) {
  const desde = isoLocal(new Date(Date.now() - dias * 86400000))
  const ambientes = daObra(mockAmbientes)
  const fotos = daObra(mockFotos)
    .filter((f) => f.data >= desde)
    .map((f) => ({ id: f.id, data: f.data, legenda: f.legenda, tom: f.tom, url: f.url, ambiente_nome: ambientes.find((a) => a.id === f.ambiente_id)?.nome ?? '' }))
    .sort((a, b) => b.data.localeCompare(a.data))
  return ok(fotos)
}
