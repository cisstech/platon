# A-04 : Les données des accueils

Source : A-01 et A-02 (leurs §1) ; `design/docs/06-faisabilite.md` (accueils) ; inventaire du code du
2026-10-12 ; décisions : D31, D38, D39, D40.
Statut : Livré (2026-10-12), sur la branche `feat/home-data` partie de `feat/realtime-sse`.
Dépend de : aucun.
Taille : L.

## 1. Comportement attendu

- Étant donné une personne connectée, quand elle demande `GET /api/v1/activities/mine`, alors elle
  reçoit, en une requête, les activités qu'elle peut jouer dans les cours où elle est étudiante (ni
  tests d'entrée, ni cours qu'elle a archivés), ouvertes, planifiées ou fermées, chacune avec :
  l'identifiant et le nom de son cours, son titre, ses dates **pour elle** (restrictions appliquées),
  son état, `isChallenge`, `graded`, sa durée et son nombre de tentatives (absents s'ils sont
  illimités), le nombre de ses exercices et le nombre qu'elle en a faits, si elle l'a commencée et
  si elle l'a terminée. Une activité dont aucune période ne la concerne n'y est pas. Ni `code` ni
  `restrictions` ne sortent.
- Étant donné une personne qui enseigne, quand elle demande `GET /api/v1/activities/taught`, alors
  elle reçoit les activités des cours où elle est enseignante, toutes, quelles que soient leurs
  restrictions, chacune avec ses dates de base, son état, `graded`, le nombre d'étudiants qui peuvent
  la jouer, le nombre qui l'ont commencée et la moyenne de leurs copies commencées, en une requête,
  pas une par activité. Un administrateur y voit les cours où il est enseignant, pas tous.
- Étant donné une personne, quand elle demande `GET /api/v1/results/recent`, alors elle reçoit ses
  trois dernières copies terminées, la plus récente en premier, chacune avec son activité, son cours,
  sa date de fin, et soit sa note sur 100 (`graded`), soit « en correction » (`correcting`) tant
  qu'un exercice répondu attend son correcteur, soit rien (`hidden`) quand l'activité ne montre pas
  la correction (`feedback.review` faux), pour ne pas dire ce que le lecteur cache.
- Étant donné le résumé des corrections (`GET /api/v1/results/corrections/summary`), alors chaque
  activité dit aussi le nombre de copies rendues (`submittedCopies`) et la date de la dernière
  (`lastSubmittedAt`), comptées comme `pendingCopies`.
- Étant donné les ressources vues (`GET /api/v1/resources?views=true`), alors chacune dit le moment
  de la dernière visite (`viewedAt`).
- Étant donné une activité, alors elle a un champ `graded`, faux par défaut, que la mise à jour d'une
  activité accepte (D38).
- Étant donné un compte de démonstration, alors `GET /api/v1/announcements/visible` et
  `visible/:id` lui répondent.
- Étant donné une copie terminée, par l'élève ou par la fermeture de l'activité, alors elle garde
  la date de sa fin (`terminatedAt`) ; la rouvrir la vide.
- Tout champ ajouté à une réponse existante l'est sans en changer d'autre : l'interface actuelle lit
  les mêmes.

> **Amendement à l'implémentation (D40).** Un élève d'un cours y a le rôle d'étudiant sans y
> enseigner, pour `mine` comme pour `taught`. La participation de `taught` applique aussi les périodes
> de restriction, et chaque activité dit si ses dates suivent des périodes (`restricted`), auquel cas
> ses dates de base ne sont pas celles des élèves. `recent` écarte les copies jamais commencées, et une
> copie cachée reste cachée pendant sa correction. Le nombre d'exercices d'une activité est celui de la
> copie quand elle en a, comme l'avancement actuel. L'avancement d'un cours se compte dans le
> navigateur, en sommant `mine` par cours. Une liste de membres d'une période nomme aussi un élève
> inscrit par un groupe (B31), dans les accueils comme dans la page du cours et le lecteur.

## 2. Tests à écrire d'abord

- Intégration (PostgreSQL réel, `*.integration.spec.ts`), une par requête :
  - `mine` : membre direct, membre par groupe, activité réservée à des membres et à des groupes,
    périodes de restriction (la sienne, « Autres », aucune), restriction vers un groupe supprimé,
    planifiée, fermée, cours archivé et test d'entrée écartés, copie absente, commencée, terminée ;
    le décompte des exercices faits ;
  - `taught` : les étudiants qui peuvent jouer (les enseignants exclus), ceux qui ont commencé, la
    moyenne, les copies des enseignants exclues, un cours où la personne n'est qu'étudiante écarté ;
  - `recent` : l'ordre, la note calculée, « en correction », la note cachée, une copie rouverte ;
  - le résumé : `submittedCopies` et `lastSubmittedAt` sur les fixtures de `pendingCopies`.
