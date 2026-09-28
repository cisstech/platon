# Faisabilité : ce que chaque écran demande au modèle

Chaque élément des maquettes est rapporté à ce qui existe dans le code de PLaTon au 28 septembre
2026. Trois niveaux :

- **existant** : la donnée et le point d'accès sont là, il n'y a que l'écran à faire ;
- **agrégation** : les données existent, il manque un point d'accès qui les rassemble (une requête,
  pas de migration) ;
- **proposition** : demande un champ ou une table, avec une migration, ou une décision produit.

## Cadre et navigation

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Navigation par rôle | existant | `UserRoles` (admin, teacher, student, demo, candidate) et `isTeacherRole` ; la barre latérale filtre déjà par rôle |
| Compteur « Corrections » | existant | `/corrections/pendings` liste les corrections assignées ; il manque un compte, une ligne dans le service |
| Bouton Créer et son menu | existant | Les quatre créations existent (`/courses/create`, `/activities/create`, `/resources/create?type=EXERCISE\|CIRCLE`) ; Cercle réservé aux administrateurs, comme `canUserCreateResource` |
| « Ressources » à la place d'« Espace de travail » | existant | Un libellé |
| Notifications avec compteur | existant | GraphQL `ListNotifications`, `OnChangeNotifications`, lu et non lu |
| Menu du profil (compte, progression, thème, déconnexion) | existant | `/account`, `ThemeService` (clair, sombre, système), `signOut` ; « Ma progression » est l'écran de statistiques actuel |
| Mention « Administrateur » dans le menu | existant | `user.role` |
| Nom de l'établissement sous le logo | proposition | Aucune configuration d'établissement dans le modèle ; une variable d'environnement suffit |
| Annonces : bandeau sur l'accueil, historique | existant | `Announcement` avec `active`, `targetedRoles`, `displayUntil` ; la page `/announcements` reste pour l'historique |
| « Tests d'entrée » masqué quand l'enseignant n'en a aucun | agrégation | `courses?isTest=true` : un compte |

## Accueil étudiant

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| « À faire » : activités ouvertes de tous les cours, triées par échéance | agrégation | Les activités sont listées par cours (`GET courses/:id/activities`) avec `openAt`, `closeAt`, `state` (`opened`, `closed`, `planned`), `progression`, `exerciseCount`. La vue `ActivityMemberView` relie déjà un utilisateur à ses activités : un point d'accès `activities/mine` s'écrit dessus |
| Avancement « 5 sur 6 » | existant | `activity.progression` (pour cent) et `exerciseCount` |
| Bouton Commencer, Reprendre, Voir mes résultats | existant | `navigation.started` et `terminated` dans `ActivityPlayer`, `progression` |
| Échéance relative, marquage à moins de 24 h et en retard | existant | `closeAt` ; le calcul est côté client |
| « Notée », durée, nombre de tentatives | existant | Fonction de l'activité (`isChallenge`, notée), `activitySettings.duration`, tentatives |
| « Bientôt » | agrégation | Même liste, `state === 'planned'` |
| « Résultats récents » avec note et lien de correction | existant | Sessions et `Answers` avec la note ; `CorrectionStatus.available` pour le lien |
| « 3 exercices à revoir » | existant | États de réponse `FAILED`, `PART_SUCC` par session |
| Progression (moyenne, réussite, temps) | existant | `DashboardService.ofUser` calcule déjà taux de réussite, note moyenne, temps |
| Mes cours avec avancement par activités | existant | `CourseStatistic.progression` ; le « 5 sur 8 » demande le compte d'activités terminées, présent dans les sessions |
| Couleur du cours | proposition | `Activity.colorHue` existe (avec `GET activities/colors`), pas `Course.colorHue`. Deux options : dériver la teinte du cours de son identifiant (aucune migration, déterministe, pas de choix possible) ou ajouter `colorHue` au cours (une migration, réglable dans les paramètres). Recommandation : dériver maintenant, ajouter le champ quand des enseignants demanderont à choisir |
| Accueil vide | existant | `CourseMember` vide |

## Accueil enseignant

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| « En cours » : activités ouvertes de ses cours | agrégation | Même point d'accès `activities/mine`, filtré sur les cours où il est enseignant (`CourseMemberRoles.teacher`) |
| « 251 sur 302 ont commencé » | agrégation | `DashboardService.ofActivity` par activité ouverte : un appel chacune, à mettre dans `activities/mine` si la liste grossit |
| Moyenne provisoire | agrégation | Même appel `ofActivity` |
| « À corriger » avec le reste | existant | `/corrections/pendings`, `CorrectionStatus.pending` et `available`, groupés par activité |
| « À préparer » : sans dates, planifiées | agrégation | `openAt`, `closeAt` nuls ou `state === 'planned'` sur la même liste |
| « Programmer » vers les dates | existant | Le panneau de paramètres de l'activité (`activity-settings`) |
| Mes cours avec effectifs | existant | `CourseStatistic.studentCount`, `teacherCount` |
| Ressources récentes avec statut | existant | Filtre « vu récemment » des ressources et `ResourceStatus` |
| Accueil vide en trois étapes | existant | Les trois actions existent ; l'ordre est une règle d'écran |
| Bloc Partir d'un modèle | existant | `resource-template-selection`, réduit à trois modèles et un lien vers la galerie |

