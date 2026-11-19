# Bugs relevés

Trouvés pendant l'audit et les inventaires du code. Une fiche par bug : ce qu'on voit, pourquoi, où
regarder. Cochez la case quand c'est corrigé.

Gravité : **P1** bloque, trompe ou expose. **P2** gêne ou fait douter. **P3** détail.

## P1

### B1. « Élève » crée un compte enseignant

- [ ] Corrigé
- **Symptôme** : dans Administration, Utilisateurs, créer un compte avec le rôle Élève donne un
  compte enseignant.
- **Cause** : `getRole` renvoie `UserRoles.teacher` pour Élève.
- **Où** : `apps/web/src/app/pages/admin/users/users.page.ts`

### B2. Un cours qui ne charge pas se dit vide

- [ ] Corrigé
- **Symptôme** : si le chargement des sections ou des activités échoue, la page affiche « Ce cours
  ne contient aucune section ».
- **Cause** : `refresh()` n'a pas de `catch`, les sections restent `[]`.
- **Où** : `apps/web/src/app/pages/courses/course/dashboard/dashboard.page.ts`

### B3. Challenges : squelette infini

- [ ] Corrigé
- **Symptôme** : un échec de chargement laisse le squelette affiché pour toujours.
- **Cause** : `loading` n'est jamais remis à `false` (pas de `finally`).
- **Où** : `apps/web/src/app/pages/courses/course/challenges/challenges.page.ts`

### B4. Lecteur : chargement sans fin

- [ ] Corrigé
- **Symptôme** : si l'exécution d'un exercice ne répond pas, le chargement ne s'arrête jamais.
- **Cause** : aucun délai maximal côté client.
- **Où** : `libs/feature/player/browser`

### B5. Accueil vide pour les comptes démo et candidat

- [ ] Corrigé. Dans la nouvelle interface, le compte de démonstration a l'accueil de l'élève (A-01) ;
      l'interface actuelle et le compte candidat restent sans accueil.
- **Symptôme** : l'accueil ne montre rien à ces rôles.
- **Cause** : les données ne sont chargées que pour `student`.
- **Où** : `apps/web/src/app/pages/dashboard/overview/overview.presenter.ts`

### B21. Suppression des notifications d'une autre personne

- [ ] Corrigé
- **Symptôme** : la mutation de suppression d'une notification accepte n'importe quel identifiant ;
  une personne connectée peut supprimer les notifications d'une autre si elle connaît leurs
  identifiants.
- **Cause** : `NotificationService.delete(userId, ids)` appelle `repository.delete(ids)` sans filtrer
  sur `userId`.
- **Où** : `libs/feature/notification/server/src/lib/notification.service.ts`
- **Correctif** : supprimer par `{ userId, id: In(ids) }`, comme `markAsUnread` (PR #120, sur
  `main`, avant la nouvelle interface).

### B23. Connexion sans limite de tentatives, qui dit si un compte existe

- [ ] Corrigé
- **Symptôme** : on peut essayer des mots de passe sans fin ; un nom d'utilisateur inconnu reçoit
  « User not found » (404), un mauvais mot de passe « Password is incorrect » (400) : la réponse dit
  quels comptes existent.
- **Cause** : aucune limite de débit dans l'API ni dans nginx ; deux erreurs distinctes à la
  connexion.
- **Où** : `libs/core/server/src/lib/auth/auth.controller.ts` (`signin`),
  `libs/core/server/src/lib/auth/auth.service.ts` (`signIn`), `.docker/nginx/nginx.prod.conf`
- **Piste** : une même réponse pour les deux cas (G-04) ; une limite par adresse et par compte sur
  `POST /auth/signin` (`@nestjs/throttler` ou `limit_req`).
- **En partie corrigé (G-04)** : une même réponse, dans le même temps, pour un compte inconnu et un
  mauvais mot de passe. Reste la limite de tentatives.

### B25. Un jeton d'accès se renouvelle sans fin

