// ============================================================
// DADOS DE EXEMPLO (mock) — o app roda sem banco enquanto isto
// estiver ligado. Os nomes de campo são os das tabelas futuras;
// na Etapa 7 estas mesmas duas obras viram a carga inicial do banco.
//
// DUAS OBRAS, DIFERENTES DE PROPÓSITO:
//   o1 Residência Moraes — cheia: 9 serviços, frentes paradas,
//      medições, 4 pendências, cliente com acesso.
//   o2 Casa Granja Viana — enxuta: 4 serviços, tudo andando,
//      NENHUMA pendência (mostra a tela vazia), sem cliente.
// Se uma tela mostrar algo da o1 enquanto a o2 está aberta,
// é defeito — e é aqui que ele tem que aparecer.
//
// As datas são relativas a hoje, para o "dias parado" fazer
// sentido em qualquer dia que você abrir o app.
// ============================================================
import { isoLocal, somarDias } from './formato.js'

export const USAR_MOCK = true

const hoje = isoLocal()
const atras = (n) => somarDias(hoje, -n)
const adiante = (n) => somarDias(hoje, n)

export const mockUsuarios = [
  { id: 'u-eng', nome: 'Caio Eiras', role: 'engenheiro' },
  { id: 'u-mestre', nome: 'Valdir Souza', role: 'mestre' },
  { id: 'u-arq', nome: 'Helena Prado', role: 'arquiteta' },
  { id: 'u-cli', nome: 'Roberto Moraes', role: 'cliente' },
  { id: 'u-novo', nome: 'Conta nova', role: null }, // aguardando liberação
]

export const mockObras = [
  {
    id: 'o1', nome: 'Residência Moraes', codigo: 'OB-0231',
    endereco: 'Al. Itapecuru, 412 — Alphaville, Barueri/SP',
    cliente_nome: 'Roberto e Ana Moraes',
    data_inicio: '2026-01-12', data_meta_entrega: '2027-03-12', situacao: 'em_andamento',
  },
  {
    id: 'o2', nome: 'Casa Granja Viana', codigo: 'OB-0219',
    endereco: 'R. das Paineiras, 88 — Granja Viana, Cotia/SP',
    cliente_nome: 'Luiza Fontana',
    data_inicio: '2025-08-04', data_meta_entrega: '2026-12-18', situacao: 'em_andamento',
  },
]

// Quem acessa qual obra. O mestre e o cliente só estão na o1.
export const mockMembros = [
  { obra_id: 'o1', user_id: 'u-eng' }, { obra_id: 'o2', user_id: 'u-eng' },
  { obra_id: 'o1', user_id: 'u-arq' }, { obra_id: 'o2', user_id: 'u-arq' },
  { obra_id: 'o1', user_id: 'u-mestre' },
  { obra_id: 'o1', user_id: 'u-cli' },
]

// Cadastro de empreiteiros do escritório (não é lançamento de obra).
export const mockEmpreiteiros = [
  { id: 'e1', nome: 'Impercon', contato: 'Rogério' },
  { id: 'e2', nome: 'Alumax Esquadrias', contato: 'Sérgio' },
  { id: 'e3', nome: 'Gesso Ideal', contato: 'Marcos' },
  { id: 'e4', nome: 'Voltec Instalações', contato: 'André' },
  { id: 'e5', nome: 'JR Pisos', contato: 'Juliano' },
  { id: 'e6', nome: 'Hidroforte', contato: 'Paulo' },
  { id: 'e7', nome: 'Equipe própria', contato: 'Valdir' },
  { id: 'e8', nome: 'Arte Nova Pinturas', contato: 'Cláudio' },
  { id: 'e9', nome: 'Pedra Fina Marmoraria', contato: 'Wagner' },
]

