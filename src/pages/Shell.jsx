// A moldura do app: cabeçalho com a obra, menu lateral (tela larga) e
// barra inferior (celular). O menu vem do perfil (src/lib/perfis.js).
import { useState } from 'react'
import { Icon, Pill, Sheet, Vazio } from '../components/index.jsx'
import { useObra } from '../lib/obra.jsx'
import { cidadeDoEndereco, situacaoObra, textoPrazoEntrega } from '../lib/obras.js'
import { dataLonga, isoLocal } from '../lib/formato.js'
import { perfil, podeAcessar } from '../lib/perfis.js'
import Frentes from '../screens/frentes.jsx'
import Diario from '../screens/diario.jsx'
import Medicao from '../screens/medicao.jsx'
import Pendencias from '../screens/pendencias.jsx'
import Obras from '../screens/obras.jsx'
import Avanco from '../screens/avanco.jsx'
import Fotos from '../screens/fotos.jsx'

const TELAS = {
  frentes: { rotulo: 'Frentes', comp: Frentes },
  diario: { rotulo: 'Diário', comp: Diario },
  medicao: { rotulo: 'Medição', comp: Medicao },
  pendencias: { rotulo: 'Pendências', comp: Pendencias },
  obras: { rotulo: 'Obras', comp: Obras },
  avanco: { rotulo: 'Avanço', comp: Avanco },
  fotos: { rotulo: 'Fotos', comp: Fotos },
}

export default function Shell({ usuario, onSair }) {
  const { obras, obra, obraId, trocarObra, erro } = useObra()
  const menu = perfil(usuario.role).menu
  const [rota, setRota] = useState({ tela: menu[0], params: {} })
  const [seletorAberto, setSeletorAberto] = useState(false)
  const [contaAberta, setContaAberta] = useState(false)

  const goto = (tela, params = {}) => {
    setRota({ tela: podeAcessar(usuario.role, tela) ? tela : menu[0], params })
    window.scrollTo(0, 0)
  }

  const nav = menu.map((id) => (
    <button key={id} className="nav-btn" aria-current={rota.tela === id ? 'page' : undefined} onClick={() => goto(id)}>
      <Icon name={id} /><span>{TELAS[id].rotulo}</span>
    </button>
  ))

  let corpo
  if (erro) corpo = <div className="wrap"><div className="aviso erro">{erro}</div></div>
  else if (!obras) corpo = <div className="carregando">Carregando suas obras…</div>
  else if (obras.length === 0) {
    corpo = (
      <div className="wrap view">
        <Vazio icone="obras" titulo="Nenhuma obra liberada pra você"
          texto="Peça ao engenheiro responsável para te incluir numa obra. Assim que ele incluir, ela aparece aqui." />
      </div>
    )
  } else if (rota.tela === 'obras' || obra) {
    const Tela = TELAS[rota.tela].comp
    // key = obra: trocar de obra desmonta a tela inteira e busca tudo de novo,
    // sem sobrar nada da obra anterior na memória.
    corpo = <Tela key={obraId} usuario={usuario} obra={obra} goto={goto} params={rota.params} />
  }

  const situacao = obra ? situacaoObra(obra.situacao) : null
  const podeTrocar = (obras?.length ?? 0) > 1
  const prazo = obra ? textoPrazoEntrega(obra.data_meta_entrega, isoLocal()) : ''

  return (
    <div className="app">
      <aside className="side">
        <div className="brand"><i />MinhaObra</div>
        <nav aria-label="Menu principal">{nav}</nav>
        <div className="side-foot">
          <div style={{ fontWeight: 600 }}>{usuario.nome}</div>
          <div className="lbl" style={{ marginBottom: 4 }}>{perfil(usuario.role).rotulo}</div>
          <button className="link" onClick={onSair}>Trocar perfil (teste)</button>
        </div>
      </aside>

      <div className="main">
        {obra && (
          <header className="top">
            <div className="wrap top-row">
              <div className="obra-dot" />
              <div className="obra-txt">
                <div className="obra-name">{obra.nome}</div>
                <div className="obra-meta">
                  <span className="num">{obra.codigo}</span>, {cidadeDoEndereco(obra.endereco)}
                  {situacao.id !== 'em_andamento' && <Pill tom={situacao.tom} className="pill-topo">{situacao.rotulo}</Pill>}
                </div>
              </div>
              {podeTrocar && (
                <button className="btn-dark" onClick={() => setSeletorAberto(true)}>Trocar <Icon name="trocar" size={16} /></button>
              )}
              <button className="btn-dark round so-celular" aria-label="Minha conta" onClick={() => setContaAberta(true)}>
                {usuario.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </button>
            </div>
            <div className={`wrap obra-prazo ${prazo.startsWith('Atrasada') ? 'atrasada' : ''}`}>
              <b>{prazo}</b>Entrega prevista para <span className="num">{dataLonga(obra.data_meta_entrega)}</span>
            </div>
          </header>
        )}
        <main>{corpo}</main>
      </div>

      <nav className="bnav" aria-label="Menu principal">{nav}</nav>

      <Sheet aberto={seletorAberto} onFechar={() => setSeletorAberto(false)} rotulo="Suas obras" titulo="Trocar de obra">
        {obras?.map((o) => {
          const s = situacaoObra(o.situacao)
          return (
            <button key={o.id} className="opt" aria-current={o.id === obraId ? 'true' : undefined}
              onClick={() => { trocarObra(o.id); setSeletorAberto(false) }}>
              <span className="obra-dot" style={{ width: 28, height: 28, background: o.id === obraId ? 'var(--accent)' : '#BFD3D5' }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 17 }}>{o.nome}</b>
                <span className="meta" style={{ display: 'block' }}>{o.cliente_nome}, <span className="num">{o.codigo}</span></span>
              </span>
              <Pill tom={s.tom}>{s.rotulo}</Pill>
            </button>
          )
        })}
      </Sheet>

      <Sheet aberto={contaAberta} onFechar={() => setContaAberta(false)} rotulo="Minha conta" titulo={usuario.nome}>
        <p className="sub">{perfil(usuario.role).rotulo}</p>
        <button className="btn linha" style={{ width: '100%' }} onClick={onSair}>Trocar perfil (teste)</button>
      </Sheet>
    </div>
  )
}
