# Appli Double B

Appli web (PWA, installée sur téléphone) du restaurant Double B. Utilisée par toute l'équipe (profils Julien, Eric, Thierry, Claire),
dont des personnes peu à l'aise avec le numérique : elle doit rester simple, belle, moderne, avec de grandes zones à toucher.
Tous les textes visibles sont en français.

## Pages
- `index.html` : **Commande** (fournisseurs, prix, envoi par message). Onglet prioritaire : ne jamais le dégrader.
- `accueil.html` (Aujourd'hui), `hygiene.html`, `menus.html`, `chiffres.html` (CA midi/soir, graphique), `evenements.html`.
- `profil.js` : choix du profil, barre du haut, notifications, partagé par toutes les pages.
- `sw.js` : service worker (hors connexion, mise à jour d'un bloc).

## Techno
- HTML/CSS/JS pur, un fichier par page, sans framework, sans build, sans npm.
- Données : Supabase (projet `kokjumjhpasxxxrpspng`), uniquement via des fonctions RPC protégées par le code d'équipe
  (`etat`, `suivi_maj`, `suivi_mois`, `hyg_etat`, `evenements_liste`…). Rappels : fonction Edge `rappels`.
- Hébergement : GitHub Pages, branche `main` (publication automatique).

## Lancer et tester
```bash
python3 -m http.server 8791 --bind 127.0.0.1
```
- Ouvrir http://127.0.0.1:8791/ et tester **en largeur téléphone (375 px)**, en clair et en sombre.
- Ne jamais tester sur les vraies données : copier les pages dans un dossier de test en remplaçant
  `https://kokjumjhpasxxxrpspng.supabase.co/` par `http://127.0.0.1:9/`, puis simuler les réponses.
- Les pages demandent `localStorage["commande2b-code"]` (mettre une valeur factice, jamais le vrai code).

## Publier
1. Changer `CACHE` dans `sw.js` (`commande-2b-vNN` → `vNN+1`) à **chaque** publication, sinon les téléphones gardent l'ancienne version.
2. Commit en français, clair et court, puis `git push` sur `main`.
3. Vérifier la page en ligne (GitHub Pages met 1 à 2 minutes), puis dire de fermer et rouvrir l'appli une fois.

## Conventions
- Méthode : analyser, proposer la solution la plus simple, tester en taille téléphone, puis présenter.
- Respecter le style existant : variables CSS dans `:root`, mode sombre, noms et commentaires en français.
- Changement de base de données : migration Supabase ; les anciennes saisies ne sont jamais recalculées sans accord.

## Ne pas toucher / ne jamais publier
- Le vrai code d'équipe, la clé privée VAPID et le secret des rappels (ils restent dans la table des secrets Supabase).
- Le fichier LISEZ-MOI contenant les codes d'accès : jamais dans ce dépôt.
- Les albums photos personnels « Cuisine » et « Shoot ».
- Ne pas supprimer de données ni modifier les droits Supabase sans demande explicite.
