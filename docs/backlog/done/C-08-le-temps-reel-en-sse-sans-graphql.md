# C-08 : Le temps réel en SSE, sans GraphQL

Source : la livraison de C-04 (2026-10-09) ; décisions : D29, D31, D33, D35.
Statut : Livré (2026-10-12).
Dépend de : C-04.
Taille : L.

## 1. Comportement attendu

- Étant donné une personne connectée, dans l'une ou l'autre interface, alors son compteur de non lues
  et ses nouvelles notifications arrivent en direct comme aujourd'hui, par un flux SSE
  (`GET /api/v1/notifications/stream`) authentifié comme toute route ; aucune interface n'ouvre de
  WebSocket.
- Étant donné une coupure du réseau ou un redémarrage de l'API, alors le flux se rouvre seul, avec un
  délai qui croît, et le compteur est relu à la reconnexion.
- Étant donné le proxy, alors le flux n'est ni mis en tampon ni coupé au bout de 60 s : l'API envoie
  un battement toutes les 25 s et demande `X-Accel-Buffering: no`.
- Étant donné plusieurs instances de l'API, alors un événement publié sur l'une atteint le flux ouvert
  sur une autre, par Redis comme aujourd'hui.
- Étant donné les notifications, alors elles se lisent et s'écrivent en REST, avec la personne dans
  chaque condition : liste paginée (`GET /api/v1/notifications`, `excludeSignals`, `offset`, `limit`),
  compteur des non lues (`GET /api/v1/notifications/unread-count`), marquer comme lue
  (`PATCH /api/v1/notifications/:id/read`), tout marquer (`PATCH /api/v1/notifications/read`),
  supprimer (`DELETE /api/v1/notifications/:id`), tout supprimer (`DELETE /api/v1/notifications`).
- Étant donné l'ancienne interface, alors le tiroir, le lecteur (`paginate(1)`) et le suivi d'une
  activité (`paginate(5)`) se comportent comme avant : `NotificationService` garde ses méthodes
  publiques, réécrites sur REST et SSE.
- Étant donné le dépôt, alors GraphQL n'y est plus : ni module ni résolveur dans l'API, ni Apollo dans
  le navigateur, ni génération de types, ni `schema.gql`, ni l'étape de CI qui les produit.

> **Amendement à la livraison.** Le flux se ferme quand le jeton d'accès qui l'a ouvert expire, et le
> navigateur le rouvre après avoir rafraîchi le jeton (D35) : une connexion qui a duré se rouvre
> aussitôt, une connexion qui tombe tout de suite attend 1, 2, 5, 10 puis 30 s, à 20 % près pour
> étaler les onglets, et un flux muet depuis une minute (battements compris) est rouvert. Ce qui
> arrive pendant la réouverture serait perdu : chaque réouverture émet un événement
> d'ouverture (`kind: 'opened'`), et `paginate` relit alors sa première page pour mettre en tête ce qu'il a manqué,
> si bien que le lecteur et le suivi d'une activité voient les signaux envoyés entre deux
> connexions. Le panneau de la nouvelle interface ne relit pas sa liste : le compteur, envoyé à
> chaque ouverture, reste juste, et une notification arrivée pendant la réouverture paraît au
> prochain chargement. Le flux s'arrête aussi quand la personne se déconnecte dans l'onglet
> (`TokenService.signedOut`). `NotificationService` garde les méthodes que les écrans appellent ;
> `listUnreads`, que rien n'appelait, part, et `list`, `unreadCount` et `changes` s'ajoutent.

## 2. Tests à écrire d'abord

- API : le contrôleur REST de bout en bout (`createE2EApp`) : la personne dans chaque condition, les
  pages, `excludeSignals`, le compteur sans signaux. Le flux : il ne porte que les événements de la
  personne, envoie le compteur à l'ouverture, bat toutes les 25 s, se ferme avec la connexion
  (unitaire) ; son en-tête `text/event-stream` (bout en bout).
- Navigateur : le client SSE sur `fetch` (lecture des événements, reconnexion avec délai, arrêt à la
  déconnexion) ; `NotificationService` sur `HttpTestingController` (pages, compteur, nouvelle
  notification en tête) ; `NotificationsApi` de la nouvelle interface, que les classes générées
  empêchaient de tester sous Jest.
