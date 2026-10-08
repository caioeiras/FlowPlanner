// Visão do cliente: avanço por ambiente. Sem custo e sem nome de fornecedor.
import { useEffect, useState } from 'react'
import { Carregando, Erro, Vazio } from '../components/index.jsx'
import { listarAmbientes } from '../lib/dados.js'
import { dataLonga } from '../lib/formato.js'

export default function Avanco({ obra, goto }) {
  const [ambientes, setAmbientes] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    listarAmbientes().then(({ data, erro }) => (erro ? setErro(erro) : setAmbientes(data)))
  }, [])

  if (erro) return <div className="wrap view"><Erro>{erro}</Erro></div>
  if (!ambientes) return <div className="wrap view"><Carregando /></div>
  if (ambientes.length === 0) {
    return <div className="wrap view"><Vazio icone="avanco" titulo="O avanço aparece aqui" texto="Assim que a obra tiver os ambientes cadastrados, você acompanha o andamento de cada um por aqui." /></div>
  }

  const geral = Math.round(ambientes.reduce((t, a) => t + a.avanco_pct, 0) / ambientes.length)

  return (
    <div className="wrap view">
      <div className="faixa two">
        <div className="faixa-item">
          <div className="lbl">Obra concluída</div>
          <div className="kpi-num">{geral}%</div>
        </div>
        <div className="faixa-item">
          <div className="lbl">Entrega prevista</div>
          <div className="kpi-num money">{dataLonga(obra.data_meta_entrega)}</div>
        </div>
      </div>

      <div className="card sec">
        <div className="sec-head"><span className="lbl ink">Avanço por ambiente</span></div>
        <div>
        {ambientes.map((a) => (
          <div key={a.id} className="pad" style={{ borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 600, fontSize: 17 }}>{a.nome}</span>
              <span className="big" style={{ fontSize: 24 }}>{a.avanco_pct}%</span>
            </div>
            <div className="bar fina"><i style={{ width: `${a.avanco_pct}%` }} /></div>
          </div>
        ))}
        </div>
      </div>
      <button className="btn grande" style={{ marginTop: 14 }} onClick={() => goto('fotos')}>Ver fotos da semana</button>
    </div>
  )
}
