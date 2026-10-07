# Ponto Seguro — guia para qualquer alteração futura

Protótipo (MVP) de um web app exclusivo para mulheres que mostra, num mapa, quantas mulheres estão em cada
ponto de ônibus e estação de metrô de São Paulo (só a partir de 3), ocorrências relatadas por outras mulheres,
quando o próximo ônibus chega, e oferece um trajeto protegido com aviso simulado aos contatos de confiança.
Construído para a demo de pitch da Semana Concentrada de Empreendedorismo da FGV EAESP.

**Sem servidor, sem banco de dados, sem login real.** Tudo roda no navegador; os dados ficam no `localStorage`.

Qualquer mudança no código precisa continuar respeitando as regras abaixo — elas são o motivo do produto existir.

## Onde está cada coisa

- `src/data/seed.ts` — todos os dados iniciais (locais, ocorrências, patrocinadoras, cupons, destinos).
- `src/logic/rules.ts` — **todas** as regras de negócio (R1 a R10), num só lugar.
- `src/store/AppStateContext.tsx` — o estado do app e a persistência no `localStorage`.
- `src/screens/` — uma tela por arquivo (Radar, Trajeto, Benefícios, Perfil, Onboarding, RelatarOcorrencia).
- `src/components/` — pedaços reutilizáveis (mapa, painel do ponto, navegação, etc.).

## Regras de negócio (R1 a R10)

| # | Regra |
|---|---|
| R1 | Faixas de contagem: 0-2 → **sem número nenhum**; 3-4 → "3+"; 5-9 → "5+"; 10+ → "10+". Nunca revelar que há uma mulher sozinha, em marcador, painel ou lista alguma. |
| R2 | Nunca mostrar a posição ou o perfil de outra usuária — só a contagem por ponto. |
| R3 | Um ponto por vez: marcar "Estou aqui" em outro local tira a usuária do anterior automaticamente. |
| R4 | Sem duplicidade: marcar duas vezes no mesmo ponto não soma. Depois de marcada, o botão vira "Você está aqui · Sair". |
| R5 | Ocorrências só aparecem se tiverem menos de 3 horas (e não estiverem marcadas como resolvidas). |
| R6 | Chegada do ônibus: contagem regressiva, -1 min a cada 60s reais; ao chegar a 0 mostra "chegando" e reinicia entre 8 e 15 min. Metrô mostra status da linha + intervalo médio, nunca previsão de chegada. |
| R7 | A contagem de mulheres só muda pela ação "Estou aqui" — nunca varia sozinha, para os testes darem sempre o mesmo resultado. |
| R8 | Ocorrência relatada é sempre anônima (nenhum dado de quem relatou). Tipo obrigatório; descrição opcional, até 140 caracteres. |
| R9 | SOS só aciona se ficar pressionado por **3 segundos** (com indicador de progresso); toque rápido não aciona. Nunca liga nem envia nada de verdade. |
| R10 | Pontos: +10 trajeto protegido concluído, +15 ocorrência relatada, +5 ocorrência confirmada. Cupom só resgata com saldo suficiente; ao resgatar, desconta os pontos. |

Funções centrais em `src/logic/rules.ts`: `faixaContagem`, `proximoCheckIn`, `ocorrenciasValidas`, `avancarChegadaOnibus`,
`gravidadeOcorrencia`, `faltamPontos`, `emailValido`, `pareceEmailUniversitario`.

## Dados obrigatórios (não mudar os valores abaixo sem querer quebrar os testes)

| Local | Tipo | Mulheres (base) | Ocorrência inicial |
|---|---|---|---|
| Ponto Av. 9 de Julho · FGV | ônibus | 2 | — |
| Estação Consolação (Linha 2-Verde) | metrô | 12 | — |
| Ponto Av. Paulista · Cásper Líbero | ônibus | 9 | — |
| Ponto Rua Augusta | ônibus | 4 | "Tentativa de furto" · há 25 min · 3 confirmações |
| Ponto Rua da Consolação · Mackenzie | ônibus | 1 | "Ponto sem luz" · há 4h (expirada — nunca aparece) |

Mais 10 locais (5 estações de metrô, 5 pontos de ônibus) e 3 lugares de apoio completam os ~15 locais da região
Paulista/Consolação, todos em `seed.ts`. Usuária fixa perto da FGV (`LOCALIZACAO_USUARIA`), sem GPS real.

## Testes essenciais (sem eles não há demo)

- **E1** — Mapa abre com ~15 marcadores; Estação Consolação = "10+"; Rua Augusta = "3+".
- **E2** — FGV e Mackenzie nunca mostram número, nem no marcador nem no painel.
- **E4** — FGV → "Estou aqui" → marcador vira "3+", botão vira "Você está aqui · Sair".
- **E5** — Marcar em outro ponto tira do anterior automaticamente (R3).
- **E6** — Recarregar a página mantém o check-in e a contagem; "Resetar demonstração" (em Perfil) volta tudo ao estado inicial, inclusive o cadastro.

Os demais testes (E3, E7–E12) estão descritos no histórico do projeto e cobrem ocorrências, confirmação,
trajeto protegido, SOS, cupons e cadastro. Antes de qualquer mudança nas regras R1-R10 ou nos dados da seção
acima, rode esses testes de novo manualmente no navegador.
