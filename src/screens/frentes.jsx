// A tela do dia a dia: frentes de serviço, a mais atrasada primeiro.
import { useEffect, useState } from 'react'
import { Carregando, Erro, Pill, Sheet, Vazio } from '../components/index.jsx'
import { listarAmbientes, listarHistoricoServico, listarServicos, obterDiarioDeHoje } from '../lib/dados.js'
import { brl, dataCurta, dataLonga, diaDaSemana, isoLocal } from '../lib/formato.js'
import {
  DIAS_ATENCAO, DIAS_ATRASO, avancoEsperado, montarFrentes, posicaoNaRegua, resumoFrentes, textoDecisao,
} from '../lib/frentes.js'

const ENTREGA = {
  no_prazo: { texto: 'No prazo', tom: 'ok', sub: 'Nenhuma frente em alerta' },
  atencao: { texto: 'Atenção', tom: 'atencao', sub: 'Há frentes em amarelo' },
  em_risco: { texto: 'Em risco', tom: 'atrasado', sub: 'Há frentes em vermelho' },
}

function Regua({ dias }) {
  return (
    <div className="regua" aria-hidden="true">
      <i style={{ width: `${posicaoNaRegua(dias)}%` }} />
      <span className="marca" style={{ left: `${posicaoNaRegua(DIAS_ATENCAO)}%` }} />
      <span className="marca" style={{ left: `${posicaoNaRegua(DIAS_ATRASO)}%` }} />
    </div>
  )
}

