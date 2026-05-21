# Republica · Prototype

Prototype de démonstration d'une plateforme de simulation politique.
Une session de 6 étapes : investiture, premier arbitrage (retraites), conséquences, événement imprévu (cyberattaque), conséquences, profil politique final partageable.

**Aucun backend, aucune base de données, aucun appel LLM.**
Les conséquences sont scriptées en dur pour garantir une démo fiable et instantanée.

---

## Déploiement Vercel · 3 minutes

### Option 1 — Via GitHub (recommandée)

1. Crée un nouveau dépôt GitHub vide (ex : `republica-prototype`)
2. Pousse les fichiers de ce dossier dedans :
   ```bash
   git init
   git add .
   git commit -m "initial prototype"
   git remote add origin git@github.com:ton-pseudo/republica-prototype.git
   git push -u origin main
   ```
3. Va sur [vercel.com/new](https://vercel.com/new), connecte ton GitHub
4. Sélectionne le dépôt → Vercel détecte Next.js automatiquement → Deploy
5. Tu obtiens un lien public en `https://republica-prototype.vercel.app` (ou similaire)

### Option 2 — Via Vercel CLI

```bash
npm install -g vercel
cd republica-prototype
vercel
```

Suis les prompts. Pour déployer en production : `vercel --prod`.

### Option 3 — Test local d'abord

```bash
npm install
npm run dev
```
Puis ouvre http://localhost:3000

---

## Coûts

**0 €.** Vercel offre un plan Hobby gratuit qui couvre largement les besoins d'un prototype de démonstration (100 GB de bande passante / mois). Tu peux montrer le lien à des dizaines de personnes sans toucher la limite.

---

## Structure

- `app/page.js` — toute la logique du prototype dans un seul fichier React
- `app/layout.js` — métadonnées et configuration globale
- `package.json` — Next.js 14 et React 18, rien d'autre
- `next.config.js` — configuration minimale

Aucun framework CSS (pas de Tailwind, pas de styled-components) : tout est en CSS inline pour rester portable et lisible.

---

## Personnalisation

Tout est dans `app/page.js`. Les sections sont clairement identifiées par des commentaires `SECTION X`. La palette de couleurs est centralisée dans la constante `COLORS` en tête de fichier. La logique de classification politique finale est dans la fonction `classifyFamily()` — six combinaisons possibles selon les deux choix du joueur.

Pour ajouter un dossier supplémentaire : dupliquer le pattern `Dossier1` / `Consequence1` et ajouter une étape dans `SECTIONS`.

---

## Ce que le prototype démontre

- L'esthétique : note confidentielle d'État, ton institutionnel, or vieilli sur fond charbon
- La mécanique d'arbitrage : trois scénarios, positions d'agents, fact-check Nouvelle Énergie sur le deuxième dossier
- La présence de Nouvelle Énergie comme agent indépendant et constructif
- Les indicateurs vivants qui évoluent en temps réel
- La classification finale en famille politique standard (centre-droit libéral, droite conservatrice, etc.)
- La carte de partage final, format réseau social

## Ce que le prototype NE démontre PAS

- Le mandat complet de 100 jours (ici, deux décisions seulement)
- La génération LLM en temps réel des conséquences
- Le comparatif anonymisé entre joueurs
- Les 60 dossiers de la version complète
