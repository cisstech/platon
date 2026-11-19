# K-01 : La liste des cours (classeurs)

Source : `design/flows/cours` (`01-mes-cours` bureau, étudiant, téléphone étudiant, vide ;
`02-mes-cours-actions` ; `03-nouveau`) et ses annotations ; `design/spec/flows/cours.md` ;
inventaire du code du 2026-10-13 ; décisions : D17, D20, D32, D38, D43.
Statut : Livré (2026-10-13), sur la branche `feat/courses-list`.
Dépend de : C-05, A-04 (`activities/mine`).
Taille : L.

## 1. Comportement attendu

- Étant donné une personne de la nouvelle interface, quand elle ouvre « Cours » dans la couverture,
  alors `/courses` s'ouvre sans rechargement : « Cours », la recherche sur le nom, Actuels et Archivés
  avec leur nombre, le tri et la période de mise à jour, et ses cours en classeurs.
- Étant donné un classeur, alors il a l'intercalaire et la couverture à la teinte du cours (D32), son
  sigle tiré du nom (AP1, PW), son nom, sa description sur deux lignes au plus, et, s'il en a, le
  nombre de ses challenges, qui mène à leur page. Le classeur entier ouvre le cours ; son bouton
  « Actions du cours » ouvre un menu.
- Étant donné un enseignant ou un administrateur, alors le pied du classeur dit les effectifs en
  toutes lettres (6 enseignants, 302 étudiants, 9 activités) et la date de mise à jour.
- Étant donné un étudiant, alors le classeur ne dit pas les effectifs. Il dit :

  - son avancement, compté en exercices (barre à la teinte du cours et pourcentage) ;
  - le nombre d'activités terminées en texte (« 34 exercices sur 59, 4 activités terminées sur 9 ») ;
  - qui enseigne (« Karim Haddad et 5 autres enseignants ») ;
  - sa prochaine échéance, à la couleur de son état (« Quiz : ferme ce soir à 23 h 59 »,
    « Contrôle continu 2 : ouvre mercredi à 10 h », « Aucune échéance à venir »).

  Un cours fini dit « Cours terminé, 4 activités sur 4 », avec la barre d'achèvement.

- Étant donné un téléphone, alors la liste garde la recherche et Actuels ou Archivés, et une carte par
  cours avec sa marque, son avancement, sa prochaine échéance et qui enseigne ; la carte entière ouvre
  le cours.
- Étant donné le menu d'un cours, alors il propose « Archiver » (« Le cours passe dans vos archivés.
  Pour vous seulement : il reste actif pour ses membres. ») et « Voir les challenges » s'il en a ; dans
  Archivés, « Désarchiver ». Archiver n'est proposé qu'à qui peut archiver : la personne inscrite
  directement au cours, pas par un groupe. Le cours quitte la liste aussitôt, et le nombre de l'onglet
  suit.
- Étant donné le tri, alors il propose « Mis à jour récemment » (par défaut), « Créés récemment » et
  « Par nom » ; la période propose « Toutes les périodes », « Aujourd'hui », « Cette semaine », « Ce
  mois-ci », « Ces six derniers mois », « Cette année ». La recherche, l'onglet, le tri et la période
  vivent dans l'adresse, avec les noms de l'interface actuelle (`q`, `order`, `direction`, `period`).
- Étant donné un administrateur, alors un troisième choix, « Toute la plateforme », montre tous les
  cours, par pages de 20 avec « Afficher plus ».
- Étant donné un enseignant ou un administrateur, alors « Créer un cours » ouvre un dialogue : Nom du
  cours et Description, obligatoires. Créer le cours ouvre sa page. L'adresse `/courses/create` ouvre
  la liste avec ce dialogue, si bien que « Créer » de la couverture le trouve sans changer.
- Étant donné aucun cours, alors l'enseignant lit « Aucun cours pour l'instant », ce qu'est un cours
  et « Créer un cours » ; l'étudiant, qu'il n'est inscrit à aucun cours et que son enseignant l'y
  ajoute. Une recherche sans résultat le dit, avec « Effacer la recherche » ; Archivés vide dit
  qu'aucun cours n'y est rangé.
