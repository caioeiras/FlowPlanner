# PLANO DO PROJETO — Gestão de Obra

> Rascunho vivo. Etapa 1 em andamento. O que falta fica como `[AINDA NÃO RESPONDIDO]`.

## Etapa 1 — Visão Estratégica

### Quem é o dono
Engenheiro civil. Obras residenciais de alto padrão, 30 serviços contratados por obra, ~12 empreiteiros. Trabalha com uma arquiteta e um mestre de obras.

### Unidade principal
**Obra.** O engenheiro toca várias obras ao mesmo tempo. O sistema guarda todas, tem seletor para trocar de obra e **nunca mistura dados entre obras**. Cada registro pertence a uma obra; cada pessoa enxerga só as obras em que trabalha.
Alguém trabalha em mais de uma obra ao mesmo tempo? `[AINDA NÃO RESPONDIDO]` (o engenheiro, com certeza; mestre e arquiteta?)

**Decidido pelo dono (multi-obra):**
- Obra tem: nome, código/apelido, endereço, cliente, data de início, data-meta de entrega, situação (em andamento / concluída / parada).
- Toda tabela de lançamento leva `obra_id` obrigatório — inclusive as de módulos futuros.
- Seletor de obra sempre visível no topo; trocar recarrega a tela inteira; a obra escolhida fica guardada.
- Nenhuma tela mistura obras, exceto um comparativo explícito entre obras.
- Regra registrada no `AGENTS.md` do projeto (lido pelo `CLAUDE.md`).

**Palpites da Fundação, a confirmar** (o app foi montado antes de o plano fechar):
- Mestre marca todo dia, serviço por serviço: Não mexeu / Andou / Concluiu. "Dias parado" = dias desde o último "Andou".
- Cores: âmbar a partir de 5 dias parado, vermelho a partir de 10 ou com decisão em até 3 dias.
- "Entrega em risco" = existe alguma frente vermelha.
- Arquiteta não vê nome de empreiteiro; cliente vê só fotos dos últimos 7 dias.
- Nos dados de exemplo, mestre e cliente estão só na Residência Moraes; engenheiro e arquiteta nas duas.

### O problema

**Problema 1: não sei se a data de entrega do cliente está de pé**
- Hoje: toda sexta, a tarde inteira juntando 3 fontes: o que o mestre contou no canteiro, o WhatsApp dos empreiteiros e a planilha de medição. Na segunda ainda não sabe responder "a data de entrega está de pé?".
- Frequência: toda semana (sexta à tarde, ~4 horas `[CONFIRMAR]`).
- Custo: uma frente atrasada só é descoberta depois de ~2 semanas. É o custo real, em prazo.

**Problema 2: informação espalhada e desatualizada**
- Hoje: planilha de medição com uma aba por empreiteiro (sempre desatualizada), diário de obra no caderno que ninguém relê, fotos soltas em 5 grupos de WhatsApp, cronograma no MS Project aberto só quando o cliente pergunta.
- Frequência: diária.
- Custo: `[PENDENTE: horas por semana]`.

### A solução em uma frase
Um sistema de **acompanhamento de obra** que resolve **"a data de entrega está de pé?"** para **o engenheiro, o mestre, a arquiteta e o cliente**, mostrando **por frente de serviço quem é o responsável, há quantos dias não anda e até quando decidir antes de empurrar a obra**.

### Fora de escopo (versão 1)
- Orçamento e composição de preço (explicitamente fora: já resolvido)
- App nativo de celular (será site que funciona bem no celular)
- Integração com WhatsApp
- Relatório em PDF `[CONFIRMAR]`
- Financeiro completo (o sistema guarda valor contratado e medido por serviço, nada além disso)

### Funcionalidades

#### Frentes de serviço (a tela do dia a dia, do engenheiro)
Abre em: lista
Mostra: serviço, responsável (empreiteiro), dias parados, data limite de decisão, % de avanço
Ordem: mais atrasado primeiro
Filtro: obra (seletor global), status
Ações: ver detalhe, comentar, mudar responsável, ajustar data limite
Ao clicar: abre o detalhe do serviço (histórico de diário, fotos, medições)
Vazio: "Nenhuma frente de serviço nesta obra ainda. Cadastre os serviços para começar."

