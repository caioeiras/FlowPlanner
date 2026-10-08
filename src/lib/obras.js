import { diasEntre } from './formato.js'

// A obra é o centro do app. Este vocabulário tem que ser idêntico ao CHECK
// da coluna `obras.situacao` no banco (Etapa 7).
export const SITUACOES_OBRA = [
  { id: 'em_andamento', rotulo: 'Em andamento', tom: 'ok' },
  { id: 'parada', rotulo: 'Parada', tom: 'atrasado' },
  { id: 'concluida', rotulo: 'Concluída', tom: 'neutro' },
]

export function situacaoObra(id) {
  return SITUACOES_OBRA.find((s) => s.id === id) ?? { id, rotulo: id, tom: 'neutro' }
}

// Devolve { campo: 'mensagem' } com o que está errado; objeto vazio = pode salvar.
export function validarObra(o) {
  const erros = {}
  if (!o.nome?.trim()) erros.nome = 'Dê um nome para a obra.'
  if (!o.codigo?.trim()) erros.codigo = 'Informe um código ou apelido.'
  if (!o.cliente_nome?.trim()) erros.cliente_nome = 'Informe o cliente.'
  if (!o.data_inicio) erros.data_inicio = 'Informe a data de início.'
  if (!o.data_meta_entrega) erros.data_meta_entrega = 'Informe a data-meta de entrega.'
  else if (o.data_inicio && o.data_meta_entrega < o.data_inicio) erros.data_meta_entrega = 'A entrega não pode ser antes do início.'
  if (!SITUACOES_OBRA.some((s) => s.id === o.situacao)) erros.situacao = 'Escolha a situação.'
  return erros
}

// Qual obra abrir: a guardada, se a pessoa ainda tem acesso; senão a primeira em andamento.
export function escolherObraInicial(obras, guardada) {
  if (guardada && obras.some((o) => o.id === guardada)) return guardada
  return (obras.find((o) => o.situacao === 'em_andamento') ?? obras[0])?.id ?? null
}

// "Faltam 155 dias" / "Atrasada 3 dias" — o prazo do cliente no cabeçalho da obra.
export function textoPrazoEntrega(dataMeta, hoje) {
  if (!dataMeta) return 'Sem data de entrega'
  const falta = diasEntre(hoje, dataMeta)
  if (falta < 0) return `Atrasada ${-falta} ${falta === -1 ? 'dia' : 'dias'}`
  if (falta === 0) return 'Entrega hoje'
  return `${falta === 1 ? 'Falta' : 'Faltam'} ${falta} ${falta === 1 ? 'dia' : 'dias'}`
}

export function cidadeDoEndereco(endereco) {
  const partes = (endereco ?? '').split('—')
  return (partes[1] ?? partes[0]).split(',')[0].trim()
}