- Étant donné le chargement, alors des classeurs squelettes, puis le message des 10 s et l'erreur avec
  « Réessayer » de `app-load-state`.
- Étant donné la recherche des cours, alors elle ne liste que les cours de la personne qui demande,
  quoi que l'adresse ajoute ; seul l'administrateur voit toute la plateforme.

## 2. Tests à écrire d'abord

- API, intégration : la recherche ignore les `members` d'un non-administrateur ; « Toute la
  plateforme » pagine en cours, pas en lignes de membres ; le nom du responsable ; le droit
  d'archiver vaut pour un membre direct et pas pour un membre par groupe.
- API, e2e : `GET /courses?members=<autre>` ne rend pas les cours de l'autre ; les nouveaux champs.
- Fonctions de vue : le sigle d'un nom ; les effectifs en toutes lettres ; l'avancement et les
  activités terminées ; « Karim Haddad et 5 autres enseignants » (seul, un autre, plusieurs) ; la
  prochaine échéance (ferme, ouvre, aucune) ; le cours terminé ; les libellés du tri et de la période ;
  l'adresse lue et écrite.
- Store : les deux onglets et leurs nombres, la recherche, le tri, la période, l'archivage et son
  échec, « Afficher plus », la création et son échec.
- Page : enseignant et étudiant, téléphone, menu du cours, dialogue de création, états vides,
  chargement, erreur ; le focus après l'archivage (le classeur qui part) et après le dialogue.
- Design system : chaque composant nouveau ou modifié a sa spec et ses stories en clair et en sombre,
  sans violation axe.
- `ported-paths` : `/courses` et `/courses/create` sont portés.

## 3. État actuel du code

Vérifié le 2026-10-13.

- Page actuelle : `apps/web/src/app/pages/courses/courses.page.ts`. Elle charge `search({ archived,
expands: ['permissions', 'statistic'] })` sans pagination. Les filtres vivent dans l'adresse (`q`,
  `period`, `order`, `direction`), et le tri aussi dans le `localStorage`. Onglets Actuels et
  Archivés ; tiroir de tri (nom, création, mise à jour, croissant ou décroissant) et de période (1,
  7, 31, 180, 365 jours). Pour l'administrateur, « Afficher tous les cours » (`showAll`). Chaque ligne
  (`course-item`) montre une icône fixe, le nom, la description, le trophée, les effectifs, la date
  et `statistic.progression`, et le seul bouton Archiver.
- Création : `/courses/create` (`create.page.ts`), nom et description obligatoires, puis
  `/courses/:id`.
- API : `GET /courses` (`course.controller.ts:29-41`) ajoute la personne à `members` sans retirer
  ceux de l'adresse ; `showAll` pour l'administrateur seul. `course.service.ts:28-104` joint
  `CourseMemberView`, et `offset`/`limit` y comptent des lignes de membres. `statistic`
  (`result/server/.../expanders/course.expander.ts`) donne `teacherCount`, `studentCount`,
  `activityCount`, `challengeCount`, `progression`, en trois requêtes par cours. `permissions` donne
  `update`. Le modèle `Course` n'a ni teinte, ni sigle, ni nom du responsable (`ownerId` seul).
- Archivage : par personne, `CourseMembers.archived`, `PATCH /courses/:id/members/me`, qui exige une
  ligne directe (404 sinon).
- `activities/mine` (A-04) donne par activité l'avancement en exercices, les dates propres et l'état,
  et écarte les cours archivés par la personne.
- Nouvelle interface : `/courses` passe par le pont ; les accueils montrent déjà les cours
  (`teacherCourses`, `courseViews`). Design system : `courseHue`, `pl-progress`, `pl-segmented`,
  `pl-menu`, `pl-dialog`, `pl-field` (champ d'une ligne), `pl-empty`, `pl-tag`, `pl-glyph`. Aucun
  classeur, aucune marque de cours.

## 4. Changements

Contrats (`libs/feature/course/common`, additifs) : `Course.owner` (nom du responsable) et
`CoursePermissions.archive`.

API :

- La recherche ignore les `members` donnés par un non-administrateur.
- « Toute la plateforme » pagine sur les cours, pas sur les lignes de la jointure.
- Le nom du responsable, joint à la recherche, et `permissions.archive` (membre direct).
- Une spec d'intégration pour la recherche, l'archivage et ces droits.

Navigateur : l'entrée légère `@platon/feature/course/browser/shared` suffit (`search`, `create`,
`archiveMember`, `playableActivities`).

