# 📋 Briefing per Claude - Verifica BuildDoctor MVP

## 🎯 Contesto

Sto sviluppando **BuildDoctor**, una piattaforma B2B SaaS che diagnostica automaticamente i fallimenti delle pipeline CI/CD su Azure DevOps per progetti .NET. L'obiettivo è ridurre il tempo di debug da 30 minuti a 30 secondi.

## 📊 Stato Attuale

**Versione**: MVP v1.0  
**Status Implementazione**: ✅ **COMPLETATO**  
**Location**: `c:\Impero\Progetti\builddoctor`

---

## ✅ Cosa è Stato Implementato

### 1. Funzionalità Core (7/7)
1. ✅ **Autenticazione GitHub OAuth**
   - Login page (`app/(auth)/login/page.tsx`)
   - OAuth callback handler (`app/(auth)/callback/route.ts`)
   - Middleware per protezione route (`middleware.ts`)

2. ✅ **Setup Wizard**
   - Pagina setup multi-step (`app/(dashboard)/setup/page.tsx`)
   - Step 1: Connessione Azure DevOps (org + PAT)
   - Step 2: Selezione progetto e pipeline
   - Step 3: Configurazione Slack webhook
   - API routes per test connessioni e salvataggio

3. ✅ **Webhook Azure DevOps**
   - Webhook receiver (`app/api/webhooks/azure-devops/route.ts`)
   - Filtro solo build fallite
   - Creazione record build nel DB
   - Trigger asincrono diagnosi AI

4. ✅ **AI Diagnosis Engine**
   - Classificazione errori con Claude Haiku (`lib/ai.ts`)
   - Diagnosi dettagliata con Claude Sonnet
   - Estrazione log rilevanti
   - Limitazione log a 50k caratteri
   - API endpoint (`app/api/diagnose/route.ts`)

5. ✅ **Dashboard**
   - Pagina principale (`app/(dashboard)/page.tsx`)
   - Visualizzazione build fallite
   - Badge stato build
   - Link a diagnosi
   - Auto-refresh ogni 30 secondi

6. ✅ **Pagina Dettaglio Diagnosi**
   - Pagina dinamica (`app/(dashboard)/diagnosis/[id]/page.tsx`)
   - Root cause, explanation, suggested fix
   - Syntax highlighting per codice
   - Copy button per fix
   - Log rilevanti in accordion
   - Link ad Azure DevOps

7. ✅ **Notifiche Slack**
   - Invio automatico diagnosi (`lib/slack.ts`)
   - Formattazione con blocchi Slack
   - API test e save webhook

### 2. Struttura Progetto

```
builddoctor/
├── app/
│   ├── (auth)/              # Autenticazione
│   │   ├── login/page.tsx
│   │   └── callback/route.ts
│   ├── (dashboard)/         # Dashboard protetta
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Dashboard principale
│   │   ├── setup/page.tsx   # Setup wizard
│   │   └── diagnosis/[id]/page.tsx
│   └── api/                 # API routes
│       ├── azure-devops/    # Test, projects, pipelines, setup-webhook
│       ├── diagnose/        # AI diagnosis endpoint
│       ├── slack/           # Test e save webhook
│       └── webhooks/azure-devops/  # Webhook receiver
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── code-block.tsx       # Syntax highlighting
│   ├── copy-button.tsx      # Copy to clipboard
│   ├── build-status-badge.tsx
│   └── dashboard-refresh.tsx
├── lib/
│   ├── supabase/           # Client browser e server
│   ├── azure-devops.ts     # Azure DevOps API client
│   ├── ai.ts               # AI diagnosis engine
│   ├── slack.ts            # Slack notifications
│   └── utils.ts
├── types/
│   └── database.ts         # TypeScript types
├── middleware.ts            # Route protection
├── supabase-schema.sql     # Database schema
└── ENV.example             # Template variabili ambiente
```

### 3. Stack Tecnologico

- **Framework**: Next.js 16.1.1 (App Router)
- **Linguaggio**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase Auth (GitHub OAuth)
- **AI**: Anthropic Claude (Haiku per classificazione, Sonnet per diagnosi)
- **Notifiche**: Slack Webhooks

