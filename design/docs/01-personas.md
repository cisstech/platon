# Personas

Tirés de l'exploration avec les comptes de démonstration (`aruston`, `bcacManus`, `ypicker`) et
vérifiés dans le code. Les hypothèses sont marquées **à vérifier**.

## Inès, étudiante en L1

- **Qui** : suit trois cours, fait ses TP sur ordinateur, consulte sur téléphone. Arrive souvent par
  Moodle (LTI).
- **Objectif** : savoir quoi faire et pour quand, lancer ou reprendre une activité, comprendre ses
  erreurs.
- **Freins** : l'accueil affiche huit statistiques et aucune activité. Si le chargement des activités
  d'un cours échoue, elle lit « Ce cours ne contient aucune section ». La page du cours lui montre le
  nombre d'enseignants et d'élèves. La fin d'activité affiche l'identifiant technique de la session et
  un champ « Code de déblocage », qu'il y ait un code ou non.
- **Réussi si** : en arrivant, elle voit ses activités ouvertes triées par échéance et reprend en un
  clic.

## Karim, responsable d'UE

- **Qui** : maître de conférences, environ 300 étudiants, six chargés de TD. Ouvre une ou deux
  activités par semaine, exporte les notes en fin de semestre.
- **Objectif** : préparer la semaine, voir ce qui est ouvert et qui bloque, exporter des notes justes.
- **Freins** : son accueil est le sélecteur de modèles d'exercice, sans ses cours ni ses activités.
  Ajouter une activité passe par un assistant en quatre étapes (trois depuis une section). Les
  paramètres du cours alignent plusieurs boutons primaires (Sauvegarder, Créer accès démo, Charger un
  cours).
- **Réussi si** : l'accueil lui montre ce qui est ouvert, à corriger et à préparer.

## Hélène, autrice d'exercices

- **Qui** : enseignante, écrit des exercices pour l'équipe dans l'éditeur ou le builder, gère leur
  statut (brouillon, prêt, non testé...).
- **Objectif** : retrouver un exercice, éditer et prévisualiser en boucle courte, savoir lesquels
  sont fiables.
- **Freins** : la page d'un exercice aligne dix cartes de statistiques de même poids. Sur un cercle,
  la légende de l'anneau des statuts affiche « (0%) » partout. Une prévisualisation qui ne répond pas
  charge sans fin (aucun délai côté client).
- **Réussi si** : trois indicateurs clairs, et un message qui distingue une erreur d'exercice d'une
  panne.

## Julien, doctorant correcteur

- **Qui** : corrige par lots les copies qu'on lui assigne, souvent le soir.
- **Objectif** : voir sa file par activité, corriger vite, savoir quand il a fini.
- **Freins** : sans correction assignée, l'onglet « Corrections en attente » est vide, sans message.
  **À vérifier** : la navigation au clavier dans l'écran de correction.
- **Réussi si** : un compteur « reste N copies » et un état vide explicite.

## Mariam, candidate à un test d'entrée

- **Qui** : reçoit une invitation par courriel, passe un test chronométré une seule fois.
- **Objectif** : connaître les règles avant, passer le test sans doute technique, savoir que tout est
  enregistré.
- **Aujourd'hui** : les règles de sécurité (fin si perte du focus ou changement de page) sont listées
  avant le début. **À vérifier** : le parcours complet invitation, conditions, test, fin, sur mobile.
- **Réussi si** : elle termine sans surprise et voit une confirmation claire.

## Sophie, administratrice

- **Qui** : ingénieure pédagogique. Gère comptes, groupes, LMS, CAS, tags et annonces.
- **Objectif** : trouver un compte et changer son rôle, vérifier une connexion LMS, annoncer une
  nouveauté.
- **Freins** : un cadre rouge entoure l'écran dès qu'elle est connectée. La liste des utilisateurs
  mélange français et anglais (« Status », « Active »). Créer un compte « Élève » crée un enseignant.
- **Réussi si** : le mode admin est signalé sans alarme, les rôles sont justes.

## Le visiteur de démonstration

Un collègue ouvre le lien démo d'un cours. La plateforme crée un compte au rôle `demo` et l'inscrit
comme élève du cours. Son accueil est vide : le tableau de bord ne charge les statistiques que pour le
rôle `student`, et les modèles que pour `teacher` et `admin`.

## Ce que les personas imposent

- **Deux accueils** : l'étudiant vient agir (à faire, à reprendre), l'enseignant piloter (ouvert, à
  corriger, à préparer). Les chiffres viennent après.
- **Des états honnêtes** : une erreur ne s'affiche jamais comme un contenu vide, un chargement a une
  fin.
- **La confiance aux moments à enjeu** (examen, test, correction) : règles avant, enregistrement
  confirmé pendant, conclusion claire après.
