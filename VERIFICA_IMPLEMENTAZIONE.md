# BuildDoctor — Documento di Verifica Implementazione

Questo documento serve per verificare che l'implementazione di BuildDoctor sia completa e corretta secondo la guida.

## 📋 CHECKLIST STRUTTURA PROGETTO

### 1. File di Configurazione Base

- [ ] `package.json` - Deve contenere tutte le dipendenze:
  - `@supabase/supabase-js`
  - `@supabase/ssr`
  - `@anthropic-ai/sdk`
  - `lucide-react`
  - `sonner`
  - `react-syntax-highlighter`
  - `class-variance-authority`, `clsx`, `tailwind-merge`
  - `@types/react-syntax-highlighter` (dev)

- [ ] `tsconfig.json` - Deve avere path alias `@/*` configurato
- [ ] `tailwind.config.ts` - Deve essere configurato con variabili CSS per shadcn
- [ ] `components.json` - Configurazione shadcn/ui presente
- [ ] `middleware.ts` - Deve proteggere `/dashboard/*` e `/setup`
- [ ] `supabase-schema.sql` - Schema completo con RLS policies
- [ ] `ENV.example` - File esempio variabili ambiente

### 2. Struttura Cartelle

```
builddoctor/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          ✅
│   │   └── callback/
│   │       └── route.ts           ✅
│   ├── (dashboard)/
│   │   ├── layout.tsx            ✅
│   │   ├── page.tsx               ✅
│   │   ├── setup/
│   │   │   └── page.tsx           ⏳
│   │   └── diagnosis/
│   │       └── [id]/
│   │           └── page.tsx       ⏳
│   ├── api/
│   │   ├── azure-devops/
│   │   │   ├── test/
│   │   │   │   └── route.ts       ⏳
│   │   │   ├── pipelines/
│   │   │   │   └── route.ts       ⏳
│   │   │   └── setup-webhook/
│   │   │       └── route.ts       ⏳
│   │   ├── webhooks/
│   │   │   └── azure-devops/
│   │   │       └── route.ts       ⏳
│   │   └── diagnose/
│   │       └── route.ts           ⏳
│   ├── layout.tsx                 ✅
│   ├── page.tsx                   ✅
│   └── globals.css                ✅
├── components/
│   ├── ui/                        ✅
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   └── accordion.tsx
│   └── diagnosis-card.tsx         ⏳
├── lib/
│   ├── supabase/
│   │   ├── client.ts              ✅
│   │   └── server.ts              ✅
│   ├── utils.ts                   ✅
│   ├── azure-devops.ts            ⏳
│   ├── ai.ts                      ⏳
│   └── slack.ts                   ⏳
└── types/
    └── database.ts                ✅
```

Legenda: ✅ = Completato | ⏳ = Da fare

### 3. Verifica File Chiave

#### `app/layout.tsx`
- [ ] Usa font Inter (non Geist)
- [ ] Metadata corretta per BuildDoctor
- [ ] Lang="it"

#### `app/globals.css`
- [ ] Variabili CSS per shadcn/ui (--primary, --secondary, etc.)
- [ ] Layer base configurato

#### `lib/supabase/client.ts`
- [ ] Usa `createBrowserClient` da `@supabase/ssr`
- [ ] Legge variabili ambiente corrette

#### `lib/supabase/server.ts`
- [ ] Usa `createServerClient` da `@supabase/ssr`
- [ ] Gestisce cookies correttamente

#### `middleware.ts`
- [ ] Protegge `/dashboard/*` e `/setup`
- [ ] Redirect a `/login` se non autenticato
- [ ] Redirect a `/dashboard` se già autenticato su `/login`

#### `types/database.ts`
- [ ] Definisce `BuildStatus` e `BuildResult`
- [ ] Interfacce: `Profile`, `Pipeline`, `Build`, `Diagnosis`

### 4. Verifica Pagine Implementate

#### `app/(auth)/login/page.tsx`
- [ ] Usa `createClient` da `@/lib/supabase/client`
- [ ] Bottone GitHub OAuth
- [ ] Redirect a `/callback` dopo login
- [ ] UI con Card shadcn

#### `app/(auth)/callback/route.ts`
- [ ] Scambia code per session
- [ ] Verifica se utente ha `azure_devops_org`
- [ ] Redirect a `/setup` se nuovo utente
- [ ] Redirect a `/dashboard` se esistente

#### `app/(dashboard)/layout.tsx`
- [ ] Verifica auth server-side
- [ ] Header con logo e logout button
- [ ] Redirect a `/login` se non autenticato

#### `app/(dashboard)/page.tsx`
- [ ] Fetch builds con join pipeline e diagnosis
- [ ] Tabella con status badges
- [ ] Link "View Diagnosis" per build fallite
- [ ] Empty state se nessuna build

### 5. File Mancanti (Da Implementare)

#### Setup Page
- [ ] `app/(dashboard)/setup/page.tsx`
  - Wizard 3 step:
    1. Connetti Azure DevOps (org + PAT)
    2. Seleziona Pipeline (dropdown progetti + pipeline)
    3. Configura Slack (opzionale)

#### Diagnosis Page
- [ ] `app/(dashboard)/diagnosis/[id]/page.tsx`
  - Mostra root cause, explanation, suggested fix
  - Relevant logs (accordion)
  - Copy button per fix
  - Link Azure DevOps

#### API Routes
- [ ] `app/api/azure-devops/test/route.ts` - Test connection
- [ ] `app/api/azure-devops/pipelines/route.ts` - List pipelines
- [ ] `app/api/azure-devops/setup-webhook/route.ts` - Setup webhook
- [ ] `app/api/webhooks/azure-devops/route.ts` - Receive webhook
- [ ] `app/api/diagnose/route.ts` - Process build + AI

