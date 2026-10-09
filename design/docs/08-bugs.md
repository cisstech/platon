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

- [ ] Corrigé
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
