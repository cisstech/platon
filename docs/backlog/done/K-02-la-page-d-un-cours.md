# K-02 : La page d'un cours, sa vue d'ensemble

Source : `design/flows/cours` (`04-detail` bureau, étudiant, vide, erreur ; téléphone étudiant et
erreur ; `06-activite-actions` ; `07-partager`) et ses annotations ; `design/spec/flows/cours.md` ;
inventaire du code du 2026-10-13 ; décisions : D17, D20, D32, D38, D39, D40, D43, D44.
Statut : Livré (2026-10-13), sur la branche `feat/course-page`.
Dépend de : K-01, A-04.
Taille : L.

## 1. Comportement attendu

- Étant donné une personne de la nouvelle interface, quand elle ouvre un cours (son classeur, un
  accueil, une notification, un lien de partage ou LTI), alors `/courses/:id` s'ouvre sans
  rechargement : l'en-tête du cours, ses onglets et sa vue d'ensemble. L'ancienne adresse
  `/courses/:id/dashboard` y mène aussi.
- Étant donné l'en-tête, alors il porte la marque du cours (son sigle, à sa teinte, D32), son nom et
  sa description.
  - Pour qui peut modifier le cours : les effectifs en toutes lettres (6 enseignants, 302 étudiants,
    9 activités), « créé le 1er septembre par Karim Haddad », Partager en secondaire et Ajouter une
    activité en principal.
  - Pour l'étudiant : « Karim Haddad, responsable, et 5 autres enseignants » et sa prochaine
    échéance (« Prochaine échéance ce soir à 23 h 59 »), sans effectifs ni action d'édition.
- Étant donné les onglets, alors Vue d'ensemble est celui de la page ; Challenges, avec son nombre,
  s'il y en a. Qui peut modifier le cours a aussi Membres (avec son nombre), Groupes et Paramètres ;
  l'étudiant n'a que Vue d'ensemble et Challenges. Les autres onglets s'ouvrent dans l'interface
  actuelle jusqu'à K-03 et K-04.
- Étant donné la barre de la vue d'ensemble, alors elle cherche dans le titre des activités et le nom
  des sections, en cachant les sections qui ne gardent rien, et filtre par état : Toutes, Ouvertes,
  Planifiées, Fermées.
- Étant donné les sections, alors elles suivent l'ordre que l'enseignant leur donne, en intercalaires
  (un onglet à la teinte du cours posé sur un filet de la même teinte), chacune avec son nom et ce
  qu'elle contient (« 3 activités ») ; ses activités suivent leur ordre.
- Étant donné une ligne d'activité, alors elle dit son état avec son glyphe (Planifiée `event`,
  Ouverte `event_available`, Fermée `event_busy`, En correction `pending`), ses dates en mots, son
  nombre d'exercices, et « Notée » avec ses limites (« 1 h 30, une tentative ») quand elle l'est.
  - Pour qui peut modifier le cours : la ligne entière ouvre le suivi de l'activité. Une activité
    ouverte sans dates dit « Ouverte, sans dates », en information neutre pour un entraînement, en
    attention pour une épreuve notée, avec Planifier ; une activité ouverte sans fermeture dit « Sans
    fermeture ». Son menu, qui la nomme, propose Régler l'activité, Tester l'activité et Ouvrir la
    ressource.
  - Pour l'étudiant : son avancement (« 5 sur 6 ») et Commencer, Reprendre ou Voir mes résultats ;
    « Sans échéance » pour une activité ouverte sans fermeture ; « Pas encore ouverte » pour une
    activité planifiée ; sa note (« 82 / 100 ») ou « Copie en correction » pour une épreuve notée
    rendue.
- Étant donné la colonne de droite, pour qui peut modifier le cours, alors elle s'appelle À faire, avec
  son nombre, et ne liste que des actions, chacune ouvrant l'endroit où agir :
  - les copies à corriger du cours entier, par épreuve, avec ses correcteurs (« 14 copies à corriger,
    Examen partiel 1, confiées à Julien Lefèvre ») ;
  - les activités à planifier (« TP 5 à planifier, Ouverte, sans dates. 23 étudiants l'ont déjà
    commencé. ») ;
  - ce qui ferme dans les 24 h (« Ferme ce soir, Quiz : complexité des algorithmes, 251 sur 302 ont
    commencé »).
    Rien à faire le dit.
- Étant donné la colonne de droite, pour l'étudiant, alors elle dit son avancement (58 %, la barre à
  la teinte du cours), son temps passé (« 9 h 40 passées »), « 34 exercices sur 59, 4 activités
  terminées sur 9 », puis À reprendre : l'activité qui lui reste et ferme le plus tôt, avec Reprendre.
