// Cadastro de obras (só o engenheiro). Abrir obra nova é tela, não SQL:
// o engenheiro abre a próxima obra sozinho.
import { useState } from 'react'
import { Campo, Erro, Icon, Pill, Sheet } from '../components/index.jsx'
import { salvarObra } from '../lib/dados.js'
import { dataLonga, isoLocal } from '../lib/formato.js'
import { useObra } from '../lib/obra.jsx'
import { SITUACOES_OBRA, situacaoObra, validarObra } from '../lib/obras.js'

const VAZIA = { nome: '', codigo: '', endereco: '', cliente_nome: '', data_inicio: '', data_meta_entrega: '', situacao: 'em_andamento' }

export default function Obras() {
  const { obras, obraId, trocarObra, recarregar } = useObra()
  const [editando, setEditando] = useState(null)

  return (
    <div className="wrap view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
        <div>
          <h1 className="h1">Suas obras</h1>
        </div>
        <button className="btn" onClick={() => setEditando({ ...VAZIA, data_inicio: isoLocal() })}><Icon name="mais" size={20} />Nova obra</button>
      </div>

      <div className="card sec">
        {obras.map((o) => {
          const s = situacaoObra(o.situacao)
          const atual = o.id === obraId
          return (
            <div key={o.id} className="pad" style={{ borderBottom: '1px solid var(--line)', boxShadow: atual ? 'inset 4px 0 0 var(--accent)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <div className="row-title">{o.nome}</div>
                  <div className="meta">{o.cliente_nome}, <span className="num">{o.codigo}</span></div>
                </div>
                <Pill tom={s.tom}>{s.rotulo}</Pill>
              </div>
              <div style={{ color: 'var(--muted)', marginTop: 6 }}>{o.endereco || 'Sem endereço'}</div>
              <div className="grid2" style={{ marginTop: 10 }}>
                <div><span className="lbl">Início</span><b className="num" style={{ display: 'block' }}>{dataLonga(o.data_inicio)}</b></div>
                <div><span className="lbl">Entrega (meta)</span><b className="num" style={{ display: 'block' }}>{dataLonga(o.data_meta_entrega)}</b></div>
              </div>
              <div className="btn-row">
                <button className="btn linha" onClick={() => setEditando(o)}>Editar</button>
                {atual
                  ? <button className="btn escuro" disabled>Aberta agora</button>
                  : <button className="btn" onClick={() => trocarObra(o.id)}>Abrir esta obra</button>}
              </div>
            </div>
          )
        })}
      </div>

      <FormObra obra={editando} onFechar={() => setEditando(null)}
        onSalva={async (nova) => {
          setEditando(null)
          await recarregar()
          if (nova) trocarObra(nova.id)
        }} />
    </div>
  )
}

function FormObra({ obra, onFechar, onSalva }) {
  const [form, setForm] = useState(obra)
  const [erros, setErros] = useState({})
  const [erro, setErro] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [origem, setOrigem] = useState(obra)

  // Abriu outra obra (ou uma nova) na gaveta: recomeça o formulário.
  if (obra !== origem) {
    setOrigem(obra)
    setForm(obra)
    setErros({})
    setErro(null)
  }
  if (!obra || !form) return null

  const campo = (k) => ({ value: form[k] ?? '', onChange: (e) => setForm({ ...form, [k]: e.target.value }) })

  const salvar = async (e) => {
    e.preventDefault()
    const v = validarObra(form)
    setErros(v)
    if (Object.keys(v).length) return
    setSalvando(true)
    const { data, erro } = await salvarObra(form)
    setSalvando(false)
    if (erro) { setErro(erro); return }
    onSalva(obra.id ? null : data)
  }

  return (
    <Sheet aberto onFechar={onFechar} rotulo="Obra" titulo={obra.id ? `Editar ${obra.nome}` : 'Nova obra'}>
      <form onSubmit={salvar}>
        <Campo rotulo="Nome da obra" erro={erros.nome}><input className="ipt" {...campo('nome')} placeholder="Ex.: Residência Almeida" /></Campo>
        <Campo rotulo="Código / apelido" erro={erros.codigo}><input className="ipt" {...campo('codigo')} placeholder="Ex.: OB-0250" /></Campo>
        <Campo rotulo="Endereço"><input className="ipt" {...campo('endereco')} placeholder="Rua, número — bairro, cidade/UF" /></Campo>
        <Campo rotulo="Cliente" erro={erros.cliente_nome}><input className="ipt" {...campo('cliente_nome')} /></Campo>
        <div className="grid2">
          <Campo rotulo="Data de início" erro={erros.data_inicio}><input className="ipt" type="date" {...campo('data_inicio')} /></Campo>
          <Campo rotulo="Data-meta de entrega" erro={erros.data_meta_entrega}><input className="ipt" type="date" {...campo('data_meta_entrega')} /></Campo>
        </div>
        <Campo rotulo="Situação" erro={erros.situacao}>
          <select className="ipt" {...campo('situacao')}>
            {SITUACOES_OBRA.map((s) => <option key={s.id} value={s.id}>{s.rotulo}</option>)}
          </select>
        </Campo>
        <button className="btn grande" disabled={salvando}>{salvando ? 'Salvando…' : obra.id ? 'Salvar alterações' : 'Criar obra'}</button>
        {erro && <Erro>{erro}</Erro>}
      </form>
    </Sheet>
  )
}