### 4. Database Schema

**Tabelle** (definite in `supabase-schema.sql`):
1. `profiles` - Dati utente (Azure DevOps org/PAT, Slack webhook)
2. `pipelines` - Pipeline configurate con webhook secret
3. `builds` - Record build fallite con status (pending, analyzing, completed, failed)
4. `diagnoses` - Diagnosi AI complete

**Sicurezza**:
- Row Level Security (RLS) attivo su tutte le tabelle
- Policies per isolamento dati utente

### 5. API Routes Implementate

- `POST /api/azure-devops/test` - Test connessione Azure DevOps
- `PUT /api/azure-devops/test` - Salva credenziali Azure DevOps
- `GET /api/azure-devops/projects` - Lista progetti
- `GET /api/azure-devops/pipelines` - Lista pipeline per progetto
- `POST /api/azure-devops/setup-webhook` - Setup webhook e salva pipeline
- `POST /api/webhooks/azure-devops` - Webhook receiver Azure DevOps
- `POST /api/diagnose` - Trigger diagnosi AI
- `POST /api/slack/test` - Test Slack webhook
- `POST /api/slack/save` - Salva Slack webhook URL

### 6. Documentazione Creata

- ✅ `README.md` - Documentazione principale
- ✅ `SETUP_RAPIDO.md` - Guida setup passo-passo
- ✅ `CHECKLIST_DEPLOYMENT.md` - Checklist deployment
- ✅ `RIEPILOGO_IMPLEMENTAZIONE.md` - Riepilogo tecnico dettagliato
- ✅ `STATO_PROGETTO.md` - Stato progetto e metriche
- ✅ `VERIFICA_IMPLEMENTAZIONE.md` - Checklist verifica
- ✅ `ENV.example` - Template variabili ambiente

---

## 🔍 Cosa Devi Verificare

### 1. Verifica Struttura File
- [ ] Tutti i file elencati esistono nella struttura corretta
- [ ] Nessun file mancante rispetto alle specifiche
- [ ] Struttura directory conforme a Next.js App Router

### 2. Verifica Implementazione Funzionalità

#### Autenticazione
- [ ] Login GitHub OAuth implementato correttamente
- [ ] Callback handler gestisce redirect corretti
- [ ] Middleware protegge route `/dashboard/*` e `/setup`
- [ ] Middleware reindirizza utenti autenticati da `/login`

#### Setup Wizard
- [ ] 3 step implementati (Azure DevOps, Pipeline, Slack)
- [ ] Test connessione Azure DevOps funziona
- [ ] Lista progetti e pipeline caricate correttamente
- [ ] Webhook creato su Azure DevOps
- [ ] Salvataggio configurazione nel DB

#### Webhook Azure DevOps
- [ ] Webhook receiver gestisce eventi `build.complete`
- [ ] Filtra solo build fallite (`result: "failed"`)
- [ ] Crea record build nel DB con status "pending"
- [ ] Trigger asincrono diagnosi AI

#### AI Diagnosis
- [ ] Classificazione errori con Haiku implementata
- [ ] Diagnosi dettagliata con Sonnet implementata
- [ ] Log limitati a 50k caratteri
- [ ] Validazione log non vuoti
- [ ] Gestione errori e fallback
- [ ] Salvataggio diagnosis nel DB
- [ ] Aggiornamento status build (pending → analyzing → completed)

#### Dashboard
- [ ] Visualizza solo build fallite
- [ ] Badge stato build corretti
- [ ] Link a diagnosi funzionanti
- [ ] Auto-refresh ogni 30 secondi

#### Pagina Diagnosi
- [ ] Root cause, explanation, suggested fix visualizzati
- [ ] Syntax highlighting funziona
- [ ] Copy button funziona
- [ ] Log rilevanti in accordion
- [ ] Link Azure DevOps corretto

#### Notifiche Slack
- [ ] Invio automatico dopo diagnosi
- [ ] Formattazione corretta con blocchi Slack
- [ ] Test webhook funziona

