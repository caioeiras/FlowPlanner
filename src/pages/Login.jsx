import { useEffect, useState } from 'react'
import { listarUsuariosDeTeste } from '../lib/dados.js'
import { perfil } from '../lib/perfis.js'

export default function Login({ onEntrar }) {
  const [usuarios, setUsuarios] = useState([])
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    listarUsuariosDeTeste().then(({ data }) => setUsuarios(data ?? []))
  }, [])

  const enviar = (e) => {
    e.preventDefault()
    setAviso('O login com e-mail e senha entra na etapa do banco. Por enquanto, entre por um dos perfis de teste abaixo.')
  }

  return (
    <div className="login">
      <div className="login-box">
        <div className="brand"><i />MinhaObra</div>
        <form className="card pad" onSubmit={enviar}>
          <h1 className="h1" style={{ marginBottom: 14 }}>Entrar</h1>
          <label className="campo"><span>E-mail</span><input className="ipt" type="email" autoComplete="email" /></label>
          <label className="campo"><span>Senha</span><input className="ipt" type="password" autoComplete="current-password" /></label>
          <button className="btn" style={{ width: '100%' }}>Entrar</button>
          {aviso && <div className="aviso info">{aviso}</div>}
        </form>

        <div className="card sec">
          <div className="sec-head"><span className="lbl ink">Modo de teste: entrar como</span></div>
          <div>
          {usuarios.map((u) => (
            <button key={u.id} className="row" onClick={() => onEntrar(u)}>
              <div className="row-main">
                <div className="row-title">{u.nome}</div>
                <div className="meta">{u.role ? perfil(u.role).rotulo : 'Conta nova, sem perfil'}</div>
              </div>
              <span className="link">Entrar</span>
            </button>
          ))}
          </div>
        </div>
      </div>
    </div>
  )
}