- De bout en bout (`createE2EApp`, nouvelles cibles `test:e2e` de `feature-result-server` et de
  `feature-course-server`) : les routes, les rôles, les champs qui ne sortent pas (`code`,
  `restrictions`), une personne qui ne voit que les siennes.
- Unitaires : l'évaluation des restrictions sur des appartenances chargées une fois ; la règle
  « exercice fait » et la note d'une copie, chacune partagée par ses usages.

> **Amendement à l'implémentation.** Pas de cible `test:e2e` pour `feature-course-server` : aucune de
> ses routes ne change, sauf `graded` dans la mise à jour d'une activité, couvert par les specs du DTO
> et du service ; une cible e2e y demanderait au harnais tout le module des cours (LTI, ressources,
> CLS). La note d'une copie est un fragment SQL partagé par `recent` et `taught`, prouvé par leurs
> specs d'intégration plutôt que par une spec unitaire. La file de correction et son résumé sont
> vérifiés ensemble, sur les mêmes copies.

## 3. État actuel du code

Vérifié le 2026-10-12.

- Copies : `"Sessions"` (`libs/feature/result/server/src/lib/sessions/session.entity.ts`), une copie
  d'activité ayant `parent_id` nul, ses exercices en enfants. La navigation
  (`variables->'navigation'`) dit `started`, `terminated` et l'état de chaque exercice ;
  `started_at` est écrit avec `started`. Terminer n'écrit aucune date ; la fermeture et la
  réouverture d'une activité basculent `terminated` sur toutes ses copies, commencées ou non.
- « Exercice fait » a trois définitions : l'état de navigation hors `NOT_STARTED` et `STARTED`
  (avancement d'une activité et d'un cours), une réponse enregistrée ou une erreur (file de
  correction), `attempts > 0` (tableau de bord).
- Note : par exercice, `COALESCE(correction.grade, grade)` ; la note de la copie n'est remplacée par
  la note corrigée que si tous ses exercices sont corrigés, y compris ceux sans réponse que la file
  ne montre jamais, et jamais si elle vaut 0 (B29).
- `SessionData` est une table recopiée, que les corrections et la fermeture ne rafraîchissent pas, et
  son `correction_enabled` est faux (B28) : A-04 ne s'en sert pas.
- Visibilité : `ActivityService` (`libs/feature/course/server/src/lib/activity/activity.service.ts`)
  filtre par `ActivityMemberView` et par groupe ; les dates par personne
  (`activity-dates.service.ts`) coûtent plusieurs requêtes par activité et par restriction, et une
  restriction vers un groupe supprimé lève une erreur (B30). `ActivityMemberView` compte les
  enseignants et le rôle global, pas le rôle dans le cours.
- Enseigner : `hasWritePermission` vaut vrai pour un administrateur sur tous les cours.
- Corrections : le résumé (`correction.service.ts`, `listSummary`) compte `pendingCopies` sur les
  copies terminées qui ont au moins un exercice répondu ou en erreur, sans le correcteur lui-même.
- Vues : `ResourceViews.updated_at` est la date de la dernière visite ; la branche `views=true` du
  contrôleur la perd.
- Annonces : `visible` et `visible/:id` sont réservées à admin, teacher et student.
- Dépendances : `feature-result-server` importe `feature-course-server`, pas l'inverse ; aucune des
  deux n'a de cible `test:e2e`. Le harnais e2e n'a ni `ClsModule` ni `DatabaseService`.

## 4. Changements

- Contrats (`libs/feature/course/common` et `libs/feature/result/common`, ajouts seulement) :
  `PlayableActivity`, `TaughtActivity`, `RecentCopy` ; `graded` sur `Activity` ; `submittedCopies`
  et `lastSubmittedAt` sur `ActivityCorrectionSummary` ; `viewedAt` sur `Resource` ; la règle
  « exercice fait » en une constante partagée, reprise par l'avancement existant.
- Données : `graded` sur `Activities` et `terminated_at` sur `"Sessions"`, avec un index pour les
  copies d'une personne par date de fin, par une migration générée (`./bin/migration/generate.sh`),
  relue avant d'être lancée : les migrations d'une colonne d'activité recréent des vues. Le lancer
  revient à la personne (`./bin/migration/run.sh`). Les copies déjà terminées prennent leur
  `updated_at`.
