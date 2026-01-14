# 🚀 Guida al Deploy su GitHub Pages

## Passo 1: Verifica il nome del repository

Il nome del repository GitHub determina l'URL del sito. Attualmente è configurato per `mattia_33`.

**Se il tuo repository ha un nome diverso**, modifica `vite.config.js`:
```javascript
base: process.env.NODE_ENV === 'production' ? '/NOME-DEL-TUO-REPO/' : '/',
```

## Passo 2: Crea/Verifica il repository su GitHub

1. Vai su [GitHub](https://github.com) e crea un nuovo repository (se non esiste già)
2. Assicurati che il repository sia pubblico per GitHub Pages gratuito
3. Copia l'URL del repository

## Passo 3: Configura il remote (se necessario)

Se non hai ancora configurato il remote:

```bash
git remote add origin https://github.com/TUO-USERNAME/mattia_33.git
```

Sostituisci `TUO-USERNAME` con il tuo username GitHub.

## Passo 4: Abilita GitHub Pages

1. Vai su GitHub nel tuo repository
2. Clicca su **Settings** > **Pages**
3. In **Source**, seleziona **GitHub Actions**
4. Salva

## Passo 5: Commit e Push

```bash
# Aggiungi tutti i file
git add .

# Commit
git commit -m "Setup GitHub Pages deployment"

# Push su GitHub
git push -u origin main
```

## Passo 6: Verifica il Deploy

1. Vai su **Actions** nel tuo repository GitHub
2. Dovresti vedere un workflow "Deploy to GitHub Pages" in esecuzione
3. Quando completa, il tuo sito sarà disponibile su:
   `https://TUO-USERNAME.github.io/mattia_33/`

## 🔄 Deploy Automatico

Ogni volta che fai push su `main`, il sito verrà automaticamente aggiornato!

## ⚠️ Note Importanti

- Il repository deve essere **pubblico** per GitHub Pages gratuito
- Il workflow potrebbe richiedere alcuni minuti per completare
- Se cambi il nome del repository, aggiorna anche `vite.config.js`

## 🐛 Risoluzione Problemi

### Il sito non si carica
- Verifica che il base path in `vite.config.js` corrisponda al nome del repository
- Controlla che GitHub Pages sia abilitato nelle impostazioni
- Verifica che il workflow GitHub Actions sia completato con successo

### Le immagini non si caricano
- Assicurati che i file SVG siano nella cartella `public/`
- Verifica che il base path sia corretto