- [ ] Corrigé
- **Symptôme** : avec un seul jeton d'accès, on obtient de nouveaux jetons sans limite en appelant
  `POST /api/v1/auth/refresh`, qui rend chaque fois un jeton de rafraîchissement neuf pour 7 jours ;
  un jeton de rafraîchissement ouvre aussi toutes les routes. Un jeton volé donne donc un accès qui
  n'expire jamais. Le modèle d'environnement donne d'ailleurs 7 jours aux deux jetons (le code met
  15 min au jeton d'accès par défaut).
- **Cause** : les deux jetons ont le même secret et le même contenu (`sub`, `username`), seule leur
  durée change ; `refresh` accepte tout jeton que la garde accepte.
- **Où** : `libs/core/server/src/lib/auth/auth.service.ts` (`authenticate`),
  `libs/core/server/src/lib/auth/auth.controller.ts` (`refresh`),
  `libs/core/server/src/lib/auth/strategies/jwt.strategy.ts`
- **Piste** : ticket G-05, avec B26 : un type dans chaque jeton, la garde n'accepte que `access`,
  `refresh` que `refresh` et rend le même jeton de rafraîchissement ; côté navigateur,
  `RemoteTokenProvider.refresh` envoie lui-même le jeton de rafraîchissement, sinon le flux des
  notifications ne pourra plus rafraîchir son jeton.
- **Corrigé dans G-05** (branche `fix/session-tokens`) ; la case se coche à la fusion.

### B27. Un jeton d'accès suffit à poser un mot de passe et à ouvrir une nouvelle session

- [ ] Corrigé
- **Symptôme** : pour un compte sans mot de passe (CAS, LTI, démonstration, candidat),
  `POST /api/v1/auth/reset-password` pose un mot de passe sans demander l'ancien et rend une nouvelle
  paire de jetons : un jeton d'accès volé devient un accès permanent. Un administrateur qui change le
  mot de passe d'une autre personne reçoit ses jetons, et le navigateur remplace sa propre session par
  la sienne.
- **Cause** : `AuthService.resetPassword` rend `authenticate(user)` pour la personne visée ; sans
  mot de passe, aucune preuve n'est demandée.
- **Où** : `libs/core/server/src/lib/auth/auth.service.ts` (`resetPassword`),
  `libs/core/browser/src/lib/auth/providers/remote-auth.provider.ts` (`resetPassword`)
- **Piste** : ne rendre aucune session, ou celle de l'appelant inchangée ; pour poser un premier mot
  de passe, demander une connexion récente (CAS ou LTI).

### B36. Tout compte lit les cours d'un autre par `members`

- [x] Corrigé dans K-01 (branche `feat/courses-list`).
- **Symptôme** : `GET /api/v1/courses?members=<identifiant>` rend à tout compte connecté les cours
  d'un autre compte : leurs noms, leurs descriptions et leurs effectifs.
- **Cause** : la recherche ajoutait la personne à `members` sans retirer ceux de l'adresse.
- **Où** : `libs/feature/course/server/src/lib/course.controller.ts` (`search`)
- **Note** : seul l'administrateur garde `members` et `showAll` ; une spec e2e le prouve.

## P2

### B6. `/tests` sans garde de rôle

- [ ] Corrigé
- **Symptôme** : un élève qui a l'adresse ouvre l'écran des tests d'entrée ; seule l'entrée du
  menu est cachée. À vérifier : l'API refuse-t-elle les données ?
- **Cause** : pas de garde de rôle sur les routes.
- **Où** : `apps/web/src/app/pages/tests/tests.routes.ts`

### B7. Anneau des statuts d'un cercle à « (0%) »

- [ ] Corrigé
- **Symptôme** : chaque statut affiche « (0%) » alors que les effectifs ne sont pas nuls.
- **Piste** : les compteurs `SUM` arrivent en chaînes et le total est concaténé.
- **Où** : `buildStatusChart`, `apps/web/src/app/pages/resources/resource/overview/overview.page.ts`

### B8. Corrections : onglet blanc sans élément

