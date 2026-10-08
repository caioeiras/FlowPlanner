// Contratado x medido por empreiteiro. Substitui a planilha com aba por empreiteiro.

// Medido passando o executado por mais que isto (em pontos percentuais) acende o alerta.
export const TOLERANCIA_MEDICAO = 5

export function resumoPorEmpreiteiro(servicos, medicoes, empreiteiros) {
  const medidoPorServico = {}
  for (const m of medicoes) medidoPorServico[m.servico_id] = (medidoPorServico[m.servico_id] ?? 0) + m.valor

  const grupos = {}
  for (const s of servicos) {
    const g = (grupos[s.empreiteiro_id] ??= { empreiteiro_id: s.empreiteiro_id, servicos: 0, contratado: 0, medido: 0, executadoPonderado: 0 })
    g.servicos++
    g.contratado += s.valor_contratado
    g.medido += medidoPorServico[s.id] ?? 0
    g.executadoPonderado += s.valor_contratado * (s.avanco_pct / 100)
  }

  return Object.values(grupos)
    .map((g) => {
      const pctMedido = g.contratado ? Math.round((g.medido / g.contratado) * 100) : 0
      const pctExecutado = g.contratado ? Math.round((g.executadoPonderado / g.contratado) * 100) : 0
      const emp = empreiteiros.find((e) => e.id === g.empreiteiro_id)
      return {
        empreiteiro_id: g.empreiteiro_id,
        nome: emp?.nome ?? 'Sem empreiteiro',
        servicos: g.servicos,
        contratado: g.contratado,
        medido: g.medido,
        saldo: g.contratado - g.medido,
        pctMedido,
        pctExecutado,
        alerta: pctMedido > pctExecutado + TOLERANCIA_MEDICAO,
      }
    })
    .sort((a, b) => Number(b.alerta) - Number(a.alerta) || b.contratado - a.contratado)
}

export function totaisMedicao(linhas) {
  const contratado = linhas.reduce((s, l) => s + l.contratado, 0)
  const medido = linhas.reduce((s, l) => s + l.medido, 0)
  return {
    contratado,
    medido,
    pctMedido: contratado ? Math.round((medido / contratado) * 100) : 0,
    alertas: linhas.filter((l) => l.alerta).length,
  }
}