#### Library Files
- [ ] `lib/azure-devops.ts`
  - `testConnection(org, pat)`
  - `getProjects(org, pat)`
  - `getPipelines(org, project, pat)`
  - `getBuildLogs(org, project, buildId, pat)`
  - `createServiceHook(...)`

- [ ] `lib/ai.ts`
  - `classifyError(logs)` - Usa claude-3-haiku
  - `generateDiagnosis(category, relevantLines)` - Usa claude-3-sonnet
  - `diagnoseBuild(logs)` - Combina i due

- [ ] `lib/slack.ts`
  - `sendDiagnosis(webhookUrl, diagnosis, build, pipelineName)`
  - `sendTestMessage(webhookUrl)`

#### Components
- [ ] `components/diagnosis-card.tsx` (opzionale)

### 6. Verifica Schema Database

#### `supabase-schema.sql`
- [ ] Tabella `profiles` con FK a `auth.users`
- [ ] Tabella `pipelines` con FK a `profiles`
- [ ] Tabella `builds` con FK a `pipelines` e CHECK su status/result
- [ ] Tabella `diagnoses` con FK a `builds`
- [ ] RLS abilitato su tutte le tabelle
- [ ] Policies RLS corrette:
  - Users vedono solo i propri dati
  - Builds e diagnoses rispettano la catena di ownership

### 7. Verifica Configurazioni

#### `components.json`
- [ ] Style: "default"
- [ ] RSC: true
- [ ] Base color configurato
- [ ] Aliases corretti

#### `tailwind.config.ts`
- [ ] Colori shadcn configurati (primary, secondary, destructive, etc.)
- [ ] Border radius variabili
- [ ] Dark mode support

### 8. Verifica Dipendenze

Eseguire: `npm list` e verificare che tutte le dipendenze siano installate:
- [ ] @supabase/supabase-js
- [ ] @supabase/ssr
- [ ] @anthropic-ai/sdk
- [ ] lucide-react
- [ ] sonner
- [ ] react-syntax-highlighter
- [ ] class-variance-authority
- [ ] clsx
- [ ] tailwind-merge

### 9. Verifica Funzionalità MVP (7 Feature)

Secondo la guida, le 7 feature MVP sono:

1. ✅ **Auth GitHub** - Login OAuth implementato
2. ⏳ **Connetti Azure DevOps** - Da implementare in setup page
3. ⏳ **Seleziona 1 Pipeline** - Da implementare in setup page
4. ⏳ **Webhook automatico** - Da implementare
5. ⏳ **AI Diagnosis** - Da implementare
6. ⏳ **Notifica Slack** - Da implementare
7. ⏳ **Pagina diagnosis** - Da implementare

### 10. Checklist Funzionalità

#### Auth Flow
- [ ] Login GitHub funziona
- [ ] Callback scambia code correttamente
- [ ] Redirect a /setup se nuovo utente
- [ ] Redirect a /dashboard se esistente
- [ ] Logout funziona

#### Dashboard
- [ ] Mostra builds dell'utente
- [ ] Status badges colorati correttamente
- [ ] Link "View Diagnosis" solo per build fallite
- [ ] Empty state funziona

#### Middleware
- [ ] Protegge /dashboard/* correttamente
- [ ] Protegge /setup correttamente
- [ ] Redirect funziona in entrambe le direzioni

### 11. Verifica Errori

Eseguire:
```bash
npm run lint
```

Verificare:
- [ ] Nessun errore TypeScript
- [ ] Nessun errore ESLint
- [ ] Tutti gli import corretti
- [ ] Tutte le variabili ambiente referenziate esistono

### 12. Test Manuali Suggeriti

1. **Test Auth:**
   - Visitare `/login`
   - Cliccare "Sign in with GitHub"
   - Verificare redirect a callback
   - Verificare redirect finale

2. **Test Dashboard:**
   - Visitare `/dashboard` senza auth → deve redirect a `/login`
   - Visitare `/dashboard` con auth → deve mostrare pagina

3. **Test Middleware:**
   - Visitare `/setup` senza auth → deve redirect a `/login`
   - Visitare `/login` con auth → deve redirect a `/dashboard`

## 📝 Note per la Verifica

1. **Variabili Ambiente:** Assicurarsi che `ENV.example` contenga tutte le variabili necessarie
2. **Supabase:** Lo schema SQL deve essere eseguito su Supabase prima di testare
3. **GitHub OAuth:** Deve essere configurato in Supabase Dashboard
4. **Componenti shadcn:** Tutti i componenti necessari devono essere installati

## 🎯 Stato Attuale

**Completato:**
- ✅ Setup progetto base
- ✅ Configurazione shadcn/ui
- ✅ Auth: Login e Callback
- ✅ Dashboard: Layout e pagina principale
- ✅ Middleware protezione
- ✅ Schema database
- ✅ Types TypeScript

**Da Completare:**
- ⏳ Setup page (wizard 3 step)
- ⏳ API routes Azure DevOps
- ⏳ Lib: azure-devops.ts, ai.ts, slack.ts
- ⏳ Pagina diagnosis detail
- ⏳ Webhook receiver
- ⏳ Diagnose endpoint

## 🔍 Come Usare Questo Documento

1. Leggere ogni sezione
2. Verificare che i file esistano
3. Controllare il contenuto dei file chiave
4. Eseguire `npm run lint` per errori
5. Testare manualmente le funzionalità implementate
6. Segnare con ✅ o ⏳ ogni item

---

**Data Verifica:** _______________
**Verificato da:** _______________
**Note:** _______________