- [ ] Corrigé
- **Symptôme** : sans correction, l'onglet est blanc au lieu du message prévu.
- **Cause** : `correction-table` n'a pas de `ng-content`, le message passé n'est jamais affiché.
- **Où** : `correction-table.component.html`, pages `corrections/pendings` et `availables`

### B9. Code de déblocage affiché sans code

- [ ] Corrigé
- **Symptôme** : la fin d'activité montre le champ « Code de déblocage » même quand il n'y en a pas.
- **Cause** : aucune condition d'affichage.
- **Où** : `libs/feature/player/browser/src/components/player-activity/player-activity.component.html`

### B10. Résultats d'activité : échec silencieux

- [ ] Corrigé
- **Symptôme** : si les résultats ne chargent pas, rien ne s'affiche, sans message.
- **Cause** : erreur non gérée dans `ngOnInit`.
- **Où** : `player-results.component.ts`

### B20. Compteur de notifications à 0 au chargement

- [ ] Corrigé
- **Symptôme** : la cloche affiche 0 notification non lue à l'ouverture de PLaTon, même quand il y en
  a ; le bon nombre n'apparaît qu'à la prochaine notification reçue.
- **Cause** : le compteur part de 0 et n'est mis à jour que par l'abonnement `OnChangeNotifications`,
  qui n'envoie rien à la connexion ; aucune requête ne lit le compte au départ.
- **Où** : `libs/feature/notification/browser/src/lib/api/notification.service.ts`,
  `components/notification-drawer/notification-drawer.component.ts`
- **Piste** : lire `totalCount` de `notifications(filters: { unread: true })` au chargement ; C-04 le
  fait pour la nouvelle interface.
- **Corrigé dans C-08** : le flux SSE des notifications envoie le compteur dès son ouverture, et le
  tiroir de l'interface actuelle le reçoit. La case se coche à la fusion.

### B22. Un élève correcteur ne peut pas enregistrer ses corrections

- [ ] Corrigé
- **Symptôme** : un élève désigné correcteur d'une activité voit ses copies à corriger, mais chaque
  correction enregistrée est refusée (403).
- **Cause** : le choix des correcteurs propose tous les membres du cours, élèves compris, alors que
  `POST /results/corrections/:sessionId` n'accepte que les rôles enseignant et administrateur.
- **Où** : `libs/feature/result/server/src/lib/correction/correction.controller.ts` (`@Roles`),
  `libs/feature/course/browser/src/components/activity-settings/restriction/`
- **Piste** : autoriser l'enregistrement à toute personne désignée correctrice de l'activité
  (`ActivityCorrectorView`), ou ne proposer que des enseignants comme correcteurs. À trancher.

### B24. Un échec du CAS finit sur une erreur JSON

- [ ] Corrigé
- **Symptôme** : un ticket CAS refusé ou un fournisseur injoignable affiche une erreur 500 en JSON à
  l'adresse de l'API, sans retour à la page de connexion. Sans `next`, la redirection réussie envoie
  `next=undefined`.
- **Cause** : `checkCasTicket` lève une erreur au lieu de rediriger ; `next` et l'adresse de service
  ne sont pas encodés, et `https` est écrit en dur.
- **Où** : `libs/feature/cas/server/src/lib/cas.controller.ts`,
  `libs/feature/lti/server/src/lib/lti.middleware.ts` (même `next` non encodé)
- **Piste** : rediriger vers `/login` avec un code d'erreur que la page traduit ; encoder `next`, et
  l'omettre quand il manque (G-04).