Design system :

- `pl-course-mark` : la marque d'un cours, sa couverture en petit à sa teinte, avec son sigle ; elle
  resservira à l'en-tête de K-02.
- `pl-binder` : le classeur (intercalaire, couverture avec sigle, place du trophée et du menu, titre,
  description, pied), et son squelette.
- `pl-segmented` : un nombre par choix.
- `pl-field` : une description sur plusieurs lignes (`textarea[plInput]`).

Nouvelle interface (`pages/courses/`), découpée comme les accueils et les annonces :

- l'entrée : le store, l'en-tête, la barre (recherche, onglets, tri, période), les états ;
- `data/` : l'API et le store ;
- `courses.vm.ts` : sigle, effectifs, avancement, enseignants, échéance, libellés, adresse ;
- une vue par rôle si la carte l'exige (`teacher/`, `student/`), et `ui/` pour le menu du cours et le
  dialogue de création ;
- les routes `courses` et `courses/create`, et ces chemins dans `PORTED_PATHS`.

## 5. Hors scope

- La page d'un cours (K-02 et suivants) : ouvrir un cours passe par le pont jusque-là, comme les
  challenges.
- Une colonne de teinte ou de sigle sur le cours : la teinte dérive de l'identifiant (D32), le sigle
  du nom.
- Le tutoriel de gestion des cours de l'interface actuelle.
- Les défauts de l'interface actuelle trouvés en chemin, qui vont dans `design/docs/08-bugs.md`.

## 6. Points ouverts

Aucun : tranchés le 2026-10-13 par D43, comme proposé. Pour mémoire, les questions étaient :

1. Les données des classeurs. Proposé : réutiliser ce qui existe plutôt qu'une requête dédiée comme
   A-04.
   - L'enseignant : la recherche avec `statistic`.
   - L'étudiant : la recherche, plus `activities/mine` pour l'avancement, les activités terminées et
     la prochaine échéance, comme son accueil.
   - Le nom du responsable : joint à la recherche, sans requête de plus.
   - Le prix : les trois requêtes par cours de `statistic`, acceptables pour les cours d'une
     personne ; « Toute la plateforme » se pagine.
2. L'élève et ses archives. `activities/mine` écarte les cours archivés. Proposé : un classeur
   archivé ne dit que qui enseigne, sans avancement ni échéance.
3. Le sigle. Proposé : tiré du nom côté client. L'initiale des mots qui comptent (sans « et », « de »,
   « la »…), deux lettres pour un nom d'un seul mot, puis le nombre final : « Algorithmique et
   programmation 1 » donne AP1, « Analyse 1 » AN1, « Programmation web » PW.
4. Le tri. Proposé : trois tris dans leur sens naturel (mis à jour et créés, du plus récent ; nom, de
   A à Z), au lieu de six. L'adresse garde `order` et `direction`.
5. « Toute la plateforme ». Proposé : un troisième choix réservé à l'administrateur, à côté d'Actuels
   et Archivés, paginé par 20.
