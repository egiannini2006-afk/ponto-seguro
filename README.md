# Ponto Seguro

> **Protótipo · dados simulados.** Feito para o pitch da Semana Concentrada de Empreendedorismo da FGV EAESP.

"Antes de chegar ao ponto, saiba se você vai estar sozinha." Um web app exclusivo para mulheres que mostra,
num mapa, quantas mulheres estão em cada ponto de ônibus e estação de metrô, ocorrências recentes, quando o
próximo ônibus chega, e oferece um trajeto protegido com aviso simulado aos contatos de confiança.

---

## 1. Como rodar no seu computador

Você precisa ter o **Node.js** instalado (versão 20 ou mais nova). Se não tiver, baixe em
[nodejs.org](https://nodejs.org) (escolha a versão "LTS").

Depois, no terminal, dentro da pasta do projeto:

```bash
npm install
npm run dev
```

O terminal vai mostrar um endereço, algo como `http://localhost:5173`. Abra esse endereço no navegador —
de preferência numa janela estreita (ou use o modo celular das ferramentas de desenvolvedor), porque o app foi
feito para tela de celular.

---

## 2. Como publicar de graça na Vercel

A Vercel hospeda o site de graça. Tem duas formas: **sem terminal** (mais fácil para quem está começando) ou
pelo terminal.

### Opção sem terminal — GitHub + Vercel

1. Crie uma conta grátis em [github.com](https://github.com), se ainda não tiver.
2. No GitHub, clique em **"New repository"**, dê um nome (ex: `ponto-seguro`) e crie o repositório.
3. Na página do repositório vazio, clique em **"uploading an existing file"** e arraste todos os arquivos e
   pastas do projeto (menos a pasta `node_modules`, que não precisa subir). Confirme o envio ("Commit changes").
4. Crie uma conta grátis em [vercel.com](https://vercel.com) — pode entrar direto com sua conta do GitHub.
5. No painel da Vercel, clique em **"Add New..." → "Project"**.
6. Escolha o repositório `ponto-seguro` que você acabou de criar e clique em **"Import"**.
7. A Vercel detecta sozinha que é um projeto Vite — não precisa mudar nada. Clique em **"Deploy"**.
8. Espere cerca de 1 minuto. Quando terminar, a Vercel mostra o link do site (algo como
   `ponto-seguro.vercel.app`). Esse é o link para usar na demo.

Depois disso, toda vez que você quiser atualizar o site, basta subir os arquivos novos no mesmo repositório do
GitHub (pela mesma tela de "upload") — a Vercel republica sozinha.

### Opção pelo terminal

```bash
npm install -g vercel
vercel
```

Siga as perguntas na tela (confirme a pasta do projeto, aceite as opções padrão). No fim, a Vercel mostra o
link do site publicado.

---

## 3. O que é real e o que é simulado

| | |
|---|---|
| ✅ Real | O app em si: mapa, contagem, ocorrências, trajeto, pontos — tudo funciona de verdade dentro do navegador. |
| ✅ Real | A persistência: o que você faz fica salvo no `localStorage` do seu navegador, mesmo recarregando a página. |
| 🎭 Simulado | **Todos os dados** (locais, contagens, ocorrências, patrocinadoras, cupons) — nenhum vem de uma fonte real. |
| 🎭 Simulado | Login e verificação de identidade — não há servidor nem checagem real de documento. |
| 🎭 Simulado | Localização da usuária — é fixa perto da FGV, não usa GPS. |
| 🎭 Simulado | Chegada de ônibus/metrô — não vem da SPTrans nem do Metrô, é só um contador que desce. |
| 🎭 Simulado | SOS, ligação ao 190, aviso aos contatos — nunca liga nem envia nada de verdade. |
| 🎭 Simulado | Pagamentos e resgate de cupons — só descontam pontos, não há transação real. |

---

## 4. Roteiro de demonstração (2 minutos)

1. **Perfil → Resetar demonstração** — garante que tudo começa do mesmo jeito.
2. Mostrar o **mapa** (Radar) — explicar a contagem por ponto e a legenda.
3. Tocar no ponto **"Av. 9 de Julho · FGV"** — mostrar que não aparece número nenhum (menos de 3 mulheres).
4. Tocar **"Estou aqui"** — o marcador vira **"3+"** na hora.
5. Tocar no ponto **"Rua Augusta"** — mostrar a ocorrência já registrada ali.
6. **Relatar ocorrência** → escolher **"Ponto sem luz"** → enviar — mostrar o agradecimento e os pontos ganhos.
7. **Iniciar trajeto** (linha 875A-10, destino Pinheiros) → esperar/mostrar o progresso → **"Cheguei"**.
8. Ir para a aba **Benefícios** — mostrar o saldo de pontos e os cupons.

Dica: ative **Perfil → Modo apresentação** antes da demo para os tempos do trajeto passarem mais rápido.

---

## Abrir o app

Depois de `npm run dev`, o endereço é **http://localhost:5173** (ou a porta que o terminal mostrar).