export default function Frentes({ obra, goto }) {
  const hoje = isoLocal()
  const [estado, setEstado] = useState({ carregando: true })
  const [aberta, setAberta] = useState(null)

  useEffect(() => {
    Promise.all([listarServicos(), listarAmbientes(), obterDiarioDeHoje()]).then(([s, a, d]) => {
      const erro = s.erro || a.erro || d.erro
      if (erro) { setEstado({ erro }); return }
      setEstado({ servicos: s.data, ambientes: a.data, diarioHoje: d.data.diario })
    })
  }, [])

  if (estado.carregando) return <div className="wrap view"><Carregando /></div>
  if (estado.erro) return <div className="wrap view"><Erro>{estado.erro}</Erro></div>

  const frentes = montarFrentes(estado.servicos, hoje)
  const resumo = resumoFrentes(frentes, hoje)
  const naoIniciadas = estado.servicos.filter((s) => s.status === 'nao_iniciado').length
  const concluidas = estado.servicos.filter((s) => s.status === 'concluido').length
  const avanco = estado.ambientes.length
    ? Math.round(estado.ambientes.reduce((t, a) => t + a.avanco_pct, 0) / estado.ambientes.length) : 0
  const esperado = avancoEsperado(obra.data_inicio, obra.data_meta_entrega, hoje)
  const entrega = ENTREGA[resumo.entrega]

  return (
    <div className="wrap view">
      <div className="faixa">
        <div className={`faixa-item ${resumo.paradas ? 'atrasado' : ''}`}>
          <div className="lbl">Paradas</div>
          <div className="kpi-num">{resumo.paradas}</div>
          <div className="kpi-sub">{DIAS_ATRASO} dias ou mais</div>
        </div>
        <div className={`faixa-item ${resumo.decidirEmUmaSemana ? 'atencao' : ''}`}>
          <div className="lbl">Decisões</div>
          <div className="kpi-num">{resumo.decidirEmUmaSemana}</div>
          <div className="kpi-sub">Vencem em 7 dias</div>
        </div>
        <div className={`faixa-item ${entrega.tom}`}>
          <div className="lbl">Entrega</div>
          <div className={`kpi-num texto t-${entrega.tom === 'atrasado' ? 'late' : entrega.tom === 'atencao' ? 'warn' : 'ok'}`}>{entrega.texto}</div>
          <div className="kpi-sub">{entrega.sub}</div>
        </div>
      </div>

      <div className="duas-colunas">
        <div>
          {frentes.length === 0 ? (
            <Vazio icone="frentes" titulo="Nenhuma frente em andamento"
              texto="Quando um serviço começar, ele aparece aqui com quantos dias está sem andar." />
          ) : (
            <div className="card sec">
              <div className="sec-head">
                <div>
                  <div className="lbl ink">Frentes em andamento, mais paradas primeiro</div>
                  <div className="regua-legenda"><span><i />Marcas da régua: {DIAS_ATENCAO} e {DIAS_ATRASO} dias parado</span></div>
                </div>
              </div>
              <div>
                {frentes.map((f) => (
                  <button key={f.id} className={`row ${f.nivel}`} onClick={() => setAberta(f)}>
                    <div className="row-main">
                      <div className="row-title">{f.nome}</div>
                      {f.empreiteiro_nome && <div className="meta">{f.empreiteiro_nome}, com {f.empreiteiro_contato}</div>}
                      <Regua dias={f.dias} />
                      <Pill className="mt8" tom={f.nivel === 'ok' && !f.data_limite_decisao ? 'ok' : f.nivel === 'ok' ? 'neutro' : f.nivel}>
                        {textoDecisao(f.data_limite_decisao, hoje)}
                      </Pill>
                    </div>
                    <div className="row-side">
                      <div className="big">{f.dias}<small>d</small></div>
                      <div className="big-lbl">{f.dias === 0 ? 'Andou hoje' : 'Parado'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {(naoIniciadas > 0 || concluidas > 0) && (
            <p className="sub" style={{ marginTop: 10 }}>
              Fora da lista: {naoIniciadas} não iniciada{naoIniciadas === 1 ? '' : 's'} e {concluidas} concluída{concluidas === 1 ? '' : 's'}.
            </p>
          )}
        </div>

        <div>
          <div className="card sec pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <span className="lbl ink">Avanço físico</span>
              <span><b className="num" style={{ fontSize: 22 }}>{avanco}%</b> <span className="lbl">de {esperado}% esperado</span></span>
            </div>
            <div className="bar"><i style={{ width: `${avanco}%` }} /><span className="alvo" style={{ left: `${esperado}%` }} /></div>
            <div className="meta">Média dos ambientes. O traço marca onde a obra deveria estar hoje.</div>
          </div>
          <button className="card sec pad" style={{ width: '100%', textAlign: 'left', display: 'block' }} onClick={() => goto('diario')}>
            <div className="lbl">Diário de hoje, {diaDaSemana(hoje)}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }} className={estado.diarioHoje ? 't-ok' : 't-late'}>
              {estado.diarioHoje ? 'Lançado' : 'Ainda não lançado'}
            </div>
            <div className="link" style={{ minHeight: 0, padding: 0, marginTop: 4 }}>{estado.diarioHoje ? 'Ver diário' : 'Lançar agora'}</div>
          </button>
        </div>
      </div>

      <DetalheFrente frente={aberta} hoje={hoje} onFechar={() => setAberta(null)} />
    </div>
  )
}

function DetalheFrente({ frente, hoje, onFechar }) {
  const [hist, setHist] = useState(null)

  useEffect(() => {
    if (!frente) return
    setHist(null)
    listarHistoricoServico(frente.id).then(({ data }) => setHist(data))
  }, [frente])

  if (!frente) return null
  return (
    <Sheet aberto onFechar={onFechar} rotulo="Frente de serviço" titulo={frente.nome}>
      {frente.empreiteiro_nome && <div className="meta">{frente.empreiteiro_nome}, com {frente.empreiteiro_contato}</div>}
      <div className="faixa two" style={{ marginTop: 14 }}>
        <div className={`faixa-item ${frente.nivel}`}>
          <div className="lbl">Parado há</div>
          <div className="kpi-num">{frente.dias}<small style={{ fontSize: 18 }}>d</small></div>
        </div>
        <div className="faixa-item">
          <div className="lbl">Decidir até</div>
          <div className="kpi-num">{dataCurta(frente.data_limite_decisao)}</div>
          <div className="kpi-sub">{textoDecisao(frente.data_limite_decisao, hoje)}</div>
        </div>
      </div>
      <div className="card sec pad">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="lbl ink">Avanço do serviço</span><b className="num">{frente.avanco_pct}%</b>
        </div>
        <div className="bar fina"><i style={{ width: `${frente.avanco_pct}%` }} /></div>
        {frente.valor_contratado != null && (
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span className="lbl">Contratado</span><b className="num">{brl(frente.valor_contratado)}</b>
          </div>
        )}
      </div>

      <h3 className="lbl ink" style={{ margin: '20px 0 0' }}>Últimos registros no diário</h3>
      {!hist ? <div className="carregando">Carregando registros…</div> : hist.itens.length === 0 ? (
        <p className="sub" style={{ marginTop: 8 }}>Nenhum registro deste serviço no diário ainda.</p>
      ) : (
        <div className="tl">
          {hist.itens.slice(0, 4).map((h) => (
            <div key={h.id} className="tl-item">
              <b className="num">{dataLonga(h.data)}</b> <span className="lbl">por {h.autor}</span><br />
              <span style={{ color: 'var(--muted)' }}>{h.nota}</span>
            </div>
          ))}
        </div>
      )}
      {hist && <div className="meta">{hist.fotos} foto{hist.fotos === 1 ? '' : 's'} deste serviço</div>}

      <div className="btn-row">
        <button className="btn linha" disabled>Ajustar data</button>
        <button className="btn escuro" disabled>Cobrar responsável</button>
      </div>
      <p className="meta" style={{ textAlign: 'center' }}>Estes dois botões chegam numa próxima etapa.</p>
    </Sheet>
  )
}
