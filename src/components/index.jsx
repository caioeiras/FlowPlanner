// Peças reutilizáveis. Ícones são SVG desenhados aqui (nada de emoji).
import { useEffect } from 'react'

const PATHS = {
  frentes: <path d="M4 6h16M4 12h16M4 18h10" />,
  diario: <><path d="M6 3h11a1 1 0 0 1 1 1v17H7a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1z" /><path d="M5 17a2 2 0 0 1 2-2h11M9 7h5" /></>,
  medicao: <><path d="M3 15 15 3l6 6L9 21H3z" /><path d="m8 10 2 2m1-5 2 2m-8 4 2 2" /></>,
  pendencias: <><path d="M9 4h6v3H9z" /><path d="M7 5H5v16h14V5h-2" /><path d="m9 13 2 2 4-4" /></>,
  obras: <><path d="M3 21h18M5 21V9l7-5 7 5v12" /><path d="M10 21v-6h4v6" /></>,
  avanco: <><path d="M4 20V10m6 10V4m6 16v-7m4 7H2" /></>,
  fotos: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  mais: <path d="M12 5v14M5 12h14" />,
  trocar: <path d="m7 10 5 5 5-5" />,
  cadeado: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
}

export function Icon({ name, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  )
}

export function Pill({ tom = 'neutro', children, className = '' }) {
  return <span className={`pill ${tom} ${className}`}>{children}</span>
}

export function Sheet({ aberto, onFechar, rotulo, titulo, children }) {
  useEffect(() => {
    if (!aberto) return
    const esc = (e) => { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [aberto, onFechar])
  if (!aberto) return null
  return (
    <>
      <div className="scrim" onClick={onFechar} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="grip" />
        <div className="sheet-head">
          <div>
            {rotulo && <div className="lbl">{rotulo}</div>}
            <h2 className="h1">{titulo}</h2>
          </div>
          <button className="fechar" onClick={onFechar} aria-label="Fechar"><Icon name="fechar" size={20} /></button>
        </div>
        {children}
      </div>
    </>
  )
}

export function Vazio({ icone, titulo, texto, acao, onAcao }) {
  return (
    <div className="card sec vazio">
      <div className="vazio-ico"><Icon name={icone} size={36} /></div>
      <h2>{titulo}</h2>
      <p>{texto}</p>
      {acao && <button className="btn" onClick={onAcao}><Icon name="mais" size={20} />{acao}</button>}
    </div>
  )
}

export function Carregando({ linhas = 4 }) {
  return (
    <div className="card sec" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => <div key={i} className="esqueleto" />)}
    </div>
  )
}

export function Erro({ children }) {
  return <div className="aviso erro" role="alert">{children}</div>
}

export function Campo({ rotulo, erro, children }) {
  return (
    <label className={`campo ${erro ? 'erro' : ''}`}>
      <span>{rotulo}</span>
      {children}
      {erro && <div className="campo-erro">{erro}</div>}
    </label>
  )
}