## Connexion

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Bouton par établissement CAS | existant | `GET cas/casnames`, puis `cas/login/:casname` ; c'est ce que fait `cas-sign-in` |
| Mot de passe local | existant | `POST auth/signin` |
| Erreur sans désigner le champ | existant | Le serveur renvoie une seule erreur |
| Présentation en lien | existant | L'URL de la vidéo est déjà là ; elle devient un lien vers une page ou une fenêtre |
| Connexion depuis une application externe | existant | `callbackUrl`, à garder comme étape supplémentaire |
| Étape « lien Moodle » dans le texte | existant | LTI connecte sans écran |
| Mot de passe oublié | proposition | Il n'y a pas de réinitialisation par courriel dans le modèle ; le service de courriel existe (`feature/email`). Tant qu'il n'est pas branché, le lien renvoie vers l'administration |

## Cadre : surcouches

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Panneau de notifications, tout marquer comme lu | existant | Mutations `MarkAllAsRead`, `DeleteAllNotifications` |
| Clic sur une notification vers l'objet | existant | `course-notification-parser` navigue déjà vers le lecteur ou la correction |
| Thème dans le menu du profil | existant | `ThemeService` |

## Ce que les maquettes ne demandent pas

- Aucune recherche globale (elle reste une idée pour plus tard).
- Aucun nouveau type d'objet : cours, section, activité, exercice, cercle, correction, test,
  candidat, annonce, notification existent tous.
- Aucune réécriture du lecteur : les écrans du lecteur viendront dans le flow `lecteur`, sur les
  composants `player-*` existants.

## Résumé des propositions qui touchent le modèle

1. Un point d'accès `activities/mine` (agrégation sur `ActivityMemberView`), utilisé par les deux
   accueils. C'est le seul prérequis technique des accueils.
2. Une teinte par cours : dérivée de l'identifiant pour commencer, champ `colorHue` sur `Course`
   plus tard.
3. Le nom de l'établissement en configuration.
4. La réinitialisation de mot de passe par courriel, un jour, sur le service de courriel existant.

## Corrections

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| File par épreuve avec le reste | existant | `/corrections/pendings` et `availables`, `CorrectionStatus` |
| Liste des copies de l'épreuve | existant | Le lecteur de correction (`player-correction`) charge déjà les copies par exercice et par utilisateur |
| Note automatique et étiquettes | existant | `Label` (nom, couleur, `gradeChange`) et `CorrectionLabel` relient une étiquette à une réponse |
| Raccourcis 1 à 9, J et K | proposition | Côté client uniquement |
| Annotation sur la réponse | existant | Commentaires sur les réponses (`player-comments`) |

## Ressources

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Recherche, suggestions, type, tri et sens | existant | `ResourceFilters` (`search`, `types`, `order`, `direction`), suggestions Fuse sur la complétion |
| Panneau Filtres : statut, modèles, cercles, auteur, topics avec et sans, niveaux, période | existant | `status`, `configurable`, `parents`, `owners`, `topics`, `antiTopics`, `levels`, `period` |
| Pastilles de filtres retirables | existant | `ui-filter-indicators` et `resource-filters.matchers.ts` |
| Nombre de résultats sur le bouton Afficher | agrégation | Une recherche avec `limit: 0`, le total est dans la réponse |
| Arbre des cercles | existant | `resource-circle-tree` en mode navigation |
| Note moyenne et tentatives sur la ligne | existant | `statistic.exercise` ou `statistic.activity` (`averageScore`, `attemptCount`) |
| Utilisé par N activités, et le listing | existant | `statistic.exercise.references`, filtre `dependOn` |
| Badge Modèle et variables à remplir | existant | `metadata.configurable`, `metadata.config.inputs` |
| Actions Prévisualiser, Éditer ou Paramétrer, Créer à partir, Dupliquer | existant | `resource-item` |
| Auteur sur la ligne | agrégation | `ownerId`, utilisateurs déjà chargés pour le filtre Auteur |
| Mon espace, Vu récemment | existant | Cercle personnel, recherche `views: true` |
| Trois chiffres de la page ressource | existant | `DashboardService.ofResource` (note moyenne, réussite du premier coup, durée moyenne) |
| Derniers événements | existant | `ResourceEventTypes` (création, statut, membres) et versions avec message |
| Retiré : ruban, bordure et icône qui codent le type trois fois | retrait | Une icône suffit ; le statut garde icône et mot |

