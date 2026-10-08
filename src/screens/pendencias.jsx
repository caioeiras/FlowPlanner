// Pendências de projeto: o que depende de uma definição da arquitetura.
import { useEffect, useState } from 'react'
import { Campo, Carregando, Erro, Icon, Pill, Sheet, Vazio } from '../components/index.jsx'
import { criarPendencia, listarPendencias, listarServicosParaVinculo, mudarStatusPendencia } from '../lib/dados.js'
import { dataLonga, diasEntre, isoLocal } from '../lib/formato.js'

const STATUS = {
  aberta: { rotulo: 'Aberta', tom: 'atencao' },
  em_analise: { rotulo: 'Em análise', tom: 'neutro' },
  resolvida: { rotulo: 'Resolvida', tom: 'ok' },
}

export default function Pendencias() {
  const [lista, setLista] = useState(null)
  const [erro, setErro] = useState(null)
  const [nova, setNova] = useState(false)
  const [aberta, setAberta] = useState(null)

  const carregar = async () => {
    const { data, erro } = await listarPendencias()
    if (erro) setErro(erro)
    else setLista(data)
  }
  useEffect(() => { carregar() }, [])

  if (erro) return <div className="wrap view"><Erro>{erro}</Erro></div>
  if (!lista) return <div className="wrap view"><Carregando /></div>

  const abertas = lista.filter((p) => p.status !== 'resolvida')
  const resolvidas = lista.filter((p) => p.status === 'resolvida')
  const hoje = isoLocal()

  const mudar = async (id, status) => {
    const { erro } = await mudarStatusPendencia(id, status)
    if (erro) { setErro(erro); return }
    setAberta(null)
    carregar()
  }

  return (
    <div className="wrap view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
        <div>
          <h1 className="h1">Pendências de projeto</h1>
          <p className="sub" style={{ margin: 0 }}>O que depende de uma definição da arquitetura</p>
        </div>
        {lista.length > 0 && <button className="btn" onClick={() => setNova(true)}><Icon name="mais" size={20} />Nova pendência</button>}
      </div>

      {lista.length === 0 ? (
        <Vazio icone="pendencias" titulo="Nenhuma pendência de projeto"
          texto="Quando faltar uma definição da arquitetura (um detalhe, uma cota, um acabamento), anote aqui. A arquiteta vê e responde por aqui mesmo."
          acao="Criar a primeira pendência" onAcao={() => setNova(true)} />
      ) : (
        <>
          <div className="card sec">
            <div className="sec-head"><span className="lbl ink">Abertas, mais antigas primeiro</span><span className="lbl num">{abertas.length}</span></div>
            <div>
            {abertas.length === 0 && <p className="sub pad" style={{ margin: 0 }}>Nenhuma pendência aberta nesta obra.</p>}
            {abertas.map((p) => {
              const dias = diasEntre(p.created_at, hoje)
              return (
                <button key={p.id} className={`row ${dias >= 7 ? 'atencao' : ''}`} onClick={() => setAberta(p)}>
                  <div className="row-main">
                    <div className="row-title">{p.titulo}</div>
                    {p.servico_nome && <div className="meta">{p.servico_nome}</div>}
                    <Pill className="mt8" tom={STATUS[p.status].tom}>{STATUS[p.status].rotulo}</Pill>
                  </div>
                  <div className="row-side">
                    <div className="big" style={{ color: dias >= 7 ? 'var(--warn)' : 'var(--ink)' }}>{dias}<small>d</small></div>
                    <div className="big-lbl">Em aberto</div>
                  </div>
                </button>
              )
            })}
            </div>
          </div>
          {resolvidas.length > 0 && (
            <div className="card sec">
              <div className="sec-head"><span className="lbl ink">Resolvidas</span><span className="lbl num">{resolvidas.length}</span></div>
              <div>
              {resolvidas.map((p) => (
                <button key={p.id} className="row" onClick={() => setAberta(p)}>
                  <div className="row-main">
                    <div className="row-title" style={{ color: 'var(--muted)' }}>{p.titulo}</div>
                    {p.servico_nome && <div className="meta">{p.servico_nome}</div>}
                  </div>
                  <Pill tom="ok">Resolvida</Pill>
                </button>
              ))}
              </div>
            </div>
          )}
        </>
      )}

      <NovaPendencia aberto={nova} onFechar={() => setNova(false)} onCriada={() => { setNova(false); carregar() }} />

      {aberta && (
        <Sheet aberto onFechar={() => setAberta(null)} rotulo={`Aberta em ${dataLonga(aberta.created_at)}`} titulo={aberta.titulo}>
          {aberta.servico_nome && <div className="meta" style={{ fontSize: 13 }}>{aberta.servico_nome}</div>}
          <p style={{ fontSize: 17 }}>{aberta.descricao || 'Sem descrição.'}</p>
          <Pill tom={STATUS[aberta.status].tom}>{STATUS[aberta.status].rotulo}</Pill>
          <div className="btn-row">
            {aberta.status === 'aberta' && <button className="btn linha" onClick={() => mudar(aberta.id, 'em_analise')}>Em análise</button>}
            {aberta.status !== 'resolvida'
              ? <button className="btn" onClick={() => mudar(aberta.id, 'resolvida')}>Marcar resolvida</button>
              : <button className="btn linha" onClick={() => mudar(aberta.id, 'aberta')}>Reabrir</button>}
          </div>
          <p className="meta" style={{ marginTop: 16 }}>Os comentários chegam numa próxima etapa.</p>
        </Sheet>
      )}
    </div>
  )
}

function NovaPendencia({ aberto, onFechar, onCriada }) {
  const [servicos, setServicos] = useState([])
  const [form, setForm] = useState({ titulo: '', descricao: '', servico_id: '' })
  const [erroTitulo, setErroTitulo] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (!aberto) return
    setForm({ titulo: '', descricao: '', servico_id: '' })
    setErroTitulo(null)
    setErro(null)
    listarServicosParaVinculo().then(({ data }) => setServicos(data ?? []))
  }, [aberto])

  const salvar = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) { setErroTitulo('Escreva o que está pendente.'); return }
    setSalvando(true)
    const { erro } = await criarPendencia(form)
    setSalvando(false)
    if (erro) { setErro(erro); return }
    onCriada()
  }

  return (
    <Sheet aberto={aberto} onFechar={onFechar} rotulo="Pendência de projeto" titulo="Nova pendência">
      <form onSubmit={salvar}>
        <Campo rotulo="O que está pendente?" erro={erroTitulo}>
          <input className="ipt" value={form.titulo} placeholder="Ex.: Cota do nicho do banheiro"
            onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
        </Campo>
        <Campo rotulo="Serviço afetado">
          <select className="ipt" value={form.servico_id} onChange={(e) => setForm({ ...form, servico_id: e.target.value })}>
            <option value="">Nenhum específico</option>
            {servicos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Detalhes">
          <textarea className="ipt" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
        </Campo>
        <button className="btn grande" disabled={salvando}>{salvando ? 'Criando…' : 'Criar pendência'}</button>
        {erro && <Erro>{erro}</Erro>}
      </form>
    </Sheet>
  )
}
