// Decide o que mostrar: login, "aguardando liberação" ou o app com a obra.
// Enquanto USAR_MOCK estiver ligado, o login é de teste (escolhe o perfil).
import { useState } from 'react'
import { definirUsuario } from './lib/dados.js'
import { ObraProvider } from './lib/obra.jsx'
import Login from './pages/Login.jsx'
import Aguardando from './pages/Aguardando.jsx'
import Shell from './pages/Shell.jsx'

const CHAVE = 'minhaobra.usuario'
function lerUsuario() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) } catch { return null }
}

export default function App() {
  const [usuario, setUsuario] = useState(lerUsuario)

  const entrar = (u) => {
    try { localStorage.setItem(CHAVE, JSON.stringify(u)) } catch { /* só não lembra */ }
    setUsuario(u)
  }
  const sair = () => {
    try { localStorage.removeItem(CHAVE) } catch { /* nada a limpar */ }
    setUsuario(null)
  }

  // A camada de dados precisa saber quem está logado antes de qualquer busca.
  definirUsuario(usuario)

  if (!usuario) return <Login onEntrar={entrar} />
  if (!usuario.role) return <Aguardando usuario={usuario} onSair={sair} />
  return (
    <ObraProvider key={usuario.id} usuario={usuario}>
      <Shell usuario={usuario} onSair={sair} />
    </ObraProvider>
  )
}