- **En partie corrigé (G-04)** : tout échec ramène à `/login?error=cas`, que la nouvelle interface
  traduit (l'actuelle montre le formulaire sans message) ; `next` et l'adresse de service sont
  encodés. Reste `https` écrit en dur dans l'adresse de service.

### B26. Les requêtes en attente d'un rafraîchissement de jeton ne repartent jamais

- [ ] Corrigé
- **Symptôme** : quand plusieurs requêtes reçoivent « jeton expiré » en même temps, la première
  rafraîchit le jeton et repart ; les autres restent en attente pour toujours, et l'écran qui les
  attend charge sans fin.
- **Cause** : `AuthInterceptor` les fait attendre `token$`, qui n'est jamais alimenté par le jeton
  rafraîchi. Pendant le rafraîchissement, il envoie aussi le jeton de rafraîchissement comme Bearer
  à toutes les requêtes, ce qui ne marche qu'à cause de B25.
- **Où** : `libs/core/browser/src/lib/auth/interceptors/auth.interceptor.ts`
- **Piste** : ticket G-05, avec B25 : un seul rafraîchissement partagé (`TokenService.refresh`), qui
  rejoue chaque requête avec le nouveau jeton ; le jeton de rafraîchissement ne part que vers
  `POST /auth/refresh`.
- **Corrigé dans G-05** (branche `fix/session-tokens`) ; la case se coche à la fusion.

### B28. `correction_enabled` vrai pour une seule activité de toute la plateforme

- [ ] Corrigé
- **Symptôme** : dans les données des copies (`SessionData`), une activité qui a des correcteurs est
  dite sans correction, sauf une seule activité de toute la plateforme ; la table n'est pas non plus
  rafraîchie par les corrections ni par la fermeture d'une activité.
- **Cause** : la sous-requête `SELECT id, activity_id FROM "ActivityCorrectors" corrector LIMIT 1`
  garde une seule ligne de la table entière avant la jointure sur l'activité.
- **Où** : `libs/feature/result/server/src/lib/sessions/session.subscriber.ts`,
  `libs/feature/result/server/src/lib/sessions/session.service.ts`
- **Piste** : une jointure `EXISTS` sur l'activité de la copie ; rafraîchir la table là où la
  correction et la fermeture écrivent, ou ne plus la lire (A-04 ne s'en sert pas).

### B29. La note corrigée d'une copie n'est pas reportée sur la copie

- [ ] Corrigé
- **Symptôme** : une copie corrigée garde sa note automatique quand un de ses exercices est resté
  sans réponse, et une copie corrigée à 0 aussi ; l'événement « copie corrigée » n'est pas émis.
- **Cause** : la note de la copie n'est remplacée que si tous ses exercices ont une correction, y
  compris ceux sans réponse, que la file de correction ne montre jamais ; et `if (grade && ...)`
  écarte un total de 0.
- **Où** : `libs/feature/result/server/src/lib/correction/correction.service.ts`
- **Piste** : considérer la copie corrigée quand tous les exercices de la file le sont, les autres
  comptant 0, et enregistrer la note même nulle.

### B30. Une restriction vers un groupe supprimé casse la liste des activités

- [x] Corrigé dans A-04 (branche `feat/home-data`) : les restrictions se lisent sur les groupes de la
      personne, chargés une fois (`activityDatesFor`), et un groupe absent ne nomme personne.
- **Symptôme** : quand une période de restriction vise un groupe du cours qui a été supprimé, la
  liste des activités du cours répond 500 pour les membres concernés.
- **Cause** : `CourseGroupService.isMember` lève `Group with id … not found` au lieu de répondre
  « non membre ».
- **Où** : `libs/feature/course/server/src/lib/activity/activity-dates.service.ts`
- **Piste restante** : retirer le groupe des restrictions quand il est supprimé, pour que le panneau
  de réglage ne montre pas une période vide.

### B31. Un élève d'un groupe nommé dans une période de restriction n'y a jamais accès

- [x] Corrigé dans A-04 (branche `feat/home-data`).
- **Symptôme** : un élève inscrit par un groupe d'utilisateurs, choisi dans la liste des membres ou
  des correcteurs d'une période, reçoit les dates de « Autres » ou aucune ; le panneau de réglage,
  lui, le dit dans la période.
- **Cause** : le sélecteur de membres écrit la ligne du groupe ou `<ligne>:<utilisateur>`, et le
  serveur ne comparait que la ligne propre de l'élève.
- **Où** : `libs/feature/course/browser/src/components/course-member-select/course-member-select.component.ts`,
  `libs/feature/course/common/src/lib/activity-restriction.model.ts` (`activityDatesFor`)

### B32. Une activité réservée à un groupe nommé comme membre ne s'ouvre qu'à un de ses élèves

- [ ] Corrigé
- **Symptôme** : une ligne `ActivityMembers` qui vise la ligne d'un groupe d'utilisateurs, sans
  `user_id`, n'ouvre l'activité qu'à un élève du groupe, choisi au hasard, dans la page du cours et
  dans le lecteur ; l'accueil d'A-04 la montre à tout le groupe.
- **Cause** : `ActivityMemberView` garde une ligne par membre d'activité (`DISTINCT ON (member_id)`).
- **Où** : `libs/feature/course/server/src/lib/activity-member/activity-member.view.ts`
- **Piste** : `DISTINCT ON (member_id, u.id)`, par une migration générée, ou faire lire à
  `ActivityService` le public partagé (`audienceOf`, `activity.sql.ts`). Aucune interface actuelle
  n'écrit de telles lignes : seules des données anciennes ou créées par l'API sont touchées.

### B33. Le contenu écrit dans EditorJS passe sans assainissement

- [ ] Corrigé
- **Symptôme** : le HTML d'un contenu EditorJS (annonces et leur aperçu, conditions et courriel des
  tests, composant `editorjs-viewer` des exercices) est inséré tel quel dans la page de l'interface
  actuelle : un bloc `raw`, un `onerror` ou un lien `javascript:`
  écrit dans l'éditeur s'exécute chez qui le lit.
- **Cause** : `ui-editorjs-viewer` contourne l'assainisseur d'Angular (`bypassSecurityTrustHtml`).
- **Où** : `libs/shared/ui/src/editorjs/editorjsViewer/editorjs-viewer.component.ts`
- **Piste** : lier `[innerHTML]` sans contournement, comme `app-rich-text` de la nouvelle interface
  (A-03), et vérifier les styles qui reposaient sur des attributs `style` retirés.

### B37. Archiver un cours suivi par un groupe ne fait rien

- [ ] Corrigé
- **Symptôme** : l'interface actuelle propose Archiver à tout compte qui n'est pas administrateur. Pour
  une personne inscrite par un groupe, `PATCH /courses/:id/members/me` répond 404, et rien ne se
  passe à l'écran.
- **Cause** : le bouton ne lit aucun droit, et `onArchiveToggle` n'a pas de `catch`.
- **Où** : `apps/web/src/app/pages/courses/courses.page.ts`
- **Piste** : lire `permissions.archive` (ajouté par K-01) et dire l'échec.

### B38. « Afficher tous les cours » mélange les listes de l'administrateur

- [ ] Corrigé
- **Symptôme** : tous les cours de la plateforme arrivent d'un coup ; Cours actuels liste aussi ceux
  que l'administrateur a archivés ; changer d'onglet garde toute la plateforme, et seul un
  rechargement ramène ses propres cours.
- **Cause** : `showAll` reste dans les filtres, sans `archived` ni pagination.
- **Où** : `apps/web/src/app/pages/courses/courses.page.ts`
- **Piste** : un choix à part, paginé, comme « Toute la plateforme » de la nouvelle interface (K-01).

### B39. Les effectifs d'un cours ne comptent que les activités de qui les lit

- [x] Corrigé dans K-01 (branche `feat/courses-list`).
- **Symptôme** : sur un cours dont il n'est pas membre, l'administrateur lit 0 activité et aucun
  challenge. Un co-enseignant ne compte pas les activités réservées qu'un autre enseignant a créées.
- **Cause** : `statistic` ne gardait que les activités créées par la personne ou ouvertes à elle.
- **Où** : `libs/feature/result/server/src/lib/expanders/course.expander.ts`
- **Note** : l'administrateur et qui enseigne le cours comptent toutes ses activités ; une spec
  d'intégration le prouve.

## P3

### B11. Identifiant de session dans le résumé

- [ ] Corrigé
- **Symptôme** : la fin d'activité affiche l'UUID de la session.
- **Où** : `player-results.component.html`

### B12. Balise `<bouton>`

- [ ] Corrigé
- **Symptôme** : l'action Prévisualiser des annonces est une balise `<bouton>` au lieu de `<button>`.
- **Où** : `apps/web/src/app/pages/admin/announces/announces.page.html`

### B13. « Créer un challenge » montré aux élèves

- [ ] Corrigé
- **Symptôme** : l'état vide des challenges propose de créer un challenge à tout le monde ; un élève
  arrive sur une page refusée.
- **Cause** : pas de condition de permission.
- **Où** : `apps/web/src/app/pages/courses/course/challenges/challenges.page.html`

### B14. Élément vide dans le menu d'une activité

- [ ] Corrigé
- **Symptôme** : sans droit de modifier, le menu d'une carte d'activité a une ligne vide.
- **Cause** : le `<li>` de l'export CSV est toujours rendu.
- **Où** : `libs/feature/course/browser/src/components/activity-card/activity-card.component.html`

### B15. Polices non chargées

- [ ] Corrigé
- **Symptôme** : `--brand-font` demande Inter puis Roboto, aucune n'est chargée ; le navigateur
  prend sa police par défaut.
- **Où** : styles globaux de `apps/web`

### B16. Fautes d'interface

- [ ] Corrigé
- « Status », « Active », « A propos », « ce champs », « faîtes », « Centre d'intêret »,
  « estimée ». Détail et fichiers : tableau Microcopie de `02-audit.md`.

### B17. Feuilles de thème sans version

- [ ] Corrigé
- **Symptôme** : après un déploiement, un navigateur peut garder les anciennes feuilles de thème
  ng-zorro et Material.
- **Cause** : ces bundles `inject: false` n'ont pas d'empreinte dans leur nom et nginx n'envoie pas
  de `Cache-Control` ; `ThemeService` les charge sans version.
- **Où** : `libs/core/browser/src/lib/services/theme.service.ts`, `.docker/nginx/nginx.prod.conf`
- **Piste** : versionner l'adresse comme `uiStylesheetHref` le fait pour `styles.legacy.css`
  (`apps/web/src/ui-switch/ui-stylesheet.ts`), avec l'empreinte de `main.js`.

### B18. `index.html` sans `Cache-Control`

- [ ] Corrigé
- **Symptôme** : après un déploiement ou un changement du drapeau `platon-ui-next`, un navigateur
  peut garder l'ancien `index.html` (fraîcheur estimée par le navigateur), donc les anciens bundles et
  l'ancienne valeur du drapeau.
- **Cause** : nginx n'envoie aucun `Cache-Control` pour `index.html`.
- **Où** : `.docker/nginx/nginx.prod.conf`
- **Piste** : `location = /index.html` avec `Cache-Control: no-cache` (revalidation à chaque chargement,
  réponse 304 si rien n'a changé), en répétant les en-têtes de sécurité, que nginx n'hérite pas quand
  un `add_header` est posé dans le bloc.

### B19. L'utilisateur courant est rechargé à chaque appel

- [ ] Corrigé
- **Symptôme** : une requête `GET /api/v1/users/{username}` à chaque garde de route et à chaque
  service qui demande l'utilisateur (une trentaine d'appels à `ready()`).
- **Cause** : `AuthService` déclare `user` mais ne l'affecte jamais ; seule la requête en cours est
  partagée. Pour la même raison, `signOut` ne prévient jamais les observateurs de la déconnexion
  (aucun n'est déclaré aujourd'hui).
- **Où** : `libs/core/browser/src/lib/auth/api/auth.service.ts`
- **Piste** : garder l'utilisateur dans `connect()`, le vider à la connexion, à la réinitialisation
  du mot de passe et à la déconnexion.

### B34. Listes EditorJS mal formées

- [x] Corrigé dans A-03 (branche `feat/announcements`).
- **Symptôme** : une liste se fermait par `</ol style="padding-left: 1em;">`, une sous-liste suivait
  son élément au lieu d'y être, et une liste plate (éléments en texte) levait une erreur.
- **Où** : `libs/shared/utils/src/lib/editorjs/parsers/list-parser.ts`
- **Note** : `editorjs-parser` écrit les parseurs qu'on lui donne dans ses défauts partagés ;
  `editorjsToHtml` part d'une copie, pour qu'un remplacement ne vaille que pour son appel.

### B35. Chaque migration générée embarque deux écarts sans rapport

- [ ] Corrigé
- **Symptôme** : `./bin/migration/generate.sh` ajoute à toute migration la création de
  `Resources_template_idx` et la réécriture du défaut de `Activities.code` ; il faut les retirer à la
  main.
- **Cause** : l'index a été renommé dans l'entité (`Resources_parent_idx` vers `Resources_template_idx`)
  sans migration ; le défaut de `code` est une expression que TypeORM relit autrement qu'il l'écrit.
- **Où** : `libs/feature/resource/server/src/lib/resource.entity.ts`,
  `migrations/1787242389696-SetDefaultValueForActivityCode.ts`
- **Piste** : une migration qui renomme l'index ; pour `code`, écrire le défaut dans la forme que
  PostgreSQL renvoie.

### B40. Les pages de la recherche des cours comptaient des lignes de membres

- [x] Corrigé dans K-01 (branche `feat/courses-list`).
- **Symptôme** : `GET /courses?limit=20` rendait moins de 20 cours, et deux pages pouvaient se
  recouvrir.
- **Cause** : la recherche joignait `CourseMemberView`, et `offset` et `limit` comptaient les lignes
  de cette jointure.
- **Où** : `libs/feature/course/server/src/lib/services/course.service.ts` (`search`)
- **Note** : l'appartenance est désormais un filtre parti des lignes de la personne
  (`membershipsOf`), sans jointure.

### B41. L'auteur d'une annonce arrive avec `hasPassword: false`

- [ ] Corrigé
- **Symptôme** : l'API rend `publisher.hasPassword: false` pour toute annonce, que la personne ait un
  mot de passe ou non.
- **Cause** : TypeORM construit l'utilisateur joint avec `new UserEntity()`, dont l'initialiseur
  `hasPassword = false` survit à une sélection partielle, et le DTO garde tout.
- **Où** : `libs/feature/announcement/server/src/lib/announcement.dto.ts` (`publisher`)
- **Piste** : ne garder que les champs choisis, comme `CourseDTO.owner` (K-01).

### B42. Le panneau des notifications se ferme en pleine action et lève une erreur

- [x] Corrigé dans K-01 (branche `feat/courses-list`).
- **Symptôme** : fermer le panneau pendant « Tout marquer comme lu », « Afficher les plus
  anciennes », « Tout supprimer » ou le refus d'une invitation laisse une erreur `NG0911: View has
already been destroyed` dans la console.
- **Cause** : le focus qui suit l'action est demandé par `afterNextRender` sur l'injecteur d'une vue
  déjà détruite.
- **Où** : `apps/web/src/next/shell/notifications/notifications-panel.ts` (`keepFocus`)
- **Note** : `whenRendered` (design system) ne lance plus rien une fois la vue partie ; la page de
  connexion et le dialogue de création de cours s'en servent aussi.

## Code mort

- [ ] Pages `informations` et `demo` des paramètres de cours, jamais routées
      (`apps/web/src/app/pages/courses/course/settings/`)
- [ ] « Transformer avec l'IA » commenté dans le builder, code et modale toujours présents
      (`pages/builder/builder.page.html`, `libs/feature/builder/browser/.../ai-prompt-modal/`)
- [ ] `isTemplateCreator` toujours `false`, `mode=configure` jamais positionné (`builder.page.ts`,
      `pages/resources/create/create.page.ts`)
- [ ] Pages `/forum` et `/agenda` vides (`pages/dashboard/dashboard.routes.ts`)

## Corrigés

- [x] **Activités d'avant juillet 2024 en erreur 500** (groupes d'exercices stockés en tableau) :
      `normalizeExerciseGroups`, PR cisstech/platon#115, mergée sur `main`.