- Les stores, vues et panneaux de C-04 ne changent pas : leurs tests restent verts tels quels.

> **Amendement à la livraison.** Les specs e2e du contrôleur (`createE2EApp`, PostgreSQL) et
> d'intégration du pubsub (deux instances sur un vrai Redis) sont écrites et typées, mais lancées
> par la CI seulement : elles démarrent des conteneurs. Le client SSE est testé sur un `fetch`
> simulé, sans le `RemoteTokenProvider` réel (voir B25 et B26). Seule l'horloge de la spec du
> panneau de C-04 change : elle prenait l'heure réelle, et « il y a 2 h » devenait « hier » entre
> minuit et 2 h.

## 3. État actuel du code

Vérifié le 2026-10-09.

- API : `libs/core/server/src/lib/graphql/graphql.module.ts` (Apollo, abonnements `graphql-ws`, jeton
  lu dans `connectionParams`). Résolveurs : `notification.resolver.ts` (requêtes, mutations, abonnement
  `onChangeNotifications`, `NotificationChangeResolver.unreadCount`) et
  `libs/core/server/src/lib/users/user.resolver.ts`, qu'aucun client n'appelle : le seul document
  GraphQL du navigateur est `libs/feature/notification/browser/src/lib/models/notification.graphql.ts`.
- `PubSubService` (`libs/core/server/src/lib/pubsub`) s'appuie sur `RedisPubSub` de
  `graphql-redis-subscriptions` ; le suivi de présence des cours (`course-monitor-presence`) s'en sert
  aussi.
- Navigateur : `libs/core/browser/src/lib/graphql/` (Apollo, `HttpLink` sur `/api/graphql`,
  `GraphQLWsLink` sur `wss://…/api/graphql`, pagination relay), fourni par les deux interfaces.
  `NotificationService` sert le tiroir, le lecteur (`player-activity.component.ts:228`) et le suivi
  (`apps/web/src/app/pages/activities/monitor/monitor.presenter.ts:98`). Dans la nouvelle interface,
  seul `apps/web/src/next/shell/notifications/notifications-api.ts` connaît GraphQL.
- Outillage : `codegen.ts`, `yarn graphql:generate` (types dans `.graphql/` et
  `*.graphql.generated.ts`, ignorés par git), `./bin/graphql/generate.sh` dans
  `.github/workflows/ci.yml`, `schema.gql` réécrit par l'API à son démarrage. Dépendances :
  `@nestjs/graphql`, `@nestjs/apollo`, `@apollo/server`, `@apollo/client`, `apollo-angular`,
  `graphql`, `graphql-ws`, `graphql-relay`, `graphql-type-json`, `graphql-iso-date`,
  `graphql-redis-subscriptions`, `@graphql-codegen/*`.
- Proxy : `.docker/nginx/nginx.dev.conf` et `nginx.prod.conf` passent `/api/` avec `Upgrade` et
  `proxy_read_timeout 60s`, sans couper la mise en tampon.
- Le jeton est un Bearer dans IndexedDB (`TokenService`) : `EventSource` n'envoie pas d'en-tête.

## 4. Changements

- API (`libs/feature/notification/server`) : `notification.controller.ts`, les routes REST du §1, ses
  DTO `implements` les interfaces de `common` ; le flux `@Sse('stream')` lit `PubSubService` pour la
  personne, envoie le compteur à l'ouverture puis un battement. Le résolveur et les modèles GraphQL
  partent, comme `GraphQLModule`, `libs/core/server/src/lib/graphql/` et `user.resolver.ts`.
- Contrats (`libs/feature/notification/common`) : `NotificationChange` (compteur, nouvelle
  notification) ; la page est une `ListResponse`.
- Navigateur : un client SSE sur `fetch` dans `@platon/core/browser/shared` (jeton, reconnexion,
  arrêt) ; `NotificationService` réécrit sur `HttpClient` et ce client, mêmes méthodes publiques ;
  l'entrée légère exporte le service et ses modèles à la place des opérations générées ;
  `NotificationsApi` s'appuie dessus. `GraphQLModule` quitte les deux interfaces.
- Outillage : `codegen.ts`, les scripts `graphql:*`, `bin/graphql/`, l'étape de CI, `schema.gql`,
  `.graphql/` et les dépendances GraphQL partent. nginx : une `location` pour le flux, sans tampon,
  avec un long délai de lecture.
