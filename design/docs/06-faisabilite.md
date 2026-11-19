# Faisabilité

Chaque élément des maquettes, rapporté au code au 28 septembre 2026.

Niveaux : **existant** (seul l'écran est à faire), **agrégation** (données présentes, il manque une
requête, pas de migration), **réorganisation** (même donnée, autre découpage), **proposition**
(champ, migration ou décision produit), **n'existe pas** (écarté), **retrait**, **correction** (bug).

## Cadre et navigation

| Élément                                                 | Niveau         | Ce qui existe                                                                  |
| ------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------ |
| Navigation par rôle                                     | existant       | `UserRoles`, `isTeacherRole` ; la barre latérale filtre déjà                   |
| Compteur « Corrections »                                | agrégation     | `GET results/corrections` renvoie une liste, pas un compte                     |
| Menu Créer                                              | existant       | Cours, cercle (admin), activité, exercice                                      |
| « Ressources » au lieu d'« Espace de travail »          | existant       | Un libellé                                                                     |
| Notifications, tout marquer comme lu, clic vers l'objet | existant       | `ListNotifications`, `MarkAllAsRead`, `course-notification-parser.provider.ts` |
| Menu profil : compte, cercle, thème, déconnexion        | réorganisation | Menu compte actuel plus le menu thème de la barre                              |
| Mention « Administrateur »                              | existant       | `user.role`                                                                    |
| Cadre rouge admin                                       | retrait        | `app.page.html`                                                                |
| Nom de l'établissement                                  | proposition    | Pas de configuration ; une variable d'environnement suffit                     |
| Bandeau d'annonce, historique                           | existant       | `Announcement` (`active`, `targetedRoles`, `displayUntil`), `/announcements`   |
| « Tests d'entrée » masqué si aucun test                 | agrégation     | Filtre `isTest` sur les cours                                                  |

## Accueil étudiant

| Élément                                          | Niveau     | Ce qui existe                                                                                                          |
| ------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| « À faire » et « Bientôt », tous cours confondus | agrégation | `GET activities/mine` (A-04) : les activités de tous ses cours, dates propres, avancement en exercices, en une requête |
| Avancement, Commencer ou Reprendre               | existant   | `exercisesDone` sur `exerciseCount`, `started`, `terminated` (A-04)                                                    |
| Échéance relative                                | existant   | `closeAt`, `upcomingTime` du design system (A-01) ; une activité ferme à son échéance, rien n'est « en retard »        |
| « Notée », durée, tentatives                     | existant   | `graded`, `duration`, `attempts` d'`activities/mine` (A-04)                                                            |
| Résultats récents                                | existant   | `GET results/recent` (A-04) : les trois dernières copies, notées, en correction ou cachées                             |
| Progression globale                              | existant   | `GET results/dashboard`                                                                                                |
| Mes cours avec avancement                        | existant   | `GET courses` pour la liste, la somme d'`activities/mine` par cours pour l'avancement (A-01)                           |
| Couleur du cours                                 | existant   | `courseHue`, dérivée de l'identifiant du cours (D32)                                                                   |
| Accueil du rôle démo                             | existant   | L'accueil de l'élève dans la nouvelle interface (A-01) ; l'interface actuelle reste vide (B5)                          |

## Accueil enseignant

| Élément                               | Niveau     | Ce qui existe                                                                           |
| ------------------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| « En cours », « À faire »             | agrégation | `GET activities/taught` (A-04), toutes les activités des cours où il enseigne           |
| Participation et moyenne par activité | agrégation | `GET activities/taught` (A-04), en une requête                                          |
| Copies à corriger                     | existant   | `GET results/corrections/summary`, avec `submittedCopies` et `lastSubmittedAt` (A-04)   |
| Mes cours avec effectifs              | existant   | `GET courses?expands=statistic` : `CourseStatistic.studentCount`, `teacherCount`        |
| Vu récemment                          | existant   | Recherche `views: true`, avec `viewedAt` (A-04)                                         |
| Partir d'un modèle                    | existant   | `/templates` dans l'interface actuelle (D38), qui reprend `resource-template-selection` |
| Copies confiées à un autre correcteur | à créer    | Aucune route ; reporté à la file de correction (L-04, D38)                              |

## Connexion

| Élément                             | Niveau         | Ce qui existe                                                                      |
| ----------------------------------- | -------------- | ---------------------------------------------------------------------------------- |
| Boutons CAS, mot de passe local     | existant       | `GET cas/casnames`, `POST auth/signin`                                             |
| Retour vers une application externe | existant       | `callbackUrl`                                                                      |
| Vidéo en lien                       | réorganisation | L'iframe devient un lien                                                           |
| Mot de passe oublié                 | proposition    | Seul le changement connecté existe (`resetPassword`) ; `libs/feature/email` existe |

## Corrections

| Élément                         | Niveau      | Ce qui existe                                                    |
| ------------------------------- | ----------- | ---------------------------------------------------------------- |
| File par activité avec le reste | existant    | `correctedExercises` / `totalExercises`                          |
| Copies, étiquettes, annotations | existant    | `player-correction`, `Label` (`gradeChange`), `player-comments`  |
| Raccourcis clavier              | proposition | Côté client                                                      |
| État vide                       | correction  | Message jamais affiché (`correction-table`, pas de `ng-content`) |