## Création d'un exercice

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Galerie des modèles certifiés, image, gif, compteurs, aperçu | existant | `resource-template-selection`, `certifiedTemplate`, `references.template`, `referencesAttemptCount` |
| Modèles des cercles de l'enseignant | existant | Recherche `configurable` sur le cercle et ses parents, faite par l'assistant |
| Recherche dans la galerie | proposition | Filtrage côté client |
| Choisir un modèle crée le brouillon et ouvre l'atelier | existant | `createQuickResource`, cercle personnel, `/builder/:id` |
| Atelier : variables, éditeur, aperçu | existant | Builder, `main.plc` (entrées), `main.plo` (valeurs), 11 types d'entrée |
| Nommer au premier enregistrement | existant | Redirection vers les informations si nom par défaut et brouillon ; ici en dialogue |
| Supprimer l'exercice jamais enregistré en quittant | existant | Garde `canDeactivate` et suppression si `createdAt === updatedAt` |
| Ajouter l'exercice à un cours depuis l'atelier | proposition, côté client | `POST /resources` accepte `files` : ressource activité avec un `main.pla` à un groupe, puis `createActivities`. Aucun endpoint nouveau |
| Formulaire unique à la place de l'assistant en six étapes | proposition | Côté client, mêmes champs et même appel |

## Activité

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Choisir une ou plusieurs activités dans une recherche filtrée | existant | Étape Activité de `/activities/create`, `types: ['ACTIVITY']` |
| Fonction Entraînement, Notée, Challenge à l'ajout | existant | `isChallenge` ; Notée = `activitySettings` (durée, tentatives, sécurité), `code`, correcteurs |
| Fonction modifiable ensuite | n'existe pas | `isChallenge` absent de `UpdateActivity` ; le panneau l'affiche en lecture seule |
| Panneau Accès, Déroulement, Gestion | existant | `activity-settings` : périodes et règles, paramètres, couleur, fermer, rouvrir, recharger, supprimer |
| Code de déblocage | existant | Page Suivi de l'activité (modération) ; ici dans l'onglet Modération du suivi |
| Suivi : réussite, note, durée, par exercice | existant | `DashboardService.ofActivity`, `ActivityExerciseResults` |
| Suivi en trois onglets (Statistiques, Apprenants, Modération) | réorganisation | Réunit `/activities/:course/:activity` et `/activities/monitor/...` |

## Tests d'entrée

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Candidats, ajout, import CSV | existant | `TestsCandidates`, page `csv-import` |
| État pas commencé, en cours, terminé | agrégation | Sessions de l'activité du test, par candidat |
| État de l'invitation (envoyée ou non) | proposition | Aucun champ ne garde l'envoi ; un `invitedAt` sur `TestsCandidates` |
| Page candidat avec conditions et acceptation | existant | `/candidate/terms`, `Test.terms` |

## Cours

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Recherche, Actuels et Archivés, tri, période | existant | `CourseFilters` (`search`, `archived`, `order`, `direction`, `period`) |
| Tous les cours de la plateforme | existant | `showAll`, admin seulement |
| Classeur : effectifs, activités, mise à jour, challenges | existant | `CourseStatistic` (`teacherCount`, `studentCount`, `activityCount`, `challengeCount`), `updatedAt` |
| Avancement sur le classeur | existant | `statistic.progression`, propre à la personne connectée |
| Teinte du cours | proposition | Pas de `colorHue` sur `Course` ; dérivée de l'id en attendant |
| Archiver pour soi | existant | `archiveMember` (archivage de l'appartenance) |
| Onglets Vue d'ensemble, Challenges, Membres, Groupes, Paramètres | existant | `course.routes.ts` |
| Filtre d'état unique en tête | réorganisation | Aujourd'hui répété dans chaque section |
| Résultats au niveau du cours | n'existe pas | Aucun endpoint ; pas d'onglet Résultats |
| Podium du classement | réorganisation | Même donnée (`leaderboard/courses/:id`) |
| Membres filtrés Enseignants ou Élèves | existant | Routes `teachers` et `students`, sans onglet aujourd'hui |
| Accès démo, reprendre un cours, supprimer | existant | Onglet Paramètres |

## Administration et compte

| Élément | Niveau | Ce qui existe |
| --- | --- | --- |
| Utilisateurs, Groupes, LMS, CAS, Tags, Annonces | existant | `admin.routes.ts` |
| Ajout d'un compte avec mot de passe généré | existant | À corriger : Élève crée un compte enseignant (`users.page.ts`) |
| Mon compte : À propos, Sécurité | existant | `account.routes.ts` |
| Annonces dans la navigation, fenêtre à la connexion | existant | `/announcements`, `checkForAnnouncements` |
| Retiré : « Ma progression » du menu profil | correction | N'existait pas, je l'avais inventé |