### 3. Verifica Codice

#### TypeScript
- [ ] Nessun errore TypeScript
- [ ] Tipi corretti per database (`types/database.ts`)
- [ ] Tipi corretti per API responses

#### Error Handling
- [ ] Gestione errori in tutte le API routes
- [ ] Try-catch appropriati
- [ ] Messaggi errore utili

#### Security
- [ ] RLS policies implementate nel schema SQL
- [ ] Middleware protegge route sensibili
- [ ] Validazione input API routes
- [ ] PAT Azure DevOps gestiti correttamente (nota: in plain text, da criptare in produzione)

#### Performance
- [ ] Log limitati per evitare limiti token AI
- [ ] Query Supabase ottimizzate
- [ ] Auto-refresh non troppo frequente

### 4. Verifica Database Schema

- [ ] Schema SQL completo (`supabase-schema.sql`)
- [ ] 4 tabelle create: profiles, pipelines, builds, diagnoses
- [ ] RLS policies per tutte le tabelle
- [ ] Foreign keys corrette
- [ ] Indici appropriati

### 5. Verifica Configurazione

- [ ] `package.json` con tutte le dipendenze necessarie
- [ ] `tsconfig.json` configurato correttamente
- [ ] `tailwind.config.ts` configurato
- [ ] `next.config.ts` configurato
- [ ] `middleware.ts` configurato correttamente
- [ ] `ENV.example` con tutte le variabili necessarie

### 6. Verifica Documentazione

- [ ] README completo e chiaro
- [ ] SETUP_RAPIDO con istruzioni passo-passo
- [ ] CHECKLIST_DEPLOYMENT completa
- [ ] Tutti i documenti aggiornati

---

## ⚠️ Note Importanti

1. **Git Repository**: NON è stato inizializzato. Tutti i file sono solo locali.

2. **Environment Variables**: NON sono state configurate. Serve creare `.env.local` con:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL`

3. **Supabase**: NON è stato configurato. Serve:
   - Creare progetto Supabase
   - Eseguire schema SQL
   - Configurare GitHub OAuth

4. **Testing**: NON è stato testato. Il codice è pronto ma non è stato eseguito.

5. **Build**: C'è stato un errore Tailwind CSS (`border-border`) che è stato corretto sostituendo con CSS diretto.

---

## 🎯 Obiettivo Verifica

Verifica che:
1. ✅ Tutte le 7 funzionalità MVP siano implementate correttamente
2. ✅ Il codice sia conforme alle best practices
3. ✅ Non ci siano errori o bug evidenti
4. ✅ La struttura del progetto sia corretta
5. ✅ La documentazione sia completa
6. ✅ Il database schema sia corretto
7. ✅ Le API routes siano implementate correttamente

---

## 📝 Domande Specifiche per Claude

1. **Il codice è completo?** Tutte le funzionalità richieste sono implementate?

2. **Ci sono errori evidenti?** Bug, problemi di logica, errori di sintassi?

3. **La struttura è corretta?** Conforme a Next.js 16 App Router?

4. **Le API sono implementate correttamente?** Gestione errori, validazione input, response format?

5. **Il database schema è corretto?** RLS policies, foreign keys, tipi dati?

6. **La sicurezza è adeguata?** Middleware, RLS, validazione input?

7. **Cosa manca?** Funzionalità, file, configurazioni?

8. **Cosa migliorare?** Refactoring, ottimizzazioni, best practices?

---

## 📂 File Chiave da Verificare

1. `app/(auth)/login/page.tsx` - Login GitHub
2. `app/(dashboard)/setup/page.tsx` - Setup wizard
3. `app/api/webhooks/azure-devops/route.ts` - Webhook receiver
4. `app/api/diagnose/route.ts` - AI diagnosis
5. `lib/ai.ts` - AI engine
6. `lib/azure-devops.ts` - Azure DevOps client
7. `supabase-schema.sql` - Database schema
8. `middleware.ts` - Route protection

---

**Grazie per la verifica!** 🚀

