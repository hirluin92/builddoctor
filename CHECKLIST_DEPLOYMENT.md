# ✅ Checklist Deployment BuildDoctor

## 📋 Pre-Deployment

### Ambiente Locale
- [ ] `npm install` eseguito con successo
- [ ] Nessun errore di lint (`npm run lint`)
- [ ] Build locale funziona (`npm run build`)
- [ ] Test locale funziona (`npm run dev`)

### Supabase Setup
- [ ] Progetto Supabase creato
- [ ] Schema database eseguito (`supabase-schema.sql`)
- [ ] Tabelle verificate: `profiles`, `pipelines`, `builds`, `diagnoses`
- [ ] RLS policies attive
- [ ] GitHub OAuth provider configurato
- [ ] Client ID e Secret GitHub aggiunti
- [ ] Redirect URL configurati (dev + prod)

### Environment Variables
- [ ] `.env.local` creato
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurato
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurato
- [ ] `ANTHROPIC_API_KEY` configurato
- [ ] `NEXT_PUBLIC_APP_URL` configurato (dev)

### Credenziali Esterne
- [ ] GitHub OAuth App creato
- [ ] Anthropic API key ottenuta
- [ ] Azure DevOps PAT creato (per test)

---

## 🚀 Deployment

### Repository
- [ ] Repository GitHub creato
- [ ] Codice committato
- [ ] Push su GitHub eseguito
- [ ] `.env.local` NON committato (già in `.gitignore`)

### Vercel
- [ ] Account Vercel creato
- [ ] Repository importato
- [ ] Framework preset: Next.js
- [ ] Environment variables aggiunte:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL` (URL Vercel)
- [ ] Deploy eseguito con successo
- [ ] URL produzione ottenuto

### Post-Deployment
- [ ] Redirect URL produzione aggiunto in Supabase
- [ ] Test login GitHub funziona
- [ ] Test callback OAuth funziona
- [ ] Dashboard accessibile

---

## 🧪 Testing

### Autenticazione
- [ ] Login GitHub funziona
- [ ] Redirect dopo login corretto
- [ ] Logout funziona
- [ ] Protezione route funziona (middleware)

### Setup Wizard
- [ ] Test connessione Azure DevOps funziona
- [ ] Lista progetti caricata
- [ ] Lista pipeline caricata
- [ ] Selezione pipeline funziona
- [ ] Test Slack webhook funziona
- [ ] Salvataggio configurazione funziona

### Webhook Azure DevOps
- [ ] Webhook creato su Azure DevOps
- [ ] Build fallita triggera webhook
- [ ] Record build creato nel DB
- [ ] Status build: pending → analyzing → completed

### AI Diagnosis
- [ ] Log build recuperati correttamente
- [ ] Classificazione errori funziona (Haiku)
- [ ] Diagnosi dettagliata funziona (Sonnet)
- [ ] Diagnosis salvata nel DB
- [ ] Confidence score calcolato

### Dashboard
- [ ] Build fallite visualizzate
- [ ] Status badge corretti
- [ ] Link a diagnosi funziona
- [ ] Auto-refresh funziona (30s)

### Pagina Diagnosi
- [ ] Root cause visualizzato
- [ ] Explanation visualizzato
- [ ] Suggested fix visualizzato
- [ ] Syntax highlighting funziona
- [ ] Copy button funziona
- [ ] Relevant logs visualizzati
- [ ] Link Azure DevOps funziona

### Notifiche Slack
- [ ] Notifica inviata su Slack
- [ ] Formattazione corretta
- [ ] Tutti i campi presenti

---

## 🔒 Sicurezza

- [ ] RLS policies attive su Supabase
- [ ] Middleware protezione route attivo
- [ ] Environment variables non esposte nel client
- [ ] PAT Azure DevOps non loggato
- [ ] Webhook secret generato correttamente
- [ ] Validazione input API routes

---

## 📊 Performance

- [ ] Build time < 60s
- [ ] Page load < 2s
- [ ] API response < 1s
- [ ] Diagnosis time < 30s

---

## 📝 Documentazione

- [ ] README.md aggiornato
- [ ] SETUP_RAPIDO.md creato
- [ ] CHECKLIST_DEPLOYMENT.md creato
- [ ] RIEPILOGO_IMPLEMENTAZIONE.md creato
- [ ] ENV.example aggiornato

---

## 🎯 Go-Live

### Pre-Launch
- [ ] Tutti i test passati
- [ ] Nessun errore in console
- [ ] Logs puliti
- [ ] Performance accettabili

### Launch
- [ ] Deploy produzione eseguito
- [ ] URL produzione verificato
- [ ] Test end-to-end eseguito
- [ ] Monitoraggio attivo

### Post-Launch
- [ ] Monitoraggio errori attivo
- [ ] Logs analizzati
- [ ] Feedback utenti raccolti
- [ ] Metriche tracciate

---

## 🐛 Known Issues

_Lista eventuali problemi noti da risolvere:_

- [ ] Nessun problema noto

---

## 📈 Metriche da Monitorare

- [ ] Numero build analizzate
- [ ] Tempo medio diagnosi
- [ ] Tasso successo diagnosi
- [ ] Errori API
- [ ] Uptime applicazione
- [ ] Tempo risposta webhook

---

**Data completamento checklist**: _______________
**Completato da**: _______________
**Note**: _______________

