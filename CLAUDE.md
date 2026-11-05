# Appli Double B

Appli web (PWA, installée sur téléphone) du restaurant Double B. Utilisée par toute l'équipe (profils Julien, Eric, Thierry, Claire),
dont des personnes peu à l'aise avec le numérique : elle doit rester simple, belle, moderne, avec de grandes zones à toucher.
Tous les textes visibles sont en français.

## Pages
- `index.html` : **Commande** (fournisseurs, prix, envoi par message). Onglet prioritaire : ne jamais le dégrader.
- `accueil.html` (Aujourd'hui), `hygiene.html`, `menus.html`, `chiffres.html` (CA midi/soir, graphique ; plats vendus = liste par service avec ＋ Ajouter : plats de la carte dans leurs cases `plats_/bb_/burgers_/pc_`, plats hors carte dans la table `suivi_libres` via `vente_libre_enregistrer`/`vente_libre_supprimer`, et la liste permanente des plats hors carte proposés chaque jour dans `plats_extra` (`plat_extra_ajouter`/`plat_extra_retirer`) ; ils ne touchent jamais au CA, qui vient seulement de la caisse), `evenements.html`.
- `fidelite.html` : cartes de fidélité (profil Julien seulement pour l'instant) ; `carte.html` : page publique du client (jeton secret après #). Règles : pas de limite de tampons (50 max d'un coup contre les fautes de frappe), 10 = un burger offert (le moins cher de la commande : écrit seulement sur l'écran équipe) ; niveaux Bronze/Argent/Or à 1/3/6 cartes finies, chacun donne un cadeau une fois (une boisson, une frite, un dessert : textes au singulier — libellés dans les deux pages, `fid_cadeau`), et en Or chaque nouvelle carte démarre avec 1 tampon (`bonus`).
- `prospection.html` : **prospection traiteur B2B** (profil Julien seulement depuis le 2026-11-05 ; carte sur Aujourd'hui). Voir la section plus bas.
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
  (par SIRET), puis le site de l'organisme (6 pages max : liens contact / mentions + /contact, /mentions-legales… ; robots.txt respecté ;
  adresses cachées par Cloudflare décodées). Sécurité (2026-11-05) : seules les adresses **génériques au nom de domaine du site** sont gardées
  (RGPD), plus une boîte gratuite si elle contient le nom du site (twoclean57730@gmail.com sur twoclean.fr) ; toute adresse doit avoir un
  serveur de mail (MX, vérifié par DNS public). Le téléphone du standard est relevé (liens tel:, puis texte visible).
  « Chercher les adresses » reprend aussi, une fois, les fiches notées « Non trouvée » par l'ancienne méthode (nouvelle note : « Pas trouvée »).
- **Écran** : simplifié le 2026-11-04 (Julien trouvait l'outil trop complexe) : onglets À envoyer (un mail à la fois) / Prospects / Bilan / Réglages.
- **Envoi automatique (Brevo, depuis le 2026-11-05)** : la fonction Edge `prospection` (action `lot`) envoie la file du jour par l'API
  transactionnelle Brevo, du lundi au vendredi à 7 h UTC (tâche cron `prospection-envoi`, pg_cron + pg_net, en-tête `x-cle` = `secrets.cron`).
  Même règles que `queue()` et `buildMail()` de la page (copiées dans la fonction : **modifier les deux ensemble**) : `lots_par_jour` premiers
  contacts (20) + les relances J+7 puis J+15, arrêtées dès « A répondu », un statut avancé ou une désinscription. Expéditeur
  « L'équipe du Double B » <traiteur@doubleb-folschviller.fr> (domaine du site chez o2switch, authentifié dans Brevo ; traiteur@ est redirigé
  vers Outlook), réponse vers doubleb57500@outlook.fr, plaquette jointe (par son adresse en ligne), en-têtes List-Unsubscribe /
  List-Unsubscribe-Post vers `prospection?d=<jeton>` (POST = désinscription en un clic, GET = renvoi vers `desinscription.html?j=`).
  Chaque envoi est noté par `_prosp_noter_envoi` avec `par = 'brevo'` ; le bilan du dernier passage est dans le réglage `brevo_dernier`.
  Rien ne part tant que le réglage `envoi_auto` ≠ `oui` (case dans Réglages). Clé API : `secrets.brevo`, saisie dans Réglages par
  `prosp_brevo_cle` (jamais relue par la page, jamais dans GitHub). Bouton « M'envoyer un test » (action `test`) : un premier contact vers
  doubleb57500@outlook.fr seulement, jamais noté, lien de désinscription factice.
  Écran « À envoyer » en mode automatique : deux sous-onglets « À partir » (prochain passage) / « Déjà partis » (groupés par jour) (chaque ligne ouvre la fiche du mail :
  qui est le prospect, liens Google / site / plan / fiche officielle, puis le mail), les erreurs du dernier lot, et un bouton pour repasser
  en **mode manuel** (Outlook web : mail copié en HTML, on colle, on joint la plaquette, « C'est envoyé »).
  Pas de pixel de suivi des ouvertures (CNIL) : on suit les réponses.
- **SMS anniversaire (cartes fidélité)** : il partage `secrets.brevo`, mais reste en pause tant que `secrets.brevo_sms` ≠ `oui` (choix de Julien,
  2026-11-05 : le forfait Brevo gratuit n'a pas de crédit SMS).
- **Mails** : modèles modifiables (table `prosp_modeles`), jamais de prix (« devis gratuit », « sur mesure », pas de délai promis),
  jamais d'achats industriels. Signature « L'équipe du Double B », bandeau « d'abord un restaurant », SIREN et lien de désinscription
  ajoutés par `buildMail` (le « PS : » du modèle passe sous la signature). Mots auto : `{commune}`, `{occasions}` (selon type/besoin),
  `{saison}` (change avec le mois : jamais « fin d'année » en janvier). La plaquette est **jointe** (PDF léger `plaquette-traiteur.pdf` ; à la main en mode
  manuel, bouton « Télécharger la plaquette »), plus de lien dans le texte (choix de Julien). Jamais « de 15 à 100 personnes » (Julien : « on s'adapte »)
  ni livraison promise (pas de livraison de base : « à emporter », livraison « on en parle »). Photos : `traiteur/photo-N.jpg`
  (table `prosp_photos`) ; celles ajoutées depuis l'onglet Mails vont dans le dossier public Supabase `prospection`.
- **Plaquette** : `plaquette-traiteur.pdf` ; sa source (HTML + photos) est dans iCloud Double B › 03 - Communication › Traiteur.
- **Base** : tables `prosp_*`, RPC `prosp_etat`, `prosp_importer`, `prosp_maj`, `prosp_ajouter`, `prosp_envoye`, `prosp_modele_enregistrer`,
  `prosp_reglage`, `prosp_photo_retirer`, `prosp_brevo_cle` (code d'équipe) et `prosp_desinscrire(p_jeton)` (publique, page de désinscription).
  Réservées à la fonction Edge (clé de service) : `_prosp_tout`, `_prosp_noter_envoi`, `_prosp_reglage_srv`.
