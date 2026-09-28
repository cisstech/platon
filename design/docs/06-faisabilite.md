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
| « 251 sur 302 ont commencé » | existant | `DashboardService.ofActivity` et `result-by-members` donnent les sessions par membre ; le compte est un agrégat de la même requête |
| Moyenne provisoire | existant | `ofActivity` calcule la moyenne |
| « À corriger » avec le reste | existant | `/corrections/pendings`, `CorrectionStatus.pending` et `available`, groupés par activité |
| « À préparer » : sans dates, planifiées | agrégation | `openAt`, `closeAt` nuls ou `state === 'planned'` sur la même liste |
| « Programmer » vers les dates | existant | Le panneau de paramètres de l'activité (`activity-settings`) |
| Mes cours avec effectifs | existant | `CourseStatistic.studentCount`, `teacherCount` |
| Ressources récentes avec statut | existant | Filtre « vu récemment » des ressources et `ResourceStatus` |
| Accueil vide en trois étapes | existant | Les trois actions existent ; l'ordre est une règle d'écran |
| Sélecteur de modèles retiré de l'accueil | existant | Il est déjà utilisé dans `/resources/create` (étape Template) |

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
