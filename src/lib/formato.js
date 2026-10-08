// Datas e dinheiro. Datas trafegam como texto 'AAAA-MM-DD' (igual à coluna
// `date` do banco). Nunca use toISOString() para gerar esse texto: ele converte
// para UTC e, no fuso do Brasil, pula um dia depois das 21h.

export function isoLocal(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dia}`
}

export function somarDias(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return isoLocal(new Date(y, m - 1, d + n))
}

// Dias corridos de `de` até `ate` (positivo se `ate` é depois).
export function diasEntre(de, ate) {
  const utc = (iso) => {
    const [y, m, d] = iso.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((utc(ate) - utc(de)) / 86400000)
}

export function dataCurta(iso) {
  if (!iso) return '—'
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function dataLonga(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
export function diaDaSemana(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return DIAS[new Date(y, m - 1, d).getDay()]
}

export function brl(v) {
  return (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

// "R$ 1,28 mi", "R$ 742 mil" — para os números grandes dos cartões.
export function brlCompacto(v) {
  if (v >= 1e6) return `R$ ${(v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} mi`
  if (v >= 1e3) return `R$ ${Math.round(v / 1e3).toLocaleString('pt-BR')} mil`
  return brl(v)
}
