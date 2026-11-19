# G-05 : Les jetons de session, chacun son rôle

Source : bugs B25 et B26 (`design/docs/08-bugs.md`), relevés pendant C-08 ; inventaire du code du
2026-10-12 ; décisions : D35, D36, D37.
Statut : Livré (2026-10-12), sur la branche `fix/session-tokens` partie de `main`.
Dépend de : aucun.
Taille : M.

## 1. Comportement attendu

- Étant donné une personne connectée, alors elle détient deux jetons : un jeton d'accès, qui ouvre
  les routes de l'API, et un jeton de rafraîchissement, qui ne sert qu'à obtenir un nouveau jeton
  d'accès. Chacun dit ce qu'il est (`typ` : `access` ou `refresh`).
- Étant donné un jeton de rafraîchissement, quand il est présenté à une autre route que
  `POST /api/v1/auth/refresh`, alors l'API répond 401.
- Étant donné un jeton d'accès, quand il est présenté à `POST /api/v1/auth/refresh`, alors l'API
  répond 401 : un jeton d'accès ne se renouvelle pas lui-même.
- Étant donné un rafraîchissement accepté, alors l'API rend un nouveau jeton d'accès et le même jeton
  de rafraîchissement : une session finit à l'expiration de son jeton de rafraîchissement (7 jours
  après la connexion par défaut), qu'elle rafraîchisse ou non. C'est déjà ce que vit une personne
  aujourd'hui, le navigateur gardant son premier jeton de rafraîchissement ; c'est désormais l'API
  qui l'impose.
- Étant donné plusieurs requêtes qui reçoivent « jeton expiré » en même temps, dans l'une ou l'autre
  interface, alors un seul rafraîchissement part, avec le jeton de rafraîchissement, et chaque
  requête repart avec le nouveau jeton d'accès. Aucune ne reste en attente.
- Étant donné un rafraîchissement qui échoue parce que la session est finie (401), alors les requêtes
  qui l'attendaient échouent et le jeton est retiré comme à son expiration ; une fois C-08 fusionné,
  le flux des notifications s'arrête aussi (`TokenService.signedOut`). Un rafraîchissement qui échoue pour une
  autre raison (réseau, 502) laisse le jeton : la requête suivante réessaie.
- Étant donné un jeton émis avant ce ticket, sans type, alors l'API le traite comme un jeton d'accès
  expiré et l'accepte une fois sur `/auth/refresh`, qui rend une paire typée finissant à
  l'expiration de l'ancien jeton : personne n'est déconnecté (D36).
- Étant donné une connexion par CAS ou par LTI, alors elle reçoit des jetons typés sans autre
  changement : les deux passent par `AuthService.authenticate`.

> **Amendement à la livraison.** La transition change (D37) : un jeton sans type reste accepté comme
> jeton d'accès jusqu'à son expiration, et sur `/auth/refresh` jusqu'à son expiration aussi, chaque
> fois en rendant une paire typée qui finit avec lui. Le lire comme expiré cassait les routes
> publiques, qui servent un jeton expiré comme personne sans le dire : le lecteur refusait la réponse
> d'un élève, et la page de démonstration remplaçait la session par un compte de démonstration. Pour
> la même raison, le navigateur renouvelle **avant** d'envoyer un jeton d'accès expiré ou sans type
> (`TokenService.fresh`), et garde le renouvellement après un 401 pour une horloge décalée. Un jeton
> d'accès renouvelé ne dépasse jamais l'expiration de son jeton de rafraîchissement. Un
> renouvellement qui ne répond pas cède au bout de 15 s ; une connexion ou une déconnexion pendant un
> renouvellement l'emporte sur lui ; le flux GraphQL de `main` reprend un jeton frais à chaque
> reconnexion. Les erreurs de la garde du rafraîchissement sont des `UnauthorizedResponse`.

## 2. Tests à écrire d'abord

- API, unitaires : `authenticate` signe un jeton `access` à la durée d'accès et un jeton `refresh` à
  la durée de rafraîchissement ; le rafraîchissement rend un jeton d'accès neuf et le jeton de
  rafraîchissement reçu, à l'expiration inchangée ; la stratégie des routes refuse un jeton
  `refresh`, celle du rafraîchissement refuse un jeton `access` ; un jeton sans type suit la
  transition retenue.
