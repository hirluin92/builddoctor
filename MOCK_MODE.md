# 🎯 MOCK MODE - Guida Completa

## 📋 Overview

Il **MOCK MODE** permette di sviluppare e testare BuildDoctor senza dover configurare Azure DevOps, GitHub OAuth, o token reali. Tutto funziona con dati simulati ma realistici.

---

## ⚙️ Configurazione

### 1. Aggiungi le variabili d'ambiente

Nel tuo `.env.local`:

```env
# Mock Mode (per sviluppo locale)
DEVOPS_MODE=mock
NEXT_PUBLIC_DEVOPS_MODE=mock
```

> **Nota**: In produzione, lascia queste variabili vuote o imposta `real`.

---

## 🚀 Come Funziona

### Quando `DEVOPS_MODE=mock`:

1. **Login GitHub** → Saltato automaticamente, redirect a `/dashboard`
2. **Setup Azure DevOps** → Auto-completato con dati mock
3. **API Azure DevOps** → Ritornano dati simulati
4. **AI Diagnosis** → Funziona con log mock realistici
5. **Dashboard** → Mostra badge "Mock Mode attivo"

---

## 📁 File Modificati

### Nuovi File
- `lib/mocks/devops.mock.ts` - Dati mock realistici

### File Modificati
- `app/api/diagnose/route.ts` - Supporta mock mode
- `app/api/azure-devops/test/route.ts` - Ritorna sempre successo in mock
- `app/api/azure-devops/projects/route.ts` - Ritorna progetti mock
- `app/api/azure-devops/pipelines/route.ts` - Ritorna pipeline mock
- `app/api/azure-devops/setup-webhook/route.ts` - Salva senza creare webhook reale
- `middleware.ts` - Salta autenticazione in mock mode
- `app/(auth)/login/page.tsx` - Redirect automatico in mock mode
- `app/(dashboard)/setup/page.tsx` - Auto-completa setup in mock mode
- `app/(dashboard)/page.tsx` - Mostra badge mock mode
- `ENV.example` - Aggiunte variabili mock mode

---

## 🎨 Dati Mock Disponibili

### Progetti
```typescript
{
  id: "demo-project-1",
  name: "BuildDoctor Demo Project"
}
```

### Pipeline
```typescript
[
  { id: 42, name: "CI Pipeline" },
  { id: 43, name: "Deploy Pipeline" }
]
```

### Build Logs
```typescript
`Error: Database connection failed
at createBooking (/app/api/bookings/route.ts:42)
at processRequest (node:internal)`
```

---

## ✅ Test del Mock Mode

1. **Avvia il server**:
   ```bash
   npm run dev
   ```

2. **Vai su** `http://localhost:3000`

3. **Risultato atteso**:
   - ✅ Redirect automatico a `/dashboard` (nessun login)
   - ✅ Badge "Mock Mode attivo" visibile
   - ✅ Setup auto-completato
   - ✅ API ritornano dati mock
   - ✅ AI può analizzare log mock

---

## 🔄 Passare da Mock a Real

Per usare Azure DevOps reale:

1. **Rimuovi o modifica** `.env.local`:
   ```env
   # DEVOPS_MODE=mock  # Commenta o rimuovi
   # NEXT_PUBLIC_DEVOPS_MODE=mock  # Commenta o rimuovi
   ```

2. **Riavvia il server**:
   ```bash
   npm run dev
   ```

3. **Ora funziona con Azure DevOps reale**:
   - Login GitHub richiesto
   - Setup Azure DevOps richiesto
   - API chiamano Azure DevOps reale

---

## 🎯 Vantaggi del Mock Mode

- ✅ **Sviluppo veloce**: Nessuna configurazione esterna
- ✅ **Demo pronte**: Puoi mostrare il prodotto senza setup
- ✅ **Test AI**: Puoi testare i prompt con dati realistici
- ✅ **UX Iteration**: Puoi migliorare l'interfaccia senza dipendenze
- ✅ **CI/CD Testing**: Puoi testare il flusso completo

---

## 🚨 Note Importanti

1. **Database**: In mock mode, i dati vengono comunque salvati nel database Supabase (se configurato)
2. **AI**: L'AI funziona normalmente con i log mock
3. **Slack**: Le notifiche Slack vengono saltate in mock mode
4. **Webhook**: I webhook Azure DevOps non vengono creati in mock mode

---

## 🔧 Personalizzazione Dati Mock

Puoi modificare i dati mock in `lib/mocks/devops.mock.ts`:

```typescript
export const mockDevOpsData = {
  // Modifica qui per testare scenari diversi
  logs: `Il tuo log di errore personalizzato qui`,
  // ...
};
```

---

## 📝 Prossimi Passi

1. ✅ Mock mode implementato
2. 🔄 (Opzionale) Aggiungere più scenari mock
3. 🔄 (Opzionale) Popolamento automatico dashboard con build mock
4. 🔄 (Opzionale) Toggle UI per switch mock/real mode