**Regra de "dias parados":** hoje − data do último registro de avanço (diário com foto ou % atualizado) naquele serviço. `[ver pergunta abaixo]`

#### Diário de obra (mestre)
Abre em: formulário rápido de hoje
Mostra: data, serviços trabalhados, observações, fotos
Ordem: mais recente primeiro
Filtro: data, serviço
Ações: lançar diário com foto, marcar serviço concluído
Ao clicar: abre o diário do dia
Vazio: "Nenhum diário lançado ainda."
Perfil sem nenhum valor financeiro na tela.

#### Medição (engenheiro)
Abre em: lista por empreiteiro
Mostra: serviço, valor contratado, valor medido, saldo
Ordem: empreiteiro, depois serviço
Filtro: empreiteiro
Ações: lançar medição, editar
Ao clicar: abre o serviço
Vazio: "Nenhuma medição lançada."
Substitui a planilha com aba por empreiteiro.

#### Pendências de projeto (arquiteta)
Abre em: lista de pendências
Mostra: título, serviço ligado, status (Aberta, Em análise, Resolvida), comentários
Ordem: abertas primeiro, mais antigas no topo
Filtro: status
Ações: criar, comentar, resolver
Vazio: "Nenhuma pendência de projeto."

#### Visão do cliente
Abre em: avanço por ambiente (sala, cozinha, suítes…)
Mostra: % por ambiente, fotos da semana
Ordem: ambiente
Sem custo, sem nome de fornecedor.
Vazio: "As primeiras fotos da semana aparecem aqui."

#### Seletor de obra (global)
Troca a obra em todas as telas. Dados de uma obra nunca aparecem em outra.

### Perfis e permissões

| Ação | Engenheiro (admin) | Mestre | Arquiteta | Cliente |
|---|---|---|---|---|
| Ver frentes de serviço e atrasos | sim | só andamento, sem valor | só as pendências de projeto | só avanço por ambiente |
| Ver valor contratado e medido | **sim** | **não** | **não** | **não** |
| Ver nome de empreiteiro/fornecedor | sim | sim | `[CONFIRMAR]` | **não** |
| Lançar diário com foto | sim | sim | não | não |
| Marcar serviço concluído | sim | sim | não | não |
| Comentar pendências de projeto | sim | não | sim | não |
| Ver fotos | todas | todas | todas `[CONFIRMAR]` | só as da semana |
| Lançar medição | sim | não | não | não |
| Apagar | sim | não | não | não |
| Gerenciar usuários e obras | sim | não | não | não |
| Quem não fez login | não vê nada | | | |

Confirmação item por item (dinheiro / dado de terceiro): `[AINDA NÃO RESPONDIDO]`

### Fluxo de cadastro
1. A pessoa se cadastra sozinha com email e senha
2. Entra sem perfil e não vê dado nenhum
3. Vê o aviso "Conta aguardando liberação do administrador"
4. O engenheiro libera, escolhe o perfil **e a(s) obra(s)** que a pessoa pode ver

### Ferramentas e custo
| Peça | Serve para | Custo |
|---|---|---|
| Claude | construir o sistema | a assinatura que já tem |
| React + Vite | a interface | grátis |
| Supabase | banco, login e fotos | grátis até crescer |
| Vercel | colocar no ar | grátis |
| GitHub | guardar o código | grátis |

Quanto pagaria por um sistema pronto pra isso: `[AINDA NÃO RESPONDIDO]`

### Prazo
Quando quer estar usando de verdade: `[AINDA NÃO RESPONDIDO]`
Horas por semana disponíveis: `[AINDA NÃO RESPONDIDO]`

### Risco principal
O sistema depende do **mestre lançar o diário** e do **cliente/arquiteta usarem**. Já conversou com o mestre, a arquiteta e o cliente sobre isso? `[AINDA NÃO RESPONDIDO]`

## Etapa 2 — Mercado
`[AINDA NÃO RESPONDIDO]`

## Etapa 3 — Arquitetura
`[AINDA NÃO RESPONDIDO]`

## A conta que vai chegar depois
- `[PENDENTE]` horas por semana gastas com diário/planilha/fotos (Problema 2)

## Decidir depois de usar
(nenhum ainda)
