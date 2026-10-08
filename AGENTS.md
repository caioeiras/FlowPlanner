# MinhaObra

Acompanhamento de obras residenciais: frentes de serviço paradas, diário do
mestre, medição por empreiteiro, pendências de projeto e visão do cliente.
React + Vite + Supabase + Vercel, só `@supabase/supabase-js` como dependência.
Perfis: engenheiro, mestre, arquiteta, cliente — uma shell só (`src/pages/Shell.jsx`),
com o menu de cada perfil vindo de `src/lib/perfis.js`.
Plano e decisões do dono: `PLANO-DO-PROJETO.md`. Referência visual: `preview.html`.

## ESTE APP É MULTI-OBRA (regra que vale para todo módulo novo)

O engenheiro toca várias obras ao mesmo tempo e os dados **nunca** se misturam.

1. **Toda tabela de lançamento tem `obra_id` obrigatório** (`not null references obras(id)`),
   com índice começando por `obra_id`. Vale para as tabelas de hoje e para as de
   todo módulo que vier. Só ficam sem `obra_id` os cadastros do escritório
   (ex.: `empreiteiros`) e as tabelas de usuário.
2. **Todo módulo novo filtra por `obra_id`.** Quem filtra é a camada de dados
   (`src/lib/dados.js`): ela pega a obra atual por dentro (`obraAtual()`), que
   trava se não houver obra. **As telas nunca passam `obra_id`** — assim nenhuma
   tela consegue esquecer o filtro.
3. **Nenhuma tela mostra dados de duas obras juntas**, a não ser uma tela que seja
   explicitamente um comparativo entre obras — e aí é uma consulta agregada na
   camada de dados (uma linha por obra), nunca um laço chamando o banco por obra.
4. **Trocar de obra remonta a tela inteira** (`key={obraId}` no Shell). Qualquer
   cache, `useRef` ou chave de `localStorage` que guarde dado tem o `obra_id` na chave.
5. **A obra escolhida fica guardada** por usuário (`minhaobra.obra.<userId>` no
   navegador) e é revalidada contra as obras que a pessoa ainda pode ver.
6. **No banco, a RLS é por obra** em toda tabela: `obra_id in (select public.minhas_obras())`,
   a partir da tabela `membros (obra_id, user_id)`. Nunca `using (true)`.
7. **Desenvolva e teste sempre com as duas obras do mock** (`o1` cheia, `o2` enxuta e
   sem pendências). `tests/isolamento-obras.mjs` confere que nada vaza — todo
   módulo novo ganha uma linha nele.

## Onde o código novo vai

Uma pergunta decide: **"isto continuaria verdade se a tela fosse outra?"**

- **Sim → `src/lib/*.js`.** Regra pura: cálculo, recorte, decisão, formatação.
  Sem React, sem banco, sem `window`. Roda no Node sem bundler (import com
  `.js` explícito). É a única camada com teste.
- **Não → `src/screens/*.jsx`.** Estado de interface, layout, o que se toca.
  A tela **pede a decisão à lib**; não decide.
- `src/lib/dados.js` — **única porta dos dados.** Nenhuma tela lê o mock nem chama o
  Supabase direto. Hoje lê `src/lib/mockData.js`; na etapa do banco troca-se o miolo.
- `src/lib/supabase.js` — a conexão (null enquanto não houver `.env.local`).

Três consequências práticas:

1. **`if` de negócio dentro de tela vai para `lib`**, mesmo com três linhas —
   se a linha decide *o que é verdade*, e não *o que aparece*.
2. **Constante compartilhada tem um dono só.** Status, perfis, situações de obra:
   `src/lib/perfis.js`, `src/lib/obras.js`, `src/lib/frentes.js`. A mesma lista vira
   o CHECK da coluna no banco — se divergir, o salvamento falha calado.
3. **Arquivo grande não é problema; arquivo confuso é.** Quebre quando o arquivo
   passar a ter *dois motivos para mudar*.

**Quem vê o quê** é decidido em `src/lib/perfis.js` e aplicado na camada de dados
(o mestre e o cliente recebem `valor_contratado: null`; o cliente e a arquiteta não
recebem nome de fornecedor). Esconder só na tela não basta.

## Régua de verificação

```bash
npm run check
```

Build + lint + testes. **Fecha em zero** — não há linha de base herdada aqui.
Aviso novo é seu e é de agora; conserte no mesmo lote.

Nada disso prova que a tela funciona. Verde com a tela em branco é rotina:
abra no navegador, nas duas obras, e troque de obra com a tela aberta.

**Todo bug corrigido em `src/lib/` nasce com teste junto**, no mesmo lote.

## Antes de subir pro GitHub

Diff que toca em `src/lib/supabase.js`, `src/lib/dados.js`, `src/lib/perfis.js`,
políticas RLS, migrations ou medição (valores) → rodar a revisão de código
(`/code-review` no Claude Code, `/review` no Codex) antes de subir. Nesses arquivos
o erro não aparece na tela: RLS frouxa ou filtro de obra faltando vaza dado sem sintoma.

## Deploy

Ainda não publicado. Padrão desta casa: a pessoa diz "sobe pro GitHub", o agente
roda `git add`, `git commit`, `git push`, e a Vercel publica sozinha. A pessoa não
digita comando.

## Armadilhas desta base

- **Windows:** se o `npm` falhar com "execução de scripts foi desabilitada", use
  `npm.cmd`. Nunca mexer na política de execução do Windows.
- **Datas:** trafegam como texto `AAAA-MM-DD`. Nunca gerar com `toISOString()`
  (vira UTC e pula um dia à noite no Brasil) — use `isoLocal()` de `src/lib/formato.js`.
- **Tabela nova nasce fechada para o app.** Toda tabela precisa de `grant` escrito
  na migration, só para `authenticated`. Erro "permission denied for table (42501)"
  é GRANT faltando, não RLS. Nunca `grant all`, nunca `to anon`.
- **Mock tem datas relativas a hoje** (`mockData.js`): o "dias parado" de exemplo
  muda sozinho conforme o dia, de propósito.

## Higiene de código (vale para toda mudança)

Cada função morta é uma mentira que o próximo leitor precisa desmascarar.

- **Ao remover um recurso, cace a cadeia inteira no mesmo lote:** a função em
  `lib/dados.js` → a exposição no contexto → os chamadores nas telas → a query.
- **Zero avisos novos de lint.**
- **Código comentado não é backup, o git é.** Comentário explica *por quê*.
- **Antes de apagar, prove que está morto:** grep pelo símbolo no projeto inteiro.
- **Estado que nunca muda ou nunca é lido é lixo.**
- **Limpeza NUNCA toca no banco nem em arquivo de dado.** Tabela ou coluna
  órfã continua existindo até decisão de quem é dono. Na dúvida, pergunte.

## O que entra neste arquivo

Só o que o código não conta sozinho: armadilha, o porquê de uma decisão,
convenção que difere do padrão, proibição, o que a verificação exige.
Nada de árvore de pastas, lista de dependências ou histórico.