- API (`libs/feature/result/server`, qui voit les cours et les copies) : un service des accueils dont
  les requêtes ne passent ni par `ActivityService` ni par `SessionData`, avec les appartenances de la
  personne chargées une fois ; ses deux routes `activities/mine` et `activities/taught`, et
  `results/recent`. Terminer, fermer et rouvrir écrivent `terminated_at`. Le résumé des corrections,
  la branche `views=true` et les rôles des annonces visibles gagnent leurs ajouts.
- Accès navigateur : rien ici ; les entrées légères viennent avec A-01 et A-02.

> **Amendement à l'implémentation.** `ActivityDatesService` (page du cours, lecteur) évalue les
> restrictions par la même fonction pure (`activityDatesFor`, `course/common`), sur les appartenances
> lues une fois par cours (`CourseMemberService.restrictionSubject`) : B30 et B31 y sont corrigés, et
> une requête sans utilisateur reçoit les dates de « Autres ». Les prédicats partagés vivent dans le
> domaine qui les possède : `course-member.sql.ts` (appartenances, élève, enseignant) et
> `activity.sql.ts` (public d'une activité) dans `feature-course-server`, `correction.sql.ts` (exercice
> à corriger, que la file reprend aussi) et `home.sql.ts` dans `feature-result-server`, `asUuid` dans
> `core/server`. La migration générée a été allégée de deux écarts sans rapport : l'index
> `Resources_template_idx`, présent dans l'entité depuis c25243760 sans migration, et la valeur par
> défaut de `code`, que TypeORM régénère à chaque fois. La règle « exercice fait » sert aussi le compte
> d'abandons du tableau de bord et le garde du lecteur.

## 5. Hors scope

Les écrans (A-01, A-02). Corriger la note d'une copie corrigée (B29), `SessionData` (B28) et la
restriction vers un groupe supprimé ailleurs que dans ces requêtes (B30). L'état lu et le type
« service » des annonces (A-03). Le réglage de `graded` dans l'interface (K-05).

> **Amendement à l'implémentation.** B30 est corrigé partout, par la règle partagée. Reste hors scope
> B32 : la page du cours et le lecteur ne s'ouvrent qu'à un élève d'un groupe nommé comme membre d'une
> activité, que l'accueil montre à tout le groupe.

## 6. Points ouverts

Aucun : tranchés le 2026-10-12 par D39, comme proposé. Pour mémoire, les questions étaient :

1. « Exercice fait ». Proposé : l'état de navigation hors `NOT_STARTED` et `STARTED`, la règle de
   l'avancement actuel, en une constante partagée.
2. La date de fin d'une copie. Proposé : la colonne `terminated_at`, écrite en terminant et en
   fermant l'activité, vidée en rouvrant ; les copies déjà terminées prennent leur `updated_at`.
3. La note d'une copie dans `recent` et la moyenne de `taught`. Proposé : la note calculée par
   exercice, `COALESCE(correction.grade, GREATEST(grade, 0))`, un exercice sans réponse comptant 0,
   comme le lecteur ; la moyenne porte sur les copies commencées des étudiants.
4. Le dénominateur de la participation. Proposé : les étudiants du cours (rôle dans le cours) qui
   peuvent jouer l'activité, groupes et membres réservés compris, enseignants exclus.
5. Le périmètre d'un administrateur dans `taught`. Proposé : les cours où il est enseignant, pas
   tous les cours de la plateforme.

## 7. Definition of Done

- [ ] Les tests du §2 passent, ceux d'intégration et de bout en bout en CI.
- [x] La migration générée est relue, et lancée par la personne sur sa base.
- [x] `activities/mine` et `activities/taught` répondent en une requête de données, mesurée sur la
      base de développement.
- [ ] L'interface actuelle se comporte comme avant (avancement, corrections, ressources vues).

> **Amendement à la livraison.** Les specs d'intégration et de bout en bout ont tourné en local
> (testcontainers), pas encore en CI : `feature-result-server` 16 en intégration et 8 de bout en bout,
> `feature-course-server` 5 en intégration, `feature-announcement-server` 22 de bout en bout. Quatre
> mutations du SQL (élève qui enseigne, périodes de `taught`, nombre d'exercices, condition des
> correcteurs) font chacune échouer la spec des accueils. La migration a été lancée sur la base de
> développement : 24 copies terminées sur 24 ont reçu leur date de fin. Les requêtes y répondent en
> moins de 2 ms, sur 4 activités et 33 comptes : une requête par route, pas une mesure de charge.
> Non vérifié : l'interface actuelle dans Chrome, l'application ne tournant pas. Ses specs
> d'avancement, de corrections et de ressources vues passent, et elle change où B30 et B31 le
> demandent.