6. La création. Proposé : un dialogue sur la liste, et `/courses/create` porté vers la liste avec ce
   dialogue ouvert ; après la création, la page du cours (par le pont jusqu'à K-02).
7. Archiver. Proposé : seulement pour qui est inscrit directement (`permissions.archive`). L'interface
   actuelle le propose à tous et répond 404 aux inscrits par un groupe.
8. La fuite par `members`. Corrigée ici, puisque K-01 s'appuie sur cette route : aucun client ne
   l'envoie, et un non-administrateur y lit les cours d'un autre compte. Elle est consignée dans
   `08-bugs.md`.

## 7. Definition of Done

- [x] Les comportements du § 1, chacun couvert par un test du § 2.
- [ ] Les specs d'intégration et e2e de l'API vertes : écrites et compilées, pas lancées en local
      (testcontainers). À lancer, ou laisser à la CI :
      `nx run feature-course-server:test:integration`, `nx run feature-course-server:test:e2e`,
      `nx run feature-result-server:test:integration`.
- [x] Tests et lint des projets touchés (`web`, `design-system`, `feature-course-server`,
      `feature-result-server`, `feature-course-common`, `core-common`), `tsc` de l'API et du web,
      `yarn lint:design`, le build de production du web et celui de Storybook verts.
- [x] Les stories nouvelles ou modifiées sans violation axe, en clair et en sombre.
- [x] La page vérifiée dans Chrome sur l'app lancée, avec le monde de démonstration : enseignant,
      étudiant, administrateur, téléphone, clair et sombre, au clavier ; captures comparées au
      wireframe.
- [x] Le ticket dans `done/`, la roadmap et les décisions à jour.

> **Amendement à la livraison.** L'API, telle que livrée :
>
> - Le nom du responsable est joint à la recherche, et le DTO n'en garde que l'identifiant, le nom
>   d'utilisateur, le prénom et le nom : l'utilisateur que construit TypeORM apporte des valeurs par
>   défaut (`hasPassword: false`).
> - L'appartenance est un filtre parti des lignes de la personne (`membershipsOf`), sans jointure :
>   une page compte des cours, en une requête et son total (B40).
> - `statistic` compte toutes les activités d'un cours pour l'administrateur et pour qui l'enseigne :
>   « Toute la plateforme » disait 0 activité des cours dont l'administrateur n'est pas membre (B39).
> - `permissions` lit le droit de modifier et celui d'archiver en parallèle.
> - `feature-course-server` a désormais une cible `test:e2e`.

> **Amendement à la livraison.** Les filtres :
>
> - Les périodes sont des fenêtres glissantes, ce que fait l'API : « Dernières 24 h », « 7 derniers
>   jours », « 31 derniers jours », « 6 derniers mois », « 12 derniers mois ». Les noms du § 1
>   (« Cette semaine »…) promettaient des semaines et des mois du calendrier.
> - `direction` n'est plus lu ni écrit : chaque tri va dans son sens naturel, et l'adresse ne garde
>   que `q`, `order`, `period` et `tab`.
> - L'adresse mène : quand elle change, la page ouverte (« Cours » de la couverture, Précédent), les
>   filtres la suivent. Un onglet que la personne ne peut pas voir en sort.
> - Une recherche ou une période sans résultat dit laquelle des deux, ou les deux, et son bouton
>   efface ce qui n'a rien trouvé : « Effacer la recherche », « Voir toutes les périodes », « Effacer
>   les filtres ». Les états vides lisent les filtres auxquels la liste répond : effacer le champ ne
>   le détruit pas.
> - L'issue d'une recherche est annoncée aux lecteurs d'écran.

> **Amendement à la livraison.** La page :
>
> - « Toute la plateforme » montre chaque cours tel qu'il est, sans archivage : la personne archive
>   depuis ses propres listes. Un classeur sans action n'a pas de bouton « Actions du cours ». Ce
>   choix a son propre état vide.
> - Un cours qu'un étudiant désarchive recharge ses activités ; d'ici là, son classeur ne dit que qui
>   l'enseigne.
> - Le focus :
>   - archiver ou désarchiver le donne aussitôt au classeur qui prend la place, et le rend au menu du
>     cours si le serveur refuse ;
>   - « Afficher plus de cours » le donne au premier cours arrivé ;
>   - le dialogue ouvert par l'adresse le rend à « Créer un cours ».
> - Le cours créé depuis l'adresse `/courses/create` prend sa place dans l'historique : Précédent ne
>   rouvre pas le dialogue.
> - Les messages du dialogue de création sont annoncés, et le champ manquant prend le focus une fois
>   son message affiché.
> - Les classeurs d'une rangée ont la même hauteur, leurs pieds alignés. La date de mise à jour a sa
>   ligne (« Mis à jour le 26 sept. ») et un classeur fait au moins 360 px, pour que les effectifs
>   tiennent sur une ligne : deux colonnes à 1280 px. Le wireframe mettait la date au bout des
>   effectifs, qu'elle quittait seule pour la ligne suivante dès qu'un nombre grandissait.
> - Le tri et la période vont ensemble dans la barre ; sur téléphone, la période reste tant qu'elle
>   limite la liste.
> - Le menu du cours n'existe que s'il a une action, et « Afficher plus » s'écrit « Afficher plus de
>   cours ».

> **Amendement à la livraison.** La page se découpe en un métier par fichier :
>
> - `courses.ts` : l'en-tête et « Créer un cours », le chargement, et « Aucun cours pour l'instant »
>   ou la liste ;
> - `courses-address.ts` : le store lié à l'adresse, dans les deux sens ;
> - `course-creation.ts` : le dialogue, depuis le bouton ou l'adresse, son focus et sa navigation ;
> - `list/course-list` : la barre, les classeurs de l'onglet, leurs états, « Afficher plus de cours » ;
> - `list/course-archiving.ts` : l'archivage, le focus qui suit et le message d'un refus ;
> - `ui/course-empty` : pourquoi une liste est vide, et ce qui l'efface.
>
> Les cartes d'un onglet sont une fonction de vue (`cardViews`). Aucune vue par rôle : seul le pied
> du classeur change, dans `ui/course-card`.

> **Amendement à la livraison.** Le code partagé, chacun à sa place :
>
> - Dans `@platon/feature/course/common`, à côté d'`activityDatesFor` : une activité est terminée
>   quand elle est rendue ou que tous ses exercices sont faits, et seules celles qui ont des exercices
>   comptent (`activityDone`, `courseProgress`). Le pourcentage, un affichage, se calcule dans les
>   vues avec `percentOf`.
> - Dans `next/shared/`, ce qui porte du texte français :
>   - le texte de l'avancement, celui de l'accueil de l'étudiant (`progress-text.ts`) ;
>   - la prochaine échéance, construite sur `closingDue` et `openingDue`, avec les tris d'activités
>     (`byDeadline`, `byOpening`) sortis de l'accueil (`due.ts`). L'échéance a les couleurs des
>     lignes d'activité ;
>   - « Afficher plus », partagé avec les annonces (`ui/show-more/`, auparavant
>     `ui/announcement-more/` des annonces), son échec annoncé ;
>   - la pause de la recherche et les guillemets (`search-pause.ts`, `quoted.ts`).
> - Dans le design system, ce qui ne sait rien de PLaTon :
>   - le sigle d'un cours, à côté de `pl-course-mark` (`monogram`), pour l'en-tête de K-02 ;
>   - l'annonce des recherches, partagée avec les annonces (`announceSearches`) ;
>   - `whenRendered`, qui lance une tâche une fois la vue rendue, dans la zone, et plus rien une fois
>     la vue partie : le focus qui suit ce qui vient d'apparaître. Le panneau des notifications, la
>     page de connexion et le dialogue de création s'en servent (B42) ;
>   - `pl-binder` et `pl-segmented` exposent `focus()` ; le badge d'un classeur est lu après le nom du
>     cours, et nommé avec lui.

> **Défauts trouvés en chemin.**
>
> - B36 : tout compte lisait les cours d'un autre par `members`. Corrigé ici.
> - B37 : l'interface actuelle propose d'archiver à qui est inscrit par un groupe, et échoue sans le
>   dire.
> - B38 : « Afficher tous les cours » de l'interface actuelle mélange les listes de l'administrateur.
> - B39 : les effectifs ne comptaient que les activités de qui les lit. Corrigé ici.
> - B40 : les pages de la recherche comptaient des lignes de membres. Corrigé ici.
> - B41 : l'auteur d'une annonce arrive avec `hasPassword: false`.
> - B42 : le panneau des notifications fermé en pleine action levait `NG0911`. Corrigé ici.
