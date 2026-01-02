# BuildDoctor

BuildDoctor diagnostica automaticamente i fallimenti delle pipeline CI/CD su Azure DevOps per progetti .NET. Trasforma 30 minuti di debug in 30 secondi.

## 🚀 Features MVP

- ✅ Autenticazione GitHub OAuth
- ✅ Setup wizard per Azure DevOps e Slack
- ✅ Webhook Azure DevOps per build fallite
- ✅ AI Diagnosis Engine (Claude Haiku + Sonnet)
- ✅ Dashboard con storico build
- ✅ Pagina dettaglio diagnosi con fix suggeriti
- ✅ Notifiche Slack automatiche

## 📋 Setup

### 1. Installa le dipendenze
```bash
npm install
```

### 2. Configura le variabili ambiente
Crea un file `.env.local` basandoti su `ENV.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Supabase
1. Crea un progetto su [Supabase](https://supabase.com)
2. Configura GitHub OAuth in Authentication > Providers
3. Esegui lo schema SQL (vedi `supabase-schema.sql`) nel SQL Editor

### 4. Avvia il server di sviluppo
```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 🛠 Stack Tecnologico

- **Framework**: Next.js 16 (App Router)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **AI**: Anthropic Claude API (Haiku per classificazione, Sonnet per diagnosi)
- **Notifiche**: Slack Webhooks
- **Hosting**: Vercel (consigliato)

## 📁 Struttura Progetto

```
app/
├── (auth)/
│   ├── login/          # Pagina login GitHub OAuth
│   └── callback/       # OAuth callback handler
├── (dashboard)/
│   ├── page.tsx        # Dashboard principale
│   ├── setup/          # Setup wizard
│   └── diagnosis/[id]/ # Dettaglio diagnosi
└── api/
    ├── azure-devops/   # API Azure DevOps
    ├── webhooks/       # Webhook receiver
    ├── diagnose/       # AI diagnosis endpoint
    └── slack/          # Slack webhook test/save

lib/
├── supabase/           # Client Supabase (server/client)
├── azure-devops.ts     # Azure DevOps API client
├── ai.ts               # AI diagnosis engine
└── slack.ts            # Slack notifications

components/
├── ui/                 # shadcn/ui components
├── code-block.tsx      # Syntax highlighter
├── copy-button.tsx     # Copy to clipboard
└── build-status-badge.tsx # Status badge component
```

## 🔄 Flusso di Lavoro

1. **Onboarding**: Login GitHub → Connessione Azure DevOps → Selezione Pipeline → Configurazione Slack
2. **Build Failure**: Azure DevOps invia webhook → BuildDoctor crea record → Trigger diagnosi AI
3. **Diagnosis**: Fetch log → Classificazione (Haiku) → Diagnosi (Sonnet) → Salvataggio DB
4. **Notification**: Invio notifica Slack con root cause e fix suggerito
5. **Dashboard**: Visualizzazione build fallite con link alle diagnosi

## 🔐 Sicurezza

- Row Level Security (RLS) su tutte le tabelle Supabase
- Validazione webhook con HMAC signature
- PAT Azure DevOps criptati (da implementare in produzione)
- Middleware per protezione route

## 📝 Note

- I PAT Azure DevOps sono attualmente salvati in plain text. In produzione, implementare crittografia.
- Il webhook handler usa `fire and forget` per la diagnosi per rispondere rapidamente ad Azure DevOps.
- I log sono limitati a 50.000 caratteri per evitare limiti di token AI.

## 🐛 Troubleshooting

- **Webhook non ricevuti**: Verifica che `NEXT_PUBLIC_APP_URL` sia configurato correttamente e accessibile pubblicamente
- **Diagnosi fallite**: Controlla i log del server e verifica che `ANTHROPIC_API_KEY` sia valido
- **Slack non funziona**: Verifica il formato del webhook URL e testa con `/api/slack/test`
