# VerdeBet — Plataforma de Apostas Esportivas (demo)

Aplicação full-stack de uma casa de apostas com **marca própria** (não é cópia de
nenhuma marca existente). Serve como base editável para um projeto próprio.

> ⚠️ **Aviso:** projeto demonstrativo. Operar apostas com dinheiro real no Brasil
> exige licença (SPA/Ministério da Fazenda) e um gateway de pagamento PIX
> regulado. O fluxo de depósito vem em **modo mock** (sem dinheiro real) e o
> ponto de integração de pagamento está pronto para um gateway legítimo. Nenhuma
> chave PIX pessoal está embutida no código.

## Funcionalidades

- **Cadastro/login** de usuários com banco de dados (SQLite). Cada cadastro fica
  registrado na tabela `users`.
- **Listagem de esportes e jogos** com múltiplos mercados e seleções.
- **Odds ao vivo**: um motor interno move as odds continuamente; o frontend
  re-busca a cada poucos segundos e mostra indicadores de alta/baixa (▲▼).
  Pronto para plugar uma API de odds real (ex.: The Odds API) via `ODDS_API_KEY`.
- **Painel admin** para editar odds manualmente.
- **Carteira + depósito via PIX** (modo mock que confirma na hora; troque por um
  gateway regulado em produção).
- **Boletim de apostas** com cálculo de retorno potencial e débito do saldo.

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node + Express + better-sqlite3 + JWT

## Como rodar

### Backend

```bash
cd server
npm install
cp .env.example .env
npm run seed   # popula esportes, jogos e cria o admin
npm run dev    # http://localhost:4000
```

Admin padrão: `admin@apostas.local` / `admin123`

### Frontend

```bash
cd client
npm install
npm run dev    # http://localhost:5173 (proxy /api -> :4000)
```

## Estrutura

```
server/   API Express + SQLite (auth, eventos/odds, apostas, carteira)
client/   SPA React (home, login, cadastro, conta, admin)
```

## Integrações em produção (próximos passos)

- **Pagamentos PIX:** integrar Mercado Pago / Pagar.me / Asaas em
  `server/src/routes/wallet.ts`. Creditar saldo somente via webhook de
  confirmação; liquidar em conta de empresa licenciada.
- **Odds reais:** implementar `fetchFromProvider()` em
  `server/src/oddsFeed.ts` com uma API de odds e `ODDS_API_KEY`.
- **Resolução de apostas:** liquidar `bets` quando os eventos terminarem
  (ganhou/perdeu) e creditar prêmios.
