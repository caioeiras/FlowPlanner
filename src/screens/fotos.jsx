// Visão do cliente: fotos dos últimos 7 dias, por ambiente. Sem nome de fornecedor.
import { useEffect, useState } from 'react'
import { Carregando, Erro, Vazio } from '../components/index.jsx'
import { listarFotosRecentes } from '../lib/dados.js'
import { dataCurta } from '../lib/formato.js'

export default function Fotos() {
  const [fotos, setFotos] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    listarFotosRecentes(7).then(({ data, erro }) => (erro ? setErro(erro) : setFotos(data)))
  }, [])

  if (erro) return <div className="wrap view"><Erro>{erro}</Erro></div>
  if (!fotos) return <div className="wrap view"><Carregando /></div>

  return (
    <div className="wrap view">
      <h1 className="h1">Fotos da semana</h1>
      <p className="sub">Tiradas no canteiro nos últimos 7 dias</p>
      {fotos.length === 0 ? (
        <Vazio icone="fotos" titulo="Nenhuma foto esta semana" texto="As fotos tiradas no canteiro aparecem aqui toda semana." />
      ) : (
        <div className="card sec">
          <div className="fotos">
            {fotos.map((f) => (
              <div key={f.id}>
                <div className={`foto t${f.tom}`}><span className="num">{dataCurta(f.data)}</span></div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>{f.legenda}</div>
                <div className="meta" style={{ marginTop: 2 }}>{f.ambiente_nome}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
