// Diário de obra do dia: o mestre marca o que andou, quem estava e o que aconteceu.
// É daqui que sai o "há quantos dias não anda" da tela de frentes.
import { useEffect, useState } from 'react'
import { Carregando, Erro, Icon } from '../components/index.jsx'
import { obterDiarioDeHoje, salvarDiario } from '../lib/dados.js'
import { dataCurta, diaDaSemana } from '../lib/formato.js'

const SITUACOES = [['nao_mexeu', 'Não mexeu'], ['andou', 'Andou'], ['concluiu', 'Concluiu']]
const CLIMAS = [['sol', 'Sol'], ['nublado', 'Nublado'], ['chuva', 'Chuva']]

export default function Diario() {
  const [base, setBase] = useState(null)
  const [erro, setErro] = useState(null)
  const [servicos, setServicos] = useState([])
  const [efetivo, setEfetivo] = useState([])
  const [clima, setClima] = useState('sol')
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    obterDiarioDeHoje().then(({ data, erro }) => {
      if (erro) { setErro(erro); return }
      setBase(data)
      setServicos(data.servicos)
      setEfetivo(data.efetivo)
      setClima(data.diario?.clima ?? 'sol')
      setObservacao(data.diario?.observacao ?? '')
    })
  }, [])

  if (erro) return <div className="wrap view"><Erro>{erro}</Erro></div>
  if (!base) return <div className="wrap view"><Carregando /></div>

  const marcar = (id, situacao) => {
    setSalvo(false)
    setServicos((lista) => lista.map((s) => (s.id === id ? { ...s, situacao } : s)))
  }
  const pessoas = (empId, delta) => {
    setSalvo(false)
    setEfetivo((lista) => lista.map((e) => (e.empreiteiro_id === empId ? { ...e, pessoas: Math.max(0, e.pessoas + delta) } : e)))
  }
  const total = efetivo.reduce((t, e) => t + e.pessoas, 0)
  const andaram = servicos.filter((s) => s.situacao !== 'nao_mexeu').length

  const salvar = async () => {
    setSalvando(true)
    setAviso(null)
    const { erro } = await salvarDiario({ clima, observacao, servicos, efetivo })
    setSalvando(false)
    if (erro) { setAviso(erro); return }
    setSalvo(true)
  }

  return (
    <div className="wrap view">
      <div className="lbl">Diário de obra, {diaDaSemana(base.data)} <span className="num">{dataCurta(base.data)}</span></div>
      <h1 className="h1">O que aconteceu hoje?</h1>
      <p className="sub">{base.diario ? 'Já tem diário hoje. Pode ajustar e salvar de novo.' : 'Leva 2 minutos. Marque só os serviços que andaram.'}</p>

      <div className="duas-iguais">
        <div>
          <div className="card sec">
            <div className="sec-head"><span className="lbl ink">O que andou hoje</span><span className="lbl"><span className="num">{andaram}</span> de <span className="num">{servicos.length}</span> andaram</span></div>
            {servicos.map((s) => (
              <div key={s.id} className="pad" style={{ borderBottom: '1px solid var(--line)' }}>
                <div style={{ fontWeight: 600 }}>{s.nome}</div>
                <div className="meta">{s.empreiteiro_nome}{s.status === 'nao_iniciado' ? ', ainda não iniciado' : ''}</div>
                <div className="seg" role="group" aria-label={`Situação de ${s.nome}`}>
                  {SITUACOES.map(([id, rotulo]) => (
                    <button key={id} className={id} aria-pressed={s.situacao === id} onClick={() => marcar(s.id, id)}>{rotulo}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card sec pad">
            <div className="lbl ink">Clima</div>
            <div className="seg" role="group" aria-label="Clima">
              {CLIMAS.map(([id, rotulo]) => (
                <button key={id} className={id} aria-pressed={clima === id} onClick={() => { setClima(id); setSalvo(false) }}>{rotulo}</button>
              ))}
            </div>
          </div>

          <div className="card sec">
            <div className="sec-head"><span className="lbl ink">Pessoas no canteiro</span><span className="lbl ink"><span className="num">{total}</span> no total</span></div>
            {efetivo.length === 0 && <p className="sub pad" style={{ margin: 0 }}>Nenhum empreiteiro com equipe nesta obra ainda.</p>}
            {efetivo.map((e) => (
              <div key={e.empreiteiro_id} className="stepper">
                <span style={{ fontWeight: 600 }}>{e.empreiteiro_nome}</span>
                <span className="st-ctrl">
                  <button className="st-btn" aria-label={`Menos uma pessoa da ${e.empreiteiro_nome}`} onClick={() => pessoas(e.empreiteiro_id, -1)}>−</button>
                  <span className="st-val">{e.pessoas}</span>
                  <button className="st-btn" aria-label={`Mais uma pessoa da ${e.empreiteiro_nome}`} onClick={() => pessoas(e.empreiteiro_id, 1)}>+</button>
                </span>
              </div>
            ))}
          </div>

          <div className="card sec">
            <div className="sec-head"><span className="lbl ink">Fotos de hoje</span><span className="lbl num">{base.fotosHoje.length}</span></div>
            <div className="fotos">
              {base.fotosHoje.map((f) => <div key={f.id} className={`foto t${f.tom}`}><span>{f.legenda}</span></div>)}
              <button className="foto add" onClick={() => setAviso('As fotos passam a ser guardadas quando o app ganhar banco de dados, numa próxima etapa.')}>
                <Icon name="fotos" size={26} />Tirar foto
              </button>
            </div>
          </div>

          <div className="card sec pad">
            <label className="campo" style={{ margin: 0 }}>
              <span>Observação do dia</span>
              <textarea className="ipt" value={observacao} placeholder="Ex.: caminhão de areia não veio, remarcado pra amanhã 8h"
                onChange={(e) => { setObservacao(e.target.value); setSalvo(false) }} />
            </label>
          </div>

          <button className="btn grande accent" style={{ marginTop: 14 }} onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando…' : salvo ? 'Diário salvo' : 'Salvar diário de hoje'}
          </button>
          {aviso && <div className="aviso erro" role="alert">{aviso}</div>}
          {salvo && <div className="aviso ok">Diário salvo. As frentes marcadas como "Andou" voltam a zero dias parado.</div>}
        </div>
      </div>
    </div>
  )
}