// `parado` = há quantos dias foi o último "andou" no diário (só para gerar o histórico).
const servicosBase = [
  // ---- o1: Residência Moraes ----
  { id: 's1', obra_id: 'o1', nome: 'Impermeabilização das áreas molhadas', empreiteiro_id: 'e1', valor_contratado: 48200, avanco_pct: 35, status: 'em_andamento', data_inicio: atras(60), data_limite_decisao: adiante(2), parado: 14 },
  { id: 's2', obra_id: 'o1', nome: 'Esquadrias de alumínio', empreiteiro_id: 'e2', valor_contratado: 184000, avanco_pct: 38, status: 'em_andamento', data_inicio: atras(75), data_limite_decisao: adiante(6), parado: 12 },
  { id: 's3', obra_id: 'o1', nome: 'Forro de gesso do térreo', empreiteiro_id: 'e3', valor_contratado: 67400, avanco_pct: 30, status: 'em_andamento', data_inicio: atras(40), data_limite_decisao: adiante(12), parado: 10 },
  { id: 's4', obra_id: 'o1', nome: 'Elétrica do 2º pavimento', empreiteiro_id: 'e4', valor_contratado: 156500, avanco_pct: 66, status: 'em_andamento', data_inicio: atras(90), data_limite_decisao: adiante(19), parado: 6 },
  { id: 's5', obra_id: 'o1', nome: 'Revestimento cerâmico da cozinha', empreiteiro_id: 'e5', valor_contratado: 92300, avanco_pct: 20, status: 'em_andamento', data_inicio: atras(20), data_limite_decisao: adiante(26), parado: 5 },
  { id: 's6', obra_id: 'o1', nome: 'Contrapiso das suítes', empreiteiro_id: 'e7', valor_contratado: 38900, avanco_pct: 70, status: 'em_andamento', data_inicio: atras(15), data_limite_decisao: null, parado: 1 },
  { id: 's7', obra_id: 'o1', nome: 'Hidráulica de água quente', empreiteiro_id: 'e6', valor_contratado: 112000, avanco_pct: 78, status: 'em_andamento', data_inicio: atras(85), data_limite_decisao: null, parado: 0 },
  { id: 's8', obra_id: 'o1', nome: 'Pintura interna', empreiteiro_id: 'e8', valor_contratado: 74800, avanco_pct: 0, status: 'nao_iniciado', data_inicio: null, data_limite_decisao: adiante(40), parado: null },
  { id: 's9', obra_id: 'o1', nome: 'Estrutura de concreto', empreiteiro_id: 'e7', valor_contratado: 412000, avanco_pct: 100, status: 'concluido', data_inicio: atras(250), data_limite_decisao: null, parado: 90 },
  // ---- o2: Casa Granja Viana ----
  { id: 't1', obra_id: 'o2', nome: 'Pintura externa', empreiteiro_id: 'e8', valor_contratado: 58000, avanco_pct: 45, status: 'em_andamento', data_inicio: atras(25), data_limite_decisao: adiante(30), parado: 2 },
  { id: 't2', obra_id: 'o2', nome: 'Bancadas de granito', empreiteiro_id: 'e9', valor_contratado: 41500, avanco_pct: 20, status: 'em_andamento', data_inicio: atras(12), data_limite_decisao: adiante(9), parado: 4 },
  { id: 't3', obra_id: 'o2', nome: 'Paisagismo', empreiteiro_id: 'e7', valor_contratado: 22000, avanco_pct: 0, status: 'nao_iniciado', data_inicio: null, data_limite_decisao: adiante(35), parado: null },
  { id: 't4', obra_id: 'o2', nome: 'Louças e metais', empreiteiro_id: 'e6', valor_contratado: 18600, avanco_pct: 60, status: 'em_andamento', data_inicio: atras(8), data_limite_decisao: null, parado: 1 },
]

export const mockServicos = servicosBase.map(({ parado: _p, ...s }) => s)

const notas = {
  s1: 'Aguardando manta asfáltica do fornecedor.',
  s2: 'Medidas dos vãos da suíte master conferidas. Aguardando fabricação.',
  s3: 'Parado esperando a elétrica liberar o teto da sala.',
  s4: 'Enfiação dos quartos 70% concluída.',
  s5: 'Porcelanato chegou; falta definir a paginação com a arquiteta.',
  s6: 'Suíte 1 concluída, suíte 2 em execução.',
  s7: 'Teste de estanqueidade dos banheiros OK.',
  s9: 'Última laje concretada e desformada.',
  t1: 'Fachada frontal com segunda demão.',
  t2: 'Gabarito das bancadas da cozinha entregue.',
  t4: 'Louças dos banheiros sociais instaladas.',
}

// Diários: um por dia em que algo andou, e os serviços que andaram nele.
export const mockDiarios = []
export const mockDiarioServicos = []
for (const s of servicosBase) {
  if (s.parado == null) continue
  for (const [i, n] of [s.parado + 6, s.parado + 3, s.parado].entries()) {
    const data = atras(n)
    let diario = mockDiarios.find((d) => d.obra_id === s.obra_id && d.data === data)
    if (!diario) {
      diario = { id: `d-${s.obra_id}-${data}`, obra_id: s.obra_id, data, clima: 'sol', observacao: '', autor_id: 'u-mestre' }
      mockDiarios.push(diario)
    }
    const ultimo = i === 2
    mockDiarioServicos.push({
      id: `ds-${s.id}-${n}`, obra_id: s.obra_id, diario_id: diario.id, servico_id: s.id,
      situacao: ultimo && s.status === 'concluido' ? 'concluiu' : 'andou',
      nota: ultimo ? notas[s.id] ?? '' : 'Avanço registrado.',
    })
  }
}

// Pessoas no canteiro no último diário de cada obra (sugestão para o de hoje).
export const mockEfetivo = [
  { obra_id: 'o1', empreiteiro_id: 'e7', pessoas: 5 },
  { obra_id: 'o1', empreiteiro_id: 'e6', pessoas: 3 },
  { obra_id: 'o1', empreiteiro_id: 'e4', pessoas: 4 },
  { obra_id: 'o1', empreiteiro_id: 'e5', pessoas: 2 },
  { obra_id: 'o2', empreiteiro_id: 'e8', pessoas: 3 },
  { obra_id: 'o2', empreiteiro_id: 'e6', pessoas: 1 },
]