## Ressources

| Élément                                       | Niveau     | Ce qui existe                                                       |
| --------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| Recherche, filtres, pastilles                 | existant   | `ResourceFilters`, `ui-filter-indicators`                           |
| Nombre de résultats sur « Afficher »          | agrégation | Une recherche de plus, `total` dans la réponse                      |
| Arbre des cercles                             | existant   | `resource-circle-tree`                                              |
| Note, tentatives, « utilisé par N activités » | existant   | `statistic.exercise` (`averageScore`, `attemptCount`, `references`) |
| Auteur sur la ligne                           | agrégation | `ownerId`                                                           |
| Chiffres de la page ressource, événements     | existant   | `results/dashboard/resources/:id`, `ResourceEventTypes`             |
| Onglets de la ressource                       | existant   | Vue d'ensemble, Explorer, Évènements, Paramètres                    |
| Type codé trois fois                          | retrait    | Une icône suffit                                                    |
| Anneau des statuts à « (0%) »                 | correction | `buildStatusChart`                                                  |

## Création d'un exercice

| Élément                                        | Niveau         | Ce qui existe                                                                               |
| ---------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------- |
| Galerie des modèles                            | existant       | `resource-template-selection`, `certifiedTemplate`                                          |
| Modèle vers brouillon vers atelier             | existant       | `createQuickResource`, `/builder/:id`                                                       |
| Supprimer un brouillon jamais enregistré       | existant       | `canDeactivate` (`createdAt === updatedAt`)                                                 |
| Ajouter l'exercice à un cours depuis l'atelier | proposition    | `POST /resources` accepte des fichiers, puis création de l'activité ; aucun nouvel endpoint |
| Un formulaire au lieu de six étapes            | réorganisation | Mêmes champs, même appel                                                                    |

## Activité

| Élément                             | Niveau         | Ce qui existe                                                           |
| ----------------------------------- | -------------- | ----------------------------------------------------------------------- |
| Fonction choisie à l'ajout          | existant       | `isChallenge` ; Notée = `activitySettings` + `code`                     |
| Changer la fonction ensuite         | n'existe pas   | `isChallenge` absent de `UpdateActivity`                                |
| Panneau de réglages                 | existant       | Onglets Restrictions, Paramètres, Gestion                               |
| Suivi en trois onglets              | réorganisation | Réunit `/activities/:courseId/:activityId` et `/activities/monitor/...` |
| Code de déblocage en fin d'activité | correction     | Affiché même sans code                                                  |

## Tests d'entrée

| Élément                           | Niveau      | Ce qui existe                                       |
| --------------------------------- | ----------- | --------------------------------------------------- |
| Candidats, import CSV, conditions | existant    | `TestsCandidates`, `csv-import`, `/candidate/terms` |
| État par candidat                 | agrégation  | Sessions de l'activité du test                      |
| Invitation envoyée ou non         | proposition | Un `invitedAt` sur `TestsCandidates`                |
| Accès réservé aux enseignants     | correction  | Routes `/tests` sans garde                          |

## Cours

| Élément                                          | Niveau         | Ce qui existe                                                                                        |
| ------------------------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------- |
| Recherche, archivés, tri, tous les cours (admin) | existant       | `CourseFilters`, `showAll`                                                                           |
| Carte : effectifs, activités, avancement         | existant       | `CourseStatistic`                                                                                    |
| Archiver pour soi                                | existant       | `archiveMember`                                                                                      |
| Onglets du cours                                 | existant       | Vue d'ensemble, Challenges, Membres, Groupes, Paramètres                                             |
| Filtre d'état unique en tête                     | réorganisation | Existe dans chaque section (`activity-grid`, dans la boucle des sections) ; remonté une fois en tête |
| Résultats du cours                               | n'existe pas   | Aucun endpoint                                                                                       |
| Podium                                           | réorganisation | `results/leaderboard/courses/:id`                                                                    |
| Membres par rôle                                 | existant       | Routes `teachers`, `students`                                                                        |

## Administration et compte

| Élément                                | Niveau     | Ce qui existe                                   |
| -------------------------------------- | ---------- | ----------------------------------------------- |
| Onglets admin                          | existant   | Utilisateurs, Groupes, LMS, CAS, Tags, Annonces |
| Ajout d'un compte, mot de passe généré | existant   | `generatePassword`                              |
| Rôle « Élève »                         | correction | Enregistre `teacher` (`users.page.ts`)          |
| Mon compte                             | existant   | À propos, Sécurité                              |
| « Ma progression »                     | retrait    | N'existe pas dans l'app                         |

## Ce qui touche le modèle

1. Les données des accueils (A-04) : `activities/mine`, `activities/taught`, `results/recent`.
2. Teinte par cours : dérivée de l'id, puis `Course.colorHue` si besoin.
3. Nom de l'établissement en configuration.
4. `invitedAt` sur `TestsCandidates`.
5. Plus tard : mot de passe oublié par courriel.