- Étant donné un cours sans activité, alors qui peut le modifier lit « Votre cours est prêt, il ne
  manque que le contenu » et trois étapes (Ajouter une activité, Ajouter vos étudiants, Partager le
  lien), avec « Reprendre un cours » ; l'étudiant lit qu'aucune activité n'y est encore.
- Étant donné Partager, alors un panneau s'ouvre sous le bouton : Lien PLaTon ou Lien LTI, le champ du
  lien avec son libellé, et Copier le lien, qui le dit.
- Étant donné un téléphone, alors l'étudiant a son avancement, À faire (ses activités ouvertes par
  échéance), Bientôt, puis les sections en intercalaires qui se replient, chacun disant ce qu'il
  contient (« 3 activités, 2 à faire »), et Reprendre sous le pouce. L'enseignant a À faire, puis les
  sections qui se replient.
- Étant donné le chargement, alors des lignes squelettes, puis le message des 10 s et l'erreur avec
  Réessayer de `app-load-state`, jamais « Ce cours ne contient aucune section » (B2). Un cours qui
  n'existe pas, ou dont la personne n'est pas membre, le dit, avec un lien vers Cours.
- Étant donné l'API du cours, alors ses sections, ses membres et ses groupes ne se lisent que par ses
  membres et l'administrateur, et ne s'écrivent que par qui peut modifier le cours ; réordonner ses
  activités ne touche que les siennes.

## 2. Tests à écrire d'abord

- API, intégration :
  - les activités d'un cours pour qui l'enseigne : leurs dates propres, `restricted`, leur section et
    leur ordre, leurs nombres, leurs copies à corriger et leurs correcteurs ;
  - pour l'étudiant : ses dates, son avancement, sa note, la copie en correction, y compris dans un
    cours qu'il a archivé ;
  - pour l'administrateur qui n'en est pas membre : toutes les activités ;
  - `change-order` ignore les activités d'un autre cours.
- API, e2e :
  - `GET /courses/:id` avec le nom du responsable ;
  - les sections, les membres et les groupes d'un cours refusés (403) à qui n'en est pas membre, leurs
    écritures à qui ne peut pas modifier le cours ;
  - les activités du cours, pour l'enseignant et pour l'étudiant.
- Fonctions de vue :
  - le regroupement par section et par ordre ;
  - la recherche et le filtre d'état, qui cachent les sections vides ;
  - la ligne de l'enseignant (états, dates en mots, « Ouverte, sans dates » neutre ou en attention,
    Planifier, « Sans fermeture ») ;
  - la ligne de l'étudiant (actions, note, copie en correction, « Sans échéance », « Pas encore
    ouverte ») ;
  - À faire (copies, à planifier, ferme bientôt) et la colonne de l'étudiant (avancement, temps,
    À reprendre) ;
  - les lignes de l'en-tête (« responsable, et 5 autres enseignants », prochaine échéance) ;
  - les liens de partage.
- Store : le cours, ses sections et ses activités en parallèle, l'erreur et Réessayer, chaque visite
  repartant de zéro.
- Page : enseignant et étudiant, téléphone, cours sans activité, erreur, cours introuvable, recherche
  et filtre, copie du lien, le focus après le panneau Partager.
- Design system : chaque composant nouveau ou modifié a sa spec et ses stories en clair et en sombre,
  sans violation axe.
- `ported-paths` : `/courses/:id` et `/courses/:id/dashboard` sont portés, `/courses/:id/members` non.

## 3. État actuel du code

Vérifié le 2026-10-13.

- Page actuelle : `apps/web/src/app/pages/courses/course/` (`course.page.ts`, `course.presenter.ts`,
  `dashboard/`). `/courses/:id` mène à `/courses/:id/dashboard`. Le cadre charge
  `GET /courses/:id?expands=permissions,statistic`, puis `GET /courses/demo/:id`, pour l'étudiant
  aussi. La vue d'ensemble charge `GET /courses/:id/sections` et `GET /courses/:id/activities`, sans
  `catch` (B2), et regroupe par section à trois endroits.
- Elle ne distingue l'enseignant que par `permissions.update`. La colonne de droite montre les mêmes
  quatre chiffres à tous (avancement, temps, enseignants, étudiants) ; il n'y a pas d'À faire.
- `GET /courses/:id/activities` :
  - donne à l'enseignant ses dates de personne, pas celles de l'activité ;
  - calcule `permissions` par une requête par activité ;
  - charge toute la `source` ;
  - mesure l'avancement en points pondérés ;
  - envoie les `restrictions` aux étudiants ;
  - passe par `ActivityMemberView` (B32).
