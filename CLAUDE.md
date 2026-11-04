# Appli Double B

Appli web (PWA, installée sur téléphone) du restaurant Double B. Utilisée par toute l'équipe (profils Julien, Eric, Thierry, Claire),
dont des personnes peu à l'aise avec le numérique : elle doit rester simple, belle, moderne, avec de grandes zones à toucher.
Tous les textes visibles sont en français.

## Pages
- `index.html` : **Commande** (fournisseurs, prix, envoi par message). Onglet prioritaire : ne jamais le dégrader.
- `accueil.html` (Aujourd'hui), `hygiene.html`, `menus.html`, `chiffres.html` (CA midi/soir, graphique ; plats vendus = liste par service avec ＋ Ajouter : plats de la carte dans leurs cases `plats_/bb_/burgers_/pc_`, plats hors carte dans la table `suivi_libres` via `vente_libre_enregistrer`/`vente_libre_supprimer`, et la liste permanente des plats hors carte proposés chaque jour dans `plats_extra` (`plat_extra_ajouter`/`plat_extra_retirer`) ; ils ne touchent jamais au CA, qui vient seulement de la caisse), `evenements.html`.
- `fidelite.html` : cartes de fidélité (profil Julien seulement pour l'instant) ; `carte.html` : page publique du client (jeton secret après #). Règles : pas de limite de tampons (50 max d'un coup contre les fautes de frappe), 10 = un burger offert (le moins cher de la commande : écrit seulement sur l'écran équipe) ; niveaux Bronze/Argent/Or à 1/3/6 cartes finies, chacun donne un cadeau une fois (une boisson, une frite, un dessert : textes au singulier — libellés dans les deux pages, `fid_cadeau`), et en Or chaque nouvelle carte démarre avec 1 tampon (`bonus`).
- `prospection.html` : **prospection traiteur B2B** (profils Julien, Eric, Thierry ; carte sur Aujourd'hui). Voir la section plus bas.
- `desinscription.html` : page publique ouverte par le lien en bas des mails de prospection (jeton secret `?j=`).
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

## Prospection traiteur (`prospection.html`)
But : décrocher des contrats réguliers (entreprises, CSE, associations, mairies) pour les dînatoires, déjeuners livrés et plateaux.
- **Import** : API publique « Recherche d'entreprises » (base SIRENE, sans clé) + communes de geo.api.gouv.fr. Rayon 10 / 15 / 30 km
  autour du centre de Folschviller (distance au centre de la commune). Écartés : entrepreneurs individuels, diffusion partielle,
  opposition à la prospection, restaurants (NAF 56), annexes techniques (liste `EXCL`). Un contact par organisme et par commune.
- **Adresses** : fonction Edge `prospection` (source dans `supabase/functions/prospection/`) : annuaire officiel du service public
  (par SIRET), puis le site de l'organisme (3 pages max, robots.txt respecté). Seules les adresses **génériques** sont gardées (RGPD).
- **Envoi** : pas de service d'envoi pour l'instant (choix de Julien, 2026-11-04) : le mail est copié en HTML puis Outlook web s'ouvre
  (destinataire + objet remplis) ; on colle, on envoie, on touche « C'est envoyé ». Relances : J+7 puis J+15 après le 1er contact,
  arrêtées dès « A répondu », un statut avancé ou une désinscription. Pas de pixel de suivi des ouvertures (CNIL) : on suit les réponses.
- **Mails** : modèles modifiables (table `prosp_modeles`), jamais de prix (« devis gratuit », « sur mesure », pas de délai promis),
  jamais d'achats industriels. Signature « L'équipe du Double B », bandeau « d'abord un restaurant », SIREN et lien de désinscription
  ajoutés par `buildMail` ; `{plaquette}` = bouton vers `plaquette-traiteur.pdf`. Jamais « de 15 à 100 personnes » (Julien : « on s'adapte »)
  ni livraison promise (pas de livraison de base : « à emporter », livraison « on en parle »). Photos : `traiteur/photo-N.jpg`
  (table `prosp_photos`) ; celles ajoutées depuis l'onglet Mails vont dans le dossier public Supabase `prospection`.
- **Plaquette** : `plaquette-traiteur.pdf` ; sa source (HTML + photos) est dans iCloud Double B › 03 - Communication › Traiteur.
- **Base** : tables `prosp_*`, RPC `prosp_etat`, `prosp_importer`, `prosp_maj`, `prosp_ajouter`, `prosp_envoye`, `prosp_modele_enregistrer`,
  `prosp_reglage`, `prosp_photo_retirer` (code d'équipe) et `prosp_desinscrire(p_jeton)` (publique, page de désinscription).
- **Plus tard** : quand le domaine `ledoubleb.fr` et un compte Brevo existeront (clé dans `secrets`), remplacer le copier-coller par
  un envoi automatique par lots depuis la fonction Edge, avec expéditeur @ledoubleb.fr (SPF/DKIM) et lien de désinscription en en-tête.

