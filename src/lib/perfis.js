// Quem é quem e o que cada perfil enxerga. A mesma lista vai para o CHECK de
// `profiles.role` no banco (Etapa 7) — se divergir, o salvamento falha calado.
export const PERFIS = {
  engenheiro: {
    rotulo: 'Engenheiro',
    menu: ['frentes', 'diario', 'medicao', 'pendencias', 'obras'],
    verValores: true,
    verFornecedor: true,
  },
  mestre: {
    rotulo: 'Mestre de obras',
    menu: ['frentes', 'diario'],
    verValores: false,
    verFornecedor: true,
  },
  arquiteta: {
    rotulo: 'Arquiteta',
    menu: ['pendencias'],
    verValores: false,
    verFornecedor: false, // [CONFIRMAR] no plano
  },
  cliente: {
    rotulo: 'Cliente',
    menu: ['avanco', 'fotos'],
    verValores: false,
    verFornecedor: false,
  },
}

export function perfil(role) {
  return PERFIS[role] ?? null
}

export function podeVerValores(role) {
  return PERFIS[role]?.verValores === true
}

export function podeVerFornecedor(role) {
  return PERFIS[role]?.verFornecedor === true
}

export function podeAcessar(role, tela) {
  return PERFIS[role]?.menu.includes(tela) === true
}
