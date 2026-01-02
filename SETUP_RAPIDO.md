# 🚀 Guida Setup Rapido BuildDoctor

## Prerequisiti

- Node.js 18+ installato
- Account Supabase
- Account Anthropic (per API key Claude)
- Account Azure DevOps (per PAT)
- Account Slack (opzionale, per webhook)

---

## Step 1: Installazione Dipendenze

```bash
cd c:\Impero\Progetti\builddoctor
npm install
```

---

## Step 2: Configurazione Supabase

### 2.1 Crea Progetto Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Crea un nuovo progetto
3. Salva:
   - Project URL (es: `https://xxxxx.supabase.co`)
   - Anon Key (in Settings > API)

### 2.2 Esegui Schema Database
1. Vai su SQL Editor in Supabase
2. Copia e incolla il contenuto di `supabase-schema.sql`
3. Esegui lo script
4. Verifica che le tabelle siano create: `profiles`, `pipelines`, `builds`, `diagnoses`

### 2.3 Configura GitHub OAuth
1. Vai su Authentication > Providers in Supabase
2. Abilita GitHub provider
3. Aggiungi:
   - **Client ID**: Dal tuo GitHub OAuth App
   - **Client Secret**: Dal tuo GitHub OAuth App
4. Aggiungi Redirect URL: `http://localhost:3000/auth/callback` (per dev)
5. Aggiungi Redirect URL: `https://your-domain.vercel.app/auth/callback` (per produzione)

**Come creare GitHub OAuth App:**
1. Vai su GitHub > Settings > Developer settings > OAuth Apps
2. Clicca "New OAuth App"
3. Nome: BuildDoctor
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/auth/callback`
6. Salva Client ID e Client Secret

---

## Step 3: Configurazione Environment Variables

Crea il file `.env.local` nella root del progetto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# App URL (per webhook)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# In produzione: NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Come ottenere ANTHROPIC_API_KEY:
1. Vai su [console.anthropic.com](https://console.anthropic.com)
2. Crea account o accedi
3. Vai su API Keys
4. Crea nuova API key
5. Copia la chiave (inizia con `sk-ant-`)

---

## Step 4: Test Locale

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

### Test Flow:
1. ✅ Login con GitHub
2. ✅ Setup Azure DevOps (inserisci org e PAT)
3. ✅ Seleziona progetto e pipeline
4. ✅ Configura Slack webhook (opzionale)
5. ✅ Verifica dashboard

---

## Step 5: Deployment Vercel

### 5.1 Push su GitHub
```bash
git init
git add .
git commit -m "Initial commit: BuildDoctor MVP"
git remote add origin https://github.com/your-username/builddoctor.git
git push -u origin main
```

### 5.2 Deploy su Vercel
1. Vai su [vercel.com](https://vercel.com)
2. Importa il repository GitHub
3. Configura:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
4. Aggiungi Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (URL Vercel, es: `https://builddoctor.vercel.app`)
5. Deploy

### 5.3 Aggiorna Supabase Redirect URL
Dopo il deploy, aggiungi il nuovo callback URL in Supabase:
- `https://your-domain.vercel.app/auth/callback`

---

## Step 6: Configurazione Azure DevOps

### 6.1 Crea Personal Access Token (PAT)
1. Vai su Azure DevOps > User Settings > Personal Access Tokens
2. Crea nuovo token con scope:
   - **Build**: Read & execute
   - **Project and team**: Read
3. Salva il token (non sarà più visibile)

### 6.2 Setup Pipeline in BuildDoctor
1. Accedi a BuildDoctor
2. Vai su Setup
3. Inserisci:
   - Organization name (es: `my-org`)
   - Personal Access Token
4. Seleziona progetto e pipeline
5. Configura Slack (opzionale)

---

## Step 7: Test Webhook

### 7.1 Trigger Build Fallita
1. Vai su Azure DevOps
2. Esegui una pipeline che fallisce (es: errore di compilazione)
3. Verifica che BuildDoctor riceva il webhook

### 7.2 Verifica Dashboard
1. Controlla che la build appaia in dashboard
2. Verifica che lo status cambi da "pending" → "analyzing" → "completed"
3. Clicca su "View Diagnosis" per vedere la diagnosi AI

---

## 🐛 Troubleshooting

### Webhook non ricevuti
- ✅ Verifica che `NEXT_PUBLIC_APP_URL` sia configurato correttamente
- ✅ Verifica che l'URL sia accessibile pubblicamente (non localhost in produzione)
- ✅ Controlla i log di Azure DevOps per errori webhook

### Diagnosi non funziona
- ✅ Verifica che `ANTHROPIC_API_KEY` sia valida
- ✅ Controlla i log del server (Vercel Functions)
- ✅ Verifica che i log della build siano disponibili in Azure DevOps

### Login GitHub non funziona
- ✅ Verifica Client ID e Secret in Supabase
- ✅ Verifica che i Redirect URL siano corretti
- ✅ Controlla che GitHub OAuth App sia configurato correttamente

### Errori database
- ✅ Verifica che lo schema SQL sia stato eseguito
- ✅ Controlla che RLS policies siano attive
- ✅ Verifica che le credenziali Supabase siano corrette

---

## ✅ Checklist Pre-Deployment

- [ ] Dipendenze installate (`npm install`)
- [ ] Schema database eseguito su Supabase
- [ ] GitHub OAuth configurato in Supabase
- [ ] Environment variables configurate (`.env.local`)
- [ ] Test locale funzionante (`npm run dev`)
- [ ] Repository GitHub creato e push effettuato
- [ ] Vercel deployment configurato
- [ ] Environment variables aggiunte su Vercel
- [ ] Redirect URL aggiornato in Supabase per produzione
- [ ] Azure DevOps PAT creato
- [ ] Pipeline configurata in BuildDoctor
- [ ] Test webhook eseguito con successo

---

## 📞 Supporto

Per problemi o domande:
1. Controlla i log di Vercel Functions
2. Verifica i log di Supabase
3. Controlla la console del browser per errori client-side
4. Verifica che tutte le API keys siano valide

---

**Buon deployment! 🚀**