- Règles : `back/nestjs.md` (REST est l'API, le temps réel passe par SSE) et `CLAUDE.md`.

> **Amendement à la livraison.** API : `eventStream(req, events)` dans `libs/core/server` porte ce
> que tout flux partage (commentaire d'ouverture, battement, fin à l'expiration du jeton, fin
> journalisée, sans message au client, quand les événements échouent). `PubSubService` passe sur
> `ioredis` : un canal que Redis refuse est redemandé au prochain abonné et à la reconnexion, un
> abonné qui échoue ne prive pas les autres, et l'arrêt coupe les connexions sans attendre. La
> liste rend 50 notifications au plus quand la requête ne dit pas combien, et refuse ce qui n'est
> pas un nombre, avec deux décorateurs réutilisables, `@ToBoolean()` et `@ToInt()`, dans
> `libs/core/server` ; `markAsUnread`, sans route, part ; la suppression porte la personne dans la
> condition (B21). Navigateur : le client SSE lit lui-même le JSON de chaque événement et ses dates,
> avec le convertisseur de l'intercepteur (`convertIsoDates`), comme `HttpClient` le fait pour une
> réponse ; `streamRequest`, un lecteur SSE que rien n'appelait, part ; le lecteur
> d'activité se désabonne à sa fermeture, ce qui laissait le flux ouvert et ses gestionnaires
> actifs. Outillage : `@as-integrations/express5` et `cross-env` partent avec GraphQL ; nginx ouvre
> HTTP/2 en développement, sinon quelques onglets ouverts prennent les six connexions qu'un
> navigateur ouvre vers un hôte. `CLAUDE.md` ne parlait pas de GraphQL et ne change pas.

## 5. Hors scope

Le temps réel d'autres domaines : le suivi de présence garde son canal Redis. Les préférences de
notification.

## 6. Points ouverts

1. Authentifier le flux : l'en-tête `Authorization` sur un client `fetch` (proposé : les gardes ne
   changent pas, le jeton ne passe pas dans l'adresse ni dans les journaux du proxy), ou un ticket
   court dans l'adresse pour garder `EventSource`.
2. `PubSubService` : garder `graphql-redis-subscriptions`, un paquet GraphQL pour un simple pub/sub
   Redis, ou passer à `ioredis` (proposé).
3. Le jeton expire pendant un flux ouvert : fermer et rouvrir le flux après son rafraîchissement
   (proposé), ou le laisser courir jusqu'à sa fin.

> **Amendement à la livraison.** Les trois points sont tranchés comme proposé (D35).

## 7. Definition of Done

- [x] Les tests du §2 passent, ceux de C-04 sans changement.
- [x] Plus aucune dépendance GraphQL ni Apollo, plus aucune WebSocket ouverte par une interface.
- [x] Le compteur et l'arrivée en direct vérifiés dans Chrome à travers nginx, dans les deux
      interfaces, après deux minutes sans événement et après un redémarrage de l'API.
- [ ] Le lecteur et le suivi d'une activité réagissent aux signaux comme avant.

> **Amendement à la livraison.** Vérifié le 2026-10-12 dans Chrome sur `https://localhost`, à travers
> nginx, avec de vraies notifications (une ligne en base et son message Redis) : le flux passe en
> HTTP/2 et en `text/event-stream` dans les deux interfaces ; la cloche, le badge et le compteur de
> l'API montent ensemble à chaque notification, y compris après deux minutes sans événement ;
> pendant le redémarrage de l'API, nginx répond 502, les deux interfaces rouvrent leur flux en deux
> secondes, et le compteur rattrape la notification enregistrée pendant la coupure ; le panneau et le
> tiroir mettent en tête une notification qui arrive pendant qu'ils sont ouverts. La seule WebSocket
> ouverte est celle du serveur de développement d'Angular (`ng-cli-ws`). nginx ne transmet pas
> `X-Accel-Buffering` au navigateur : il le lit lui-même. La dernière case reste ouverte : le lecteur
> et le suivi d'une activité n'ont pas été rejoués dans un navigateur ; leur `paginate` est celui du
> tiroir, vu en direct, et ses specs couvrent les signaux et la relecture à la réouverture.