export const mockMedicoes = [
  { id: 'm1', obra_id: 'o1', servico_id: 's1', data: atras(13), valor: 28900 },
  { id: 'm2', obra_id: 'o1', servico_id: 's2', data: atras(13), valor: 92000 },
  { id: 'm3', obra_id: 'o1', servico_id: 's3', data: atras(13), valor: 20200 },
  { id: 'm4', obra_id: 'o1', servico_id: 's4', data: atras(13), valor: 101700 },
  { id: 'm5', obra_id: 'o1', servico_id: 's5', data: atras(13), valor: 18000 },
  { id: 'm6', obra_id: 'o1', servico_id: 's6', data: atras(13), valor: 27000 },
  { id: 'm7', obra_id: 'o1', servico_id: 's7', data: atras(13), valor: 84000 },
  { id: 'm8', obra_id: 'o1', servico_id: 's9', data: atras(90), valor: 412000 },
  { id: 'm9', obra_id: 'o2', servico_id: 't1', data: atras(5), valor: 20000 },
  { id: 'm10', obra_id: 'o2', servico_id: 't4', data: atras(5), valor: 11000 },
]

export const mockAmbientes = [
  { id: 'a1', obra_id: 'o1', nome: 'Sala de estar', avanco_pct: 62 },
  { id: 'a2', obra_id: 'o1', nome: 'Cozinha', avanco_pct: 48 },
  { id: 'a3', obra_id: 'o1', nome: 'Suíte master', avanco_pct: 55 },
  { id: 'a4', obra_id: 'o1', nome: 'Suítes 1 e 2', avanco_pct: 64 },
  { id: 'a5', obra_id: 'o1', nome: 'Banheiros', avanco_pct: 41 },
  { id: 'a6', obra_id: 'o1', nome: 'Área gourmet', avanco_pct: 30 },
  { id: 'a7', obra_id: 'o1', nome: 'Fachada', avanco_pct: 58 },
  { id: 'b1', obra_id: 'o2', nome: 'Sala e jantar', avanco_pct: 92 },
  { id: 'b2', obra_id: 'o2', nome: 'Cozinha', avanco_pct: 85 },
  { id: 'b3', obra_id: 'o2', nome: 'Quartos', avanco_pct: 95 },
  { id: 'b4', obra_id: 'o2', nome: 'Área externa', avanco_pct: 60 },
]

// Fotos: por enquanto só a legenda e um tom para o quadradinho de exemplo.
// Na etapa do banco, `url` aponta para o arquivo no Storage.
export const mockFotos = [
  { id: 'f1', obra_id: 'o1', data: atras(0), ambiente_id: 'a4', servico_id: 's6', legenda: 'Contrapiso da suíte 2', tom: 1, url: null },
  { id: 'f2', obra_id: 'o1', data: atras(0), ambiente_id: 'a5', servico_id: 's7', legenda: 'Teste de estanqueidade', tom: 2, url: null },
  { id: 'f3', obra_id: 'o1', data: atras(1), ambiente_id: 'a7', servico_id: null, legenda: 'Fachada leste', tom: 3, url: null },
  { id: 'f4', obra_id: 'o1', data: atras(3), ambiente_id: 'a3', servico_id: 's4', legenda: 'Enfiação da suíte master', tom: 1, url: null },
  { id: 'f5', obra_id: 'o1', data: atras(5), ambiente_id: 'a2', servico_id: 's5', legenda: 'Porcelanato da cozinha', tom: 2, url: null },
  { id: 'f6', obra_id: 'o1', data: atras(12), ambiente_id: 'a1', servico_id: null, legenda: 'Sala com reboco', tom: 3, url: null },
  { id: 'f7', obra_id: 'o2', data: atras(2), ambiente_id: 'b4', servico_id: 't1', legenda: 'Fachada frontal pintada', tom: 1, url: null },
  { id: 'f8', obra_id: 'o2', data: atras(4), ambiente_id: 'b2', servico_id: 't2', legenda: 'Gabarito da bancada', tom: 2, url: null },
]

// Só a o1 tem pendências. A o2 abre a tela vazia de propósito.
export const mockPendencias = [
  { id: 'p1', obra_id: 'o1', servico_id: 's5', titulo: 'Paginação do porcelanato da cozinha', descricao: 'Definir sentido e arremate junto à bancada. Peça 120×60.', status: 'aberta', criado_por: 'u-eng', created_at: atras(6) },
  { id: 'p2', obra_id: 'o1', servico_id: 's3', titulo: 'Detalhe da sanca na sala', descricao: 'Altura da sanca e posição da fita de LED.', status: 'aberta', criado_por: 'u-mestre', created_at: atras(9) },
  { id: 'p3', obra_id: 'o1', servico_id: 's1', titulo: 'Cota do nicho do banho da suíte master', descricao: 'Nicho conflita com a prumada. Precisa de nova cota.', status: 'em_analise', criado_por: 'u-eng', created_at: atras(15) },
  { id: 'p4', obra_id: 'o1', servico_id: 's2', titulo: 'Cor do perfil das esquadrias', descricao: 'Confirmado preto fosco.', status: 'resolvida', criado_por: 'u-arq', created_at: atras(30) },
]