- API, de bout en bout (`createE2EApp`, nouvelle cible `test:e2e` de `core-server`) : une route
  protégée accepte le jeton d'accès et refuse le jeton de rafraîchissement ; `POST /auth/refresh`
  accepte le jeton de rafraîchissement et refuse le jeton d'accès ; le jeton de rafraîchissement
  rendu est celui reçu. `createAuthenticatedUser` signe des jetons `access`.
- Navigateur (`HttpTestingController`, avec le vrai `AuthInterceptor` et le vrai
  `RemoteTokenProvider`) : le rafraîchissement part avec le jeton de rafraîchissement en Bearer ;
  deux requêtes expirées en même temps ne déclenchent qu'un rafraîchissement et repartent toutes deux
  avec le nouveau jeton ; une requête envoyée pendant un rafraîchissement attend et part avec le
  nouveau jeton ; un rafraîchissement refusé fait échouer les requêtes en attente au lieu de les
  bloquer, et retire le jeton ; `TokenService.refresh` appelé deux fois de suite ne fait qu'une
  requête.

> **Amendement à la livraison.** Le test de bout en bout devient une spec HTTP sans base de données
> (`auth.controller.http.spec.ts`) : le vrai `AuthModule`, ses stratégies, ses gardes et le filtre
> d'erreurs, de vrais jetons signés, et seulement les utilisateurs simulés, dans la cible `test` de
> `core-server`. Une spec e2e de `core-server` sur `createE2EApp` aurait créé une dépendance
> circulaire (le harnais e2e dépend de `core-server`), et l'authentification n'a pas besoin de la base.
> Côté navigateur, les specs traversent les vraies classes (intercepteur, `TokenService`,
> `RemoteTokenProvider`) sur `HttpTestingController`.

## 3. État actuel du code

Vérifié le 2026-10-12, sur `feat/realtime-sse` (les fichiers d'authentification sont les mêmes que
sur `main`, sauf `token.service.ts` et `event-stream.ts`, ajoutés ou modifiés par C-08).

- `libs/core/server/src/lib/auth/auth.service.ts` (`authenticate`) : les deux jetons portent
  `{ sub, username }`, le même secret, et ne diffèrent que par `expiresIn`.
- `libs/core/server/src/lib/auth/auth.controller.ts` (`refresh`) : derrière la garde globale, il
  rend `authenticate(req.user...)`, une paire neuve dont le jeton de rafraîchissement repart pour
  7 jours. Tout jeton valide y donne donc une session sans fin.
- `libs/core/server/src/lib/auth/strategies/jwt.strategy.ts` : `validate` ne lit que `sub`, sans
  regarder le type ; `auth/guards/auth.guard.ts` traduit `TokenExpiredError` en
  `UnauthorizedResponse(TOKEN_EXPIRED_ERROR_CODE)`.
- Durées : `config/configuration.ts` met 15 min et 7 jours par défaut, mais
  `templates/.env.example` et le tableau du `README.md` donnent 7 jours aux deux jetons ; le `.env`
  de développement aussi.
- `libs/core/testing/e2e-server/src/lib/test-auth.module.ts` (`createAuthenticatedUser`) signe
  `{ sub, username }` sans type ni expiration.
- `libs/core/browser/src/lib/auth/interceptors/auth.interceptor.ts` : pendant un rafraîchissement
  (`isRefreshing`), il envoie le jeton de rafraîchissement comme Bearer à toutes les requêtes ; les
  requêtes expirées pendant ce temps attendent `token$`, qui n'est jamais alimenté (B26).
- `libs/core/browser/src/lib/auth/providers/remote-token.provider.ts` (`refresh`) : il poste
  `/api/v1/auth/refresh/` par `HttpClient`, donc avec le Bearer que l'intercepteur choisit, vérifie
  l'expiration du jeton de rafraîchissement dans le navigateur, et ne garde que le nouveau jeton
  d'accès.
- `libs/core/browser/src/lib/auth/api/token.service.ts` : chaque appel de `refresh` fait sa propre
  requête. Le client SSE de C-08 (`http/event-stream.ts`) l'appelle quand son flux reçoit « jeton
  expiré » ; il ne marche aujourd'hui que grâce à B25, l'intercepteur rejouant la requête de
  rafraîchissement avec un jeton d'accès.

