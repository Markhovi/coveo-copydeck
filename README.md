# Coveo Event Copydeck

Interface web pour générer des copydecks d'événements Sitecore.

## Fonctionnement

1. **Remplir** — Formulaire web avec tous les champs Sitecore
2. **Télécharger** — Génère un `.docx` structuré (compatible Google Docs)
3. **Réviser** — L'équipe révise dans Google Docs
4. **Exporter** — Retour sur la page pour télécharger le CSV Sitecore

## Déploiement sur GitHub Pages

### Étape 1 — Créer un repo GitHub

1. Aller sur [github.com/new](https://github.com/new)
2. Nommer le repo : `coveo-copydeck`
3. Le mettre en **Public**
4. Cliquer **Create repository**

### Étape 2 — Uploader les fichiers

```bash
git init
git add .
git commit -m "Initial commit — Coveo Copydeck"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/coveo-copydeck.git
git push -u origin main
```

### Étape 3 — Activer GitHub Pages

1. Aller dans **Settings** du repo
2. Section **Pages** (menu gauche)
3. Source : **Deploy from a branch**
4. Branch : **main** / **(root)**
5. Cliquer **Save**

### Étape 4 — Accéder à la page

Votre page sera disponible à :
```
https://VOTRE-USERNAME.github.io/coveo-copydeck/
```

## Structure des fichiers

```
coveo-copydeck/
├── index.html        ← Page principale
├── css/
│   └── style.css     ← Styles
├── js/
│   └── app.js        ← Logique (formulaire, docx, csv)
└── README.md
```

## Champs avec options contraintes

| Champ | Options |
|-------|---------|
| Fuseau horaire | Eastern ST \| Central ST \| Pacific ST \| GMT \| CET |
| Display Weekday | true \| false |
| Display Event Time Zone | true \| false |
| Display Generic TZ Abbreviation | true \| false |
| Display Event Duration | true \| false |
| Registration Behavior | Page with form \| External Registration |
| Component Position | Left \| Right |
| Component Width | 40% \| 50% \| 60% \| 100% |
