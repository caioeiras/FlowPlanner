// Contratado x medido por empreiteiro. Só o engenheiro chega aqui
// (menu do perfil) e a camada de dados recusa os outros perfis.
import { useEffect, useState } from 'react'
import { Carregando, Erro, Icon, Pill, Vazio } from '../components/index.jsx'
import { obterMedicao } from '../lib/dados.js'
import { brl, brlCompacto } from '../lib/formato.js'
import { resumoPorEmpreiteiro, totaisMedicao } from '../lib/medicao.js'

export default function Medicao() {
  const [estado, setEstado] = useState({ carregando: true })

  useEffect(() => {
    obterMedicao().then(({ data, erro }) => {
      if (erro) { setEstado({ erro }); return }
      setEstado({ linhas: resumoPorEmpreiteiro(data.servicos, data.medicoes, data.empreiteiros) })
    })
  }, [])

  if (estado.carregando) return <div className="wrap view"><Carregando /></div>
  if (estado.erro) return <div className="wrap view"><Erro>{estado.erro}</Erro></div>

  const { linhas } = estado
  const tot = totaisMedicao(linhas)

  return (
    <div className="wrap view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h1 className="h1">Medição</h1>
          <p className="sub" style={{ margin: 0 }}>Contratado e medido por empreiteiro</p>
        </div>
        <Pill tom="escuro"><Icon name="cadeado" size={12} /> Só o engenheiro vê</Pill>
      </div>

      {linhas.length === 0 ? (
        <Vazio icone="medicao" titulo="Nenhum serviço contratado nesta obra"
          texto="Cadastre os serviços com o valor contratado para acompanhar as medições aqui." />
      ) : (
        <>
          <div className="faixa" style={{ marginTop: 14 }}>
            <div className="faixa-item">
              <div className="lbl">Contratado</div>
              <div className="kpi-num money">{brlCompacto(tot.contratado)}</div>
              <div className="kpi-sub">{linhas.reduce((t, l) => t + l.servicos, 0)} serviços</div>
            </div>
            <div className="faixa-item">
              <div className="lbl">Medido</div>
              <div className="kpi-num money">{brlCompacto(tot.medido)}</div>
              <div className="kpi-sub"><span className="num">{tot.pctMedido}%</span> do contratado</div>
            </div>
            <div className={`faixa-item ${tot.alertas ? 'atrasado' : ''}`}>
              <div className="lbl">Alertas</div>
              <div className="kpi-num money">{tot.alertas}</div>
              <div className="kpi-sub">Medido acima do executado</div>
            </div>
          </div>

          <div className="card sec">
            <div className="sec-head"><span className="lbl ink">Por empreiteiro, alertas primeiro</span></div>
            <div>
            {linhas.map((l) => (
              <div key={l.empreiteiro_id} className="pad" style={{ borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <div className="row-title">{l.nome}</div>
                    <div className="meta">{l.servicos} serviço{l.servicos === 1 ? '' : 's'}, {l.pctExecutado}% executado</div>
                  </div>
                  <div className="row-side">
                    <div className={`big ${l.alerta ? 't-late' : ''}`} style={{ fontSize: 26 }}>{l.pctMedido}%</div>
                    <div className="big-lbl">Medido</div>
                  </div>
                </div>
                <div className="bar fina">
                  <i className={l.alerta ? 'coral' : ''} style={{ width: `${l.pctMedido}%` }} />
                  <span className="alvo" style={{ left: `${l.pctExecutado}%` }} />
                </div>
                {l.alerta && <Pill tom="atrasado" className="mt8">Medido acima do executado</Pill>}
                <div className="grid2" style={{ marginTop: 10, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div><span className="lbl">Contratado</span><b className="num" style={{ display: 'block' }}>{brl(l.contratado)}</b></div>
                  <div><span className="lbl">Medido</span><b className="num" style={{ display: 'block' }}>{brl(l.medido)}</b></div>
                  <div><span className="lbl">Saldo</span><b className="num" style={{ display: 'block' }}>{brl(l.saldo)}</b></div>
                </div>
              </div>
            ))}
            </div>
          </div>
          <p className="meta">O traço na barra marca quanto o empreiteiro já executou.</p>
        </>
      )}
    </div>
  )
}
