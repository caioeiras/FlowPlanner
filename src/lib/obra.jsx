// A obra escolhida: vive aqui, fica guardada no navegador e é avisada à
// camada de dados. Trocar de obra remonta todas as telas (ver Shell key).
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { definirObraAtual, listarObras } from './dados.js'
import { escolherObraInicial } from './obras.js'

const ObraContext = createContext(null)

const chave = (userId) => `minhaobra.obra.${userId}`
function lerGuardada(userId) {
  try { return localStorage.getItem(chave(userId)) } catch { return null }
}
function guardar(userId, obraId) {
  try { localStorage.setItem(chave(userId), obraId) } catch { /* navegador sem armazenamento: só não lembra */ }
}

export function ObraProvider({ usuario, children }) {
  const [obras, setObras] = useState(null)
  const [obraId, setObraId] = useState(null)
  const [erro, setErro] = useState(null)

  const recarregar = useCallback(async () => {
    const { data, erro } = await listarObras()
    if (erro) { setErro(erro); return }
    setObras(data)
    setObraId((atual) => escolherObraInicial(data, atual ?? lerGuardada(usuario.id)))
  }, [usuario.id])

  useEffect(() => { recarregar() }, [recarregar])

  // A camada de dados precisa saber a obra ANTES de qualquer tela buscar.
  definirObraAtual(obraId)

  const trocarObra = (id) => {
    guardar(usuario.id, id)
    setObraId(id)
  }

  useEffect(() => { if (obraId) guardar(usuario.id, obraId) }, [obraId, usuario.id])

  const obra = obras?.find((o) => o.id === obraId) ?? null
  return (
    <ObraContext.Provider value={{ obras, obra, obraId, trocarObra, recarregar, erro }}>
      {children}
    </ObraContext.Provider>
  )
}

export function useObra() {
  return useContext(ObraContext)
}
