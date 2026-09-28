# Faisabilité

Chaque élément des maquettes, rapporté au code au 28 septembre 2026.

Niveaux : **existant** (seul l'écran est à faire), **agrégation** (données présentes, il manque une
requête, pas de migration), **réorganisation** (même donnée, autre découpage), **proposition**
(champ, migration ou décision produit), **n'existe pas** (écarté), **retrait**, **correction** (bug).

## Cadre et navigation

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Navigation par rôle | existant | `UserRoles`, `isTeacherRole` ; la barre latérale filtre déjà |
| Compteur « Corrections » | agrégation | `GET results/corrections` renvoie une liste, pas un compte |
| Menu Créer | existant | Cours, cercle (admin), activité, exercice |
| « Ressources » au lieu d'« Espace de travail » | existant | Un libellé |
| Notifications, tout marquer comme lu, clic vers l'objet | existant | `ListNotifications`, `MarkAllAsRead`, `course-notification-parser.provider.ts` |
| Menu profil : compte, cercle, thème, déconnexion | réorganisation | Menu compte actuel plus le menu thème de la barre |
| Mention « Administrateur » | existant | `user.role` |
| Cadre rouge admin | retrait | `app.page.html` |
| Nom de l'établissement | proposition | Pas de configuration ; une variable d'environnement suffit |
| Bandeau d'annonce, historique | existant | `Announcement` (`active`, `targetedRoles`, `displayUntil`), `/announcements` |
| « Tests d'entrée » masqué si aucun test | agrégation | Filtre `isTest` sur les cours |

## Accueil étudiant

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| « À faire » et « Bientôt », tous cours confondus | agrégation | `GET courses/:id/activities` par cours (`openAt`, `closeAt`, `state`, `progression`, `exerciseCount`) ; un `activities/mine` sur `ActivityMemberView` |
| Avancement, Commencer ou Reprendre | existant | `progression`, `navigation.started`, `navigation.terminated` |
| Échéance relative, en retard | existant | `closeAt`, calcul client |
| « Notée », durée, tentatives | existant | `activitySettings.duration`, `actions.retry` |
| Résultats récents, exercices à revoir | agrégation | Résultats par session (`results/session/:id`) ; rien ne liste les sessions récentes |
| Progression globale | existant | `GET results/dashboard` |
| Mes cours avec avancement | existant | `CourseStatistic.progression` (utilisateur connecté) |
| Couleur du cours | proposition | `colorHue` existe sur `Activity`, pas sur `Course` ; dériver de l'id d'abord |
| Accueil du rôle démo | correction | Vide aujourd'hui (`overview.presenter.ts`) |

## Accueil enseignant

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| « En cours », « À préparer » | agrégation | Même `activities/mine`, filtré sur `CourseMemberRoles.teacher` |
| Participation et moyenne par activité | agrégation | `GET results/dashboard/activities/:id`, un appel par activité |
| « À corriger » | existant | `GET results/corrections`, `CorrectionStatus` |
| Mes cours avec effectifs | existant | `CourseStatistic.studentCount`, `teacherCount` |
| Ressources récentes | existant | Recherche `views: true` |
| Partir d'un modèle | existant | `resource-template-selection` |

## Connexion

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Boutons CAS, mot de passe local | existant | `GET cas/casnames`, `POST auth/signin` |
| Retour vers une application externe | existant | `callbackUrl` |
| Vidéo en lien | réorganisation | L'iframe devient un lien |
| Mot de passe oublié | proposition | Seul le changement connecté existe (`resetPassword`) ; `libs/feature/email` existe |

## Corrections

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| File par activité avec le reste | existant | `correctedExercises` / `totalExercises` |
| Copies, étiquettes, annotations | existant | `player-correction`, `Label` (`gradeChange`), `player-comments` |
| Raccourcis clavier | proposition | Côté client |
| État vide | correction | Message jamais affiché (`correction-table`, pas de `ng-content`) |

## Ressources

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Recherche, filtres, pastilles | existant | `ResourceFilters`, `ui-filter-indicators` |
| Nombre de résultats sur « Afficher » | agrégation | Une recherche de plus, `total` dans la réponse |
| Arbre des cercles | existant | `resource-circle-tree` |
| Note, tentatives, « utilisé par N activités » | existant | `statistic.exercise` (`averageScore`, `attemptCount`, `references`) |
| Auteur sur la ligne | agrégation | `ownerId` |
| Chiffres de la page ressource, événements | existant | `results/dashboard/resources/:id`, `ResourceEventTypes` |
| Onglets de la ressource | existant | Vue d'ensemble, Explorer, Évènements, Paramètres |
| Type codé trois fois | retrait | Une icône suffit |
| Anneau des statuts à « (0%) » | correction | `buildStatusChart` |

## Création d'un exercice

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Galerie des modèles | existant | `resource-template-selection`, `certifiedTemplate` |
| Modèle vers brouillon vers atelier | existant | `createQuickResource`, `/builder/:id` |
| Supprimer un brouillon jamais enregistré | existant | `canDeactivate` (`createdAt === updatedAt`) |
| Ajouter l'exercice à un cours depuis l'atelier | proposition | `POST /resources` accepte des fichiers, puis création de l'activité ; aucun nouvel endpoint |
| Un formulaire au lieu de six étapes | réorganisation | Mêmes champs, même appel |

## Activité

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Fonction choisie à l'ajout | existant | `isChallenge` ; Notée = `activitySettings` + `code` |
| Changer la fonction ensuite | n'existe pas | `isChallenge` absent de `UpdateActivity` |
| Panneau de réglages | existant | Onglets Restrictions, Paramètres, Gestion |
| Suivi en trois onglets | réorganisation | Réunit `/activities/:courseId/:activityId` et `/activities/monitor/...` |
| Code de déblocage en fin d'activité | correction | Affiché même sans code |

## Tests d'entrée

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Candidats, import CSV, conditions | existant | `TestsCandidates`, `csv-import`, `/candidate/terms` |
| État par candidat | agrégation | Sessions de l'activité du test |
| Invitation envoyée ou non | proposition | Un `invitedAt` sur `TestsCandidates` |
| Accès réservé aux enseignants | correction | Routes `/tests` sans garde |

## Cours

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Recherche, archivés, tri, tous les cours (admin) | existant | `CourseFilters`, `showAll` |
| Carte : effectifs, activités, avancement | existant | `CourseStatistic` |
| Archiver pour soi | existant | `archiveMember` |
| Onglets du cours | existant | Vue d'ensemble, Challenges, Membres, Groupes, Paramètres |
| Filtre d'état unique en tête | réorganisation | Existe dans chaque section (`activity-grid`, dans la boucle des sections) ; remonté une fois en tête |
| Résultats du cours | n'existe pas | Aucun endpoint |
| Podium | réorganisation | `results/leaderboard/courses/:id` |
| Membres par rôle | existant | Routes `teachers`, `students` |

## Administration et compte

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Onglets admin | existant | Utilisateurs, Groupes, LMS, CAS, Tags, Annonces |
| Ajout d'un compte, mot de passe généré | existant | `generatePassword` |
| Rôle « Élève » | correction | Enregistre `teacher` (`users.page.ts`) |
| Mon compte | existant | À propos, Sécurité |
| « Ma progression » | retrait | N'existe pas dans l'app |

## Ce qui touche le modèle

1. `activities/mine` : seul prérequis des deux accueils.
2. Teinte par cours : dérivée de l'id, puis `Course.colorHue` si besoin.
3. Nom de l'établissement en configuration.
4. `invitedAt` sur `TestsCandidates`.
5. Plus tard : mot de passe oublié par courriel.