- `activities/mine` et `activities/taught` (A-04) font le même travail en une requête, avec les dates
  justes, mais sans section, sans ordre, et en écartant les cours archivés par la personne.
- Sections : `GET`, `POST`, `PATCH` et `DELETE` sous `/courses/:id/sections`, l'ordre géré par le
  serveur. Aucune vérification d'appartenance, ni en lecture ni en écriture (un `TODO` le dit) ; un
  nouveau cours a déjà « Section 1 ».
- `GET /courses/:id/members` et `GET /courseGroups/:id` ne vérifient rien : les membres d'un cours,
  avec leur adresse électronique et les membres de leurs groupes, se lisent par tout compte connecté.
- `PATCH /courses/:id/activities/change-order` vérifie le droit sur le cours, puis enregistre l'ordre
  de n'importe quels identifiants.
- `GET /courses/:id` ne donne pas le nom du responsable (K-01 ne le joint qu'à la recherche).
- Copies à corriger : `GET /corrections/summary` ne compte que la file de la personne. Les correcteurs
  d'une activité sont dans `ActivityCorrectors` ; les groupes qu'ils corrigent, dans ses périodes.
- Partage : `course-sharing` copie `/courses/:id` ou `/api/v1/lti/launch?next=/courses/:id`.
- Les autres pages du cours ont leur adresse : `challenges`, `members`, `groups`, `settings` sous
  `/courses/:id` ; le suivi `/activities/monitor/:courseId/:activityId` ; les statistiques
  `/activities/:courseId/:activityId` (où l'accueil envoie Planifier) ; l'ajout
  `/activities/create?course=` ; le lecteur `/player/activity/:id`. Le panneau de réglage est un
  tiroir de l'ancienne vue d'ensemble, sans adresse.
- Nouvelle interface : `PORTED_PATHS` ne connaît que des adresses exactes. Disponibles :
  - `pl-course-mark` et `monogram` (prévus pour cet en-tête) ;
  - `pl-page-header` (fente `plPageMark`, onglets `pl-page-tabs`) ;
  - `pl-activity-row` et `pl-activity-list` ;
  - `pl-progress`, `pl-menu`, `pl-tag`, `pl-empty` ;
  - les fonctions des accueils (`rowOf`, `todoRows`, `soonRows`, `limitsOf`) et `shared/due.ts`.

## 4. Changements

Contrats (`libs/feature/course/common`, additifs) :

- `PlayableActivity` gagne `sectionId`, `order`, `grade` et `correcting` (rendue, des exercices à
  corriger) ;
- `TaughtActivity` gagne `sectionId`, `order`, `exerciseCount`, `duration`, `attempts`, `resourceId`,
  `pendingCopies` et ses correcteurs.

API :

- `activities/mine?course=` et `activities/taught?course=`, toujours en une requête, avec ces champs.
  Pour un cours donné, les archives de la personne restent ; l'administrateur a toutes les
  activités.
- `GET /courses/:id` joint le nom du responsable.
- Sections, membres et groupes d'un cours : lecture par ses membres et l'administrateur, écriture par
  qui peut le modifier. `change-order` ne touche que les activités du cours.
- Une spec d'intégration pour chaque requête, une spec e2e pour ces droits.

Design system :

- l'intercalaire d'une section : son onglet et son filet à la teinte du cours, son nom, ce qu'elle
  contient, une fente pour son menu, et la variante qui se replie (téléphone) ;
- `pl-activity-row` : le glyphe de l'état, la ligne entière comme lien avec un bouton et un menu à
  part (enseignant).

Nouvelle interface (`pages/course/`), découpée comme les cours et les accueils :

- l'entrée : le store, l'en-tête, les onglets, l'état de chargement ;
- `data/` : l'API et le store ;
- `course.vm.ts` : regroupement, filtres, lignes, À faire, lignes de l'en-tête, liens ;
- `teacher/` et `student/`, une vue par rôle dans le cours ; `ui/` pour Partager, l'état du cours
  neuf et les colonnes ;
- les routes `courses/:id` et `courses/:id/dashboard`, et `PORTED_PATHS` qui apprend un segment
  `:param`.

## 5. Hors scope

- Organiser le cours (K-08, § 6.1) : ajouter, renommer, réordonner et supprimer les sections, l'ordre
  des activités, le nom et la description sur place, la vue Tableau, Exporter les notes.
- Membres et groupes (K-03), challenges et paramètres (K-04), le panneau de réglage (K-05), l'ajout
  d'une activité (K-06), le suivi (K-07) : leurs liens passent par le pont jusque-là.
- L'icône d'une activité selon sa forme (quiz, code) : rien ne dit la forme d'une activité ; les
  icônes restent celles des accueils.

## 6. Points ouverts

Aucun : tranchés le 2026-10-13 par D44, comme proposé. Pour mémoire, les questions étaient :

1. Le découpage. Proposé : K-02 montre le cours et permet d'agir sur ses activités, sans en changer
   la structure. Un nouveau K-08, « Organiser un cours », le suit aussitôt :

   - les sections : Ajouter, Renommer, Réordonner au clavier, Supprimer par un dialogue qui nomme
     ses activités ;
   - l'ordre des activités ;
   - le nom et la description sur place ;
   - la vue Tableau ;
   - Exporter les notes.

   D'ici là, qui peut modifier le cours a un lien discret « Organiser dans l'interface actuelle »,
   qui ouvre l'ancienne vue d'ensemble une fois (`ui=legacy-once`), comme le pont.

2. Les données. Proposé : `activities/mine` et `activities/taught` d'A-04, filtrés sur le cours et
   enrichis, plutôt que `GET /courses/:id/activities`. Ce dernier donne à l'enseignant ses dates de
   personne, fait une requête par activité, charge la source, envoie les restrictions aux étudiants
   et passe par B32. Les sections viennent de leur route, le cours de `GET /courses/:id`.
3. Les copies à corriger du cours. Proposé : par épreuve notée, les copies rendues qui ont un
   exercice à corriger (la règle de D39), avec les noms de ses correcteurs. Les groupes qu'ils
   corrigent (« TD 2 et TD 4 ») sont dans les périodes : ils viendront avec le panneau de réglage
   (K-05), qui les lit.
4. Les adresses. Proposé : `PORTED_PATHS` apprend un segment `:param` (`/courses/:id`), et
   `/courses/:id/dashboard` mène à `/courses/:id`. Les autres onglets et les pages d'une activité
   restent sur le pont. `/courses/not-found`, où LTI envoie, tombe sur l'état « cours introuvable ».
5. L'enseignant et l'étudiant. Proposé : la vue dépend de `permissions.update` du cours, pas du rôle
   de la plateforme. Un compte enseignant peut être étudiant d'un cours.
6. Les liens provisoires. Proposé, par le pont jusqu'à K-05, K-06 et K-07 :

   | Action                       | Adresse                                            |
   | ---------------------------- | -------------------------------------------------- |
   | La ligne (enseignant)        | le suivi `/activities/monitor/:courseId/:id`       |
   | Planifier, Régler l'activité | `/activities/:courseId/:id`, comme l'accueil (D38) |
   | Tester l'activité            | `/player/activity/:id`                             |
   | Ouvrir la ressource          | `/resources/:resourceId`                           |
   | Ajouter une activité         | `/activities/create?course=:id`                    |
   | Ajouter vos étudiants        | Membres                                            |
   | Reprendre un cours           | Paramètres, où est l'import                        |

7. Les fuites. Corrigées ici, puisque la page s'appuie sur ces routes :

   - les sections, les membres (avec leur adresse électronique) et les groupes d'un cours se lisent
     par tout compte ;
   - les sections s'écrivent par tout compte enseignant ;
   - `change-order` touche des activités d'autres cours.

   Elles sont consignées dans `08-bugs.md` (B43 à B45).

8. Les nombres des onglets. Proposé : Challenges et Membres d'après `statistic`, Groupes sans nombre
   jusqu'à K-03, plutôt qu'une requête de plus pour compter.

## 7. Definition of Done

- [x] Les comportements du § 1, chacun couvert par un test du § 2.
- [ ] Les specs d'intégration et e2e de l'API vertes : écrites et typées, à lancer par la personne
      (testcontainers).
- [x] Tests et lint des projets touchés (`web`, `design-system`, `feature-course-server`,
      `feature-result-server`, `feature-course-common`, `feature-course-browser`), `tsc` de l'API et
      du web, `yarn lint:design`, le build de production du web et celui de Storybook verts.
- [x] Les stories nouvelles ou modifiées sans violation axe, en clair et en sombre.
- [x] La page vérifiée dans Chrome sur l'app lancée, avec le monde de démonstration : enseignant,
      étudiant, administrateur, téléphone, clair et sombre, au clavier ; captures comparées au
      wireframe.
- [x] Le ticket dans `done/`, la roadmap et les décisions à jour.

> **Amendement à la livraison.** L'API, telle que livrée :
>
> - Qui peut modifier le cours (son équipe, l'administrateur) lit toutes ses activités, comme
>   `permissions.update` le dit à la page, par le service des membres plutôt qu'un test de rôle.
> - Les copies à corriger d'une activité sont celles de ses étudiants, rendues, avec un exercice à
>   corriger : la copie d'un enseignant qui a testé l'activité n'en est pas une. Les correcteurs se
>   lisent sans `ActivityCorrectorView`, qui relisait la source de l'activité pour chacun.
> - La note et « Copie en correction » ne viennent que d'une épreuve notée, rendue, dont l'activité
>   montre la correction ; une copie en cours ne dit rien, comme les copies récentes (D40).
> - Un groupe se cherche dans son cours : son identifiant n'est unique qu'à l'intérieur d'un cours
>   (les groupes LTI portent le nom donné par la plateforme). Le service des permissions vérifie
>   qu'il en est (`ensureGroupReadPermission`, `ensureGroupWritePermission`).
> - Une écriture ne prend du corps que ce qu'un client peut changer : le nom et l'ordre d'une
>   section, le nom d'un groupe. Le corps d'un `PATCH` pouvait déplacer une section ou un groupe dans
>   un autre cours.
> - Les membres d'un groupe passent par le DTO des membres : la liste donnait l'empreinte du mot de
>   passe de chacun à tout membre du cours.
> - `change-order` écrit l'ordre avec le cours dans sa condition, écarte ce qui n'est pas un
>   identifiant, et numérote à la suite ce qu'il garde ; une spec d'intégration le prouve.
> - Le filtre `course` a son contrat dans `common` (`CourseActivitiesFilter`).

> **Amendement à la livraison.** La page :
>
> - Le cours et ses sections se chargent ensemble, puis ses activités, par la route que le cours
>   désigne pour la personne (`taught` ou `mine`) : le rôle n'est connu qu'avec le cours.
> - Les durées s'écrivent comme ailleurs dans l'interface : « 1 h 30 min, une tentative »,
>   « 9 h 40 min passées ».
> - Une activité ouverte sans dates dit « Sans dates » après son état « Ouverte » : neutre pour un
>   entraînement, en attention pour une épreuve notée.
> - L'en-tête a son fil d'Ariane (Cours, puis le cours) ; un cours introuvable garde le titre
>   « Cours ».
> - « Prochaine échéance » suit la règle du classeur : une activité dont tous les exercices sont
>   faits n'en a plus.
> - Une recherche ou un état sans résultat dit « Aucune activité ne correspond », avec « Voir toutes
>   les activités », pour l'enseignant comme pour l'étudiant ; ce qui reste est annoncé aux lecteurs
>   d'écran après une pause.
> - Sur téléphone, À faire et Bientôt disent leur nombre, chaque ligne dit sa section, le bouton sous
>   le pouce dit l'action de l'activité (« Commencer » ou « Reprendre »), et la recherche ne
>   s'applique pas, faute de barre.
> - « Reprendre un cours » mène aux paramètres du cours, où se fait l'import.
> - Partager s'aligne sur le bord droit de son bouton quand la place manque à droite : les menus du
>   design system font de même.
> - L'onglet du navigateur dit « Cours », pas le nom du cours.

> **Amendement à la livraison.** Le code, chacun à sa place :
>
> - `course.vm.ts` garde ce que les deux vues partagent (onglets, en-tête, regroupement, filtres,
>   liens) ; `teacher/course-teacher.vm.ts` et `student/course-student.vm.ts` ont les lignes, À faire
>   et la colonne de chacun, avec leurs specs.
> - Dans `@platon/feature/course/common` : une activité reste à faire tant qu'elle est ouverte et
>   pas rendue (`isLeftToDo`), et une activité ouverte sans dates (`followsDates`,
>   `isOpenWithoutDates`).
> - Dans `next/shared/` : les fonctions des lignes d'activité tirées des accueils, `listOf`
>   (partagé avec les annonces), `copiesCount` et `gradeOn100`.
> - Dans le design system : `pl-course-section`, l'état et les actions de `pl-activity-row` (son
>   titre lien lu avec le reste de la ligne), `withoutAccents`, le nombre d'un onglet lu à part de
>   son nom.

> **Défauts trouvés en chemin.**
>
> - B43, B44, B45 : corrigés ici.
> - B48 : le temps passé compte les jours entre deux visites ; la page l'affiche comme l'interface
>   actuelle, en attendant une décision.
> - B49 : les membres d'un groupe sont rangés par son identifiant seul ; deux cours qui ont le même
>   groupe LTI partagent ses membres.
> - B50 : les groupes d'une activité s'écrivent sans aucune vérification.

Non vérifié : les specs d'intégration et e2e de l'API (à lancer par la personne).