## 4. Changements

- API :
  - `authenticate` signe `typ: 'access'` et `typ: 'refresh'`.
  - Une stratégie `jwt-refresh` et sa garde, pour `POST /auth/refresh` seulement (la route devient
    `@Public()` pour la garde globale et prend la sienne).
  - Le rafraîchissement rend un jeton d'accès neuf et le jeton de rafraîchissement reçu.
  - La stratégie `jwt` des routes refuse tout jeton qui n'est pas `access`.
  - `createAuthenticatedUser` signe des jetons `access`.
- Navigateur, pour les deux interfaces :
  - `TokenService.refresh` partage un seul rafraîchissement en cours entre tous ses appelants
    (l'intercepteur et le flux SSE).
  - `RemoteTokenProvider.refresh` met lui-même le jeton de rafraîchissement en Bearer.
  - `AuthInterceptor` laisse passer une requête qui porte déjà un en-tête `Authorization`. Sur
    « jeton expiré », il attend `TokenService.refresh()` puis rejoue la requête. `isRefreshing` et
    `token$` partent.
  - Un rafraîchissement refusé (401) retire le jeton.
- Configuration et docs : le modèle d'environnement et le README donnent 15 min au jeton d'accès
  (D36) ; les fiches B25 et B26 renvoient à ce ticket.
- Branche partie de `main`, comme le correctif B21 (PR #120) : l'interface actuelle en production en
  profite sans attendre la nouvelle. Le seul conflit attendu avec C-08 est `token.service.ts`
  (`signedOut` d'un côté, le rafraîchissement partagé de l'autre).

## 5. Hors scope

La révocation des jetons à la déconnexion (la route `signout` de l'API n'existe pas). La limite de
tentatives de connexion (B23). La rotation des jetons de rafraîchissement et les sessions qui
s'allongent à l'usage. Le stockage des jetons (IndexedDB et `localStorage`) plutôt que des cookies
`httpOnly`.

## 6. Points ouverts

Aucun : la transition des jetons sans type et la durée du jeton d'accès sont tranchées par D36, en
faveur d'une transition que personne ne remarque.

## 7. Definition of Done

- [x] Les tests du §2 passent ; les specs e2e et d'intégration passent en CI.
- [x] Un jeton de rafraîchissement n'ouvre aucune route hors `/auth/refresh`, un jeton d'accès ne
      rafraîchit pas, et une session finit à l'expiration de son jeton de rafraîchissement.
- [ ] Vérifié sur l'application qui tourne, avec un jeton d'accès court (`JWT_ACCESS_TOKEN_LIFETIME`
      à 1 min en développement) : la page et le flux des notifications continuent après
      l'expiration, dans les deux interfaces ; plusieurs onglets et des requêtes simultanées ne
      bloquent pas ; la connexion par CAS et par LTI marche toujours.
- [ ] B25 et B26 cochés à la fusion.

> **Amendement à la livraison.** Non vérifié sur l'application qui tourne : il faut l'API de cette
> branche, avec `JWT_ACCESS_TOKEN_LIFETIME` à 1 min. Les specs couvrent l'expiration, le
> renouvellement partagé, le refus et la transition, sur de vrais jetons. Les specs e2e des autres
> bibliothèques passent par `createAuthenticatedUser`, qui signe désormais des jetons `access`, et
> tournent en CI. Restent à savoir : un client externe qui rafraîchirait avec son jeton d'accès
> (l'aperçu « pour VS Code » reçoit les deux jetons dans l'adresse) reçoit désormais un 401 ; aucun
> n'existe dans les dépôts cisstech. À la fusion avec C-08 : `TokenService.remove` y émet
> `signedOut`, ce qu'un renouvellement refusé déclenche désormais, et le client SSE gagne à passer par
> `fresh()` et `renewedAfter()` plutôt que par `refresh()`, dont il double la limite de 15 s.
> `POST /auth/reset-password` rend une nouvelle session à tout porteur d'un jeton d'accès d'un compte
> sans mot de passe : c'est B27, hors de ce ticket.
