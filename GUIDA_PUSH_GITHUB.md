# 🚀 Guida Push su GitHub

## Comandi da Eseguire

Apri un terminale nella cartella `c:\Impero\Progetti\builddoctor` ed esegui questi comandi in ordine:

### 1. Inizializza Git (se non già fatto)
```bash
git init
```

### 2. Aggiungi il Remote
```bash
git remote add origin https://github.com/hirluin92/builddoctor.git
```

### 3. Aggiungi tutti i file
```bash
git add .
```

### 4. Verifica cosa verrà committato
```bash
git status
```

**IMPORTANTE**: Verifica che NON ci siano file `.env.local` o altri file sensibili nella lista!

### 5. Fai il primo commit
```bash
git commit -m "Initial commit: BuildDoctor MVP v1.0

- Implementate tutte le 7 funzionalità MVP
- Autenticazione GitHub OAuth
- Setup wizard Azure DevOps
- Webhook receiver con validazione HMAC
- AI diagnosis engine (Claude Haiku + Sonnet)
- Dashboard e pagina dettaglio diagnosi
- Notifiche Slack
- Database schema con RLS
- Documentazione completa"
```

### 6. Push su GitHub
```bash
git push -u origin main
```

**Nota**: Se il branch si chiama `master` invece di `main`, usa:
```bash
git branch -M main
git push -u origin main
```

---

## ✅ Verifica Post-Push

Dopo il push, verifica su GitHub:
1. Vai su https://github.com/hirluin92/builddoctor
2. Controlla che tutti i file siano presenti
3. Verifica che `.env.local` NON sia presente (deve essere ignorato)

---

## 🔒 Sicurezza

Il `.gitignore` è configurato per escludere:
- ✅ `.env*` (tutti i file environment)
- ✅ `node_modules/`
- ✅ `.next/`
- ✅ File di build

**NON verranno committati file sensibili!**

---

## 📝 Note

- Il repository è attualmente vuoto su GitHub
- Dopo il push, Claude potrà vedere tutto il codice
- Ricorda di NON committare mai file `.env.local` con credenziali reali

