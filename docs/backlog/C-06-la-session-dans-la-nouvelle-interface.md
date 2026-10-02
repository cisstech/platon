# C-06 : La session dans la nouvelle interface : authentification, utilisateur courant, GraphQL

Source : `design/docs/06-faisabilite.md` (cadre et navigation), inventaire du code du 2026-09-29 ;
décisions : D6, D8, D21.
Statut : À faire.
Dépend de : F-04.
Taille : M.

## 1. Comportement attendu

- Étant donné une personne connectée, quand la nouvelle interface appelle l'API, alors ses requêtes
  portent son jeton et passent par les mêmes intercepteurs que l'ancienne (jeton, conversion des
  dates).
- Étant donné la nouvelle interface, alors elle connaît l'utilisateur courant et son rôle, chargés
  une fois au démarrage et relus seulement à la connexion ou à la déconnexion.
- Étant donné une personne non connectée qui ouvre une adresse du cadre, alors elle arrive sur
  `/login?next=<adresse>`, comme aujourd'hui ; un compte désactivé arrive sur `/403?reason=disabled`
  et un rôle non admis sur `/403`. Ces pages passent par le pont tant qu'elles ne sont pas portées.
- Étant donné le cadre, alors il admet les rôles élève, enseignant, administrateur et démo, comme
  aujourd'hui ; un candidat n'y entre pas.
- Étant donné la nouvelle interface, alors elle envoie des requêtes GraphQL et reçoit les
  abonnements (notifications) avec le jeton.
- Étant donné le démarrage de la nouvelle interface, alors aucun fichier chargé ne contient de code
  ng-zorro, Material ou Monaco ; à la fin de F-04, son fichier principal pesait 576 Ko (178 Ko
  compressé).

## 2. Tests à écrire d'abord

- Store de session : l'utilisateur est chargé une seule fois ; le rôle et ses aides (enseignant,
  administrateur, peut créer) suivent ; la déconnexion le vide.
- Garde : personne non connectée, compte désactivé, rôle non admis, rôle admis.
- Configuration : `nextConfig` fournit les intercepteurs, le fournisseur d'authentification et
  Apollo (même forme que `next.config.spec.ts`).
- Frontières : un cas fautif par entrée principale interdite dans `next/`, sur le modèle de
  `tools/lint/boundaries.test.mjs`.

## 3. État actuel du code

Vérifié le 2026-09-29.

- `apps/web/src/next/next.config.ts` fournit les providers partagés, le routeur et `DialogService`,
  mais ni l'authentification ni GraphQL : depuis S-03, `CoreBrowserModule` ne sert qu'à l'ancienne
  interface.
- `AuthProviders` (`libs/core/browser/src/lib/auth/providers.ts`) : intercepteurs `AuthInterceptor`
  et `DateConversionInterceptor`, et les fournisseurs distants d'authentification, d'utilisateur, de
  groupes, de préférences, de charte et de jeton.
- `AuthService.ready()` renvoie une promesse ; l'utilisateur n'est jamais gardé, donc chaque appel
  refait `GET /api/v1/users/{username}` (B19).
- `AuthGuard` et `withAuthGuard` (`libs/core/browser/src/lib/auth/guards/auth.guard.ts`) ; le cadre
  actuel est gardé pour élève, enseignant, administrateur et démo
  (`apps/web/src/app/app.routes.ts:92-98`).
- `User` et `UserRoles` (admin, teacher, student, demo, candidate), `isTeacherRole` :
  `libs/core/common/src/lib/models/user.model.ts`.
- `GraphQLModule` (`libs/core/browser/src/lib/graphql/graphql.module.ts`) importe `TokenService`
  par l'entrée `../auth`, qui exporte aussi des composants.
- `@platon/core/browser/shared` n'expose que `DialogService` et `StorageService`. Ces services
  n'importent aucun vendeur d'interface, mais les entrées principales qui les exportent, si.

## 4. Changements

- Core : `@platon/core/browser/shared` expose aussi l'authentification (service, garde, providers,
  jeton, utilisateur) et le client GraphQL, chacun importé par son fichier, jamais par un `index.ts`
  de dossier.
- Nouvelle interface :
  - `core/session/session.ts` : store de l'utilisateur courant (signaux), rempli au démarrage.
  - La garde du cadre, avec les rôles d'aujourd'hui.
  - `nextConfig` fournit l'authentification et Apollo.
- ESLint : les entrées principales des bibliothèques `@platon/feature/*/browser` sont refusées dans
  `next/`, avec un message qui renvoie vers leur entrée `/shared`.

## 5. Hors scope

La page de connexion (G-04) ; la charte d'utilisation (C-02) ; la correction de B19 dans
`AuthService`, qui sert aussi l'ancienne interface (fiche de bug à part).

## 6. Points ouverts

aucun

## 7. Definition of Done

- [ ] Les tests du §2 passent.
- [ ] Une adresse du cadre ouverte sans session mène à la connexion, puis revient à l'adresse.
- [ ] Le démarrage de la nouvelle interface est mesuré : aucun code ng-zorro, Material ou Monaco.
