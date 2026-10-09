# C-04 : Le panneau des notifications

Source : `design/flows/accueil-etudiant/02-notifications` (bureau et téléphone) et ses annotations,
révisés après les quatre tours de critique,
`design/docs/06-faisabilite.md` (cadre et navigation), inventaire du code du 2026-09-29 ; décisions :
D6, D19, D21, D29.
Statut : Livré (2026-10-09).
Dépend de : C-02, C-06, F-04.
Taille : M.

## 1. Comportement attendu

- Étant donné l'entrée Notifications de la couverture (ou la cloche sur mobile), alors elle montre le
  nombre de non lues dès le chargement, puis le tient à jour en direct.
- Étant donné l'entrée, quand on l'actionne, alors le panneau « Notifications » s'ouvre à côté de la
  couverture, en bas (380 px) : en tête, le titre, « Tout marquer comme lu » et Fermer ; `Échap`, Fermer
  ou un clic ailleurs le ferment et rendent le focus à l'entrée.
- Étant donné le téléphone, quand on touche la cloche de la barre du haut, alors les notifications
  s'ouvrent en écran entier : la flèche de retour et `Échap` le ferment, « Tout marquer comme lu »
  reste sous la barre, à portée de pouce, et chaque notification fait au moins 64 px de haut.
- Étant donné une notification, alors elle dit un fait vrai au moment où on la lit, en titre court
  (« La correction de TP 3 : conditions est disponible »), puis le cours ou la ressource concernés et
  une date relative (« il y a 2 h », « hier à 17 h », « 12 septembre »). Son icône de tête prend la
  teinte du cours concerné.
- Étant donné une notification non lue, alors elle a un point graphite à gauche, un fond à peine
  teinté et un titre en gras ; un lecteur d'écran entend « Non lue ».
- Étant donné une notification, quand on la choisit, alors elle est marquée comme lue et mène à
  l'objet concerné, avec les mêmes cibles qu'aujourd'hui (cours, correction, activité, ressource).
- Étant donné une invitation à une ressource, alors elle garde ses actions Accepter et Décliner.
- Étant donné une nouvelle notification pendant que le panneau est ouvert, alors elle apparaît en
  tête et le compteur suit.
- Étant donné une longue liste, alors les suivantes se chargent par pages de 20, comme aujourd'hui.
- Étant donné une notification `EXERCISE-CHANGES` ou `MODERATION-ACTIVITY-CHANGES`, alors le panneau
  ne l'affiche pas et le compteur ne la compte pas : ce sont des signaux pour le suivi d'une activité
  et pour le lecteur (D29).
- Étant donné le menu du panneau (« Plus d'actions », en tête), quand on choisit « Tout supprimer »,
  alors une confirmation nomme le nombre de notifications supprimées et dit que c'est définitif ; il
  n'y a pas de suppression d'une notification seule (D29).

## 2. Tests à écrire d'abord

- Fonctions de vue pures : titre, ligne de contexte et date relative de chaque type, cible du clic.
- Store du panneau : compteur initial, mise à jour par l'abonnement, marquer comme lu, tout marquer,
  page suivante, signaux écartés de la liste, tout supprimer après confirmation.
- API : `unreadCount` ne compte pas les deux types de signaux ; la liste les garde, le lecteur les
  lit par `paginate(1)`.
- Panneau : ouverture, fermeture par `Échap` et Fermer avec retour du focus, notification non lue.
- Stories : liste mêlée lue et non lue, vide, chargement, erreur, en clair et en sombre.

## 3. État actuel du code

Vérifié le 2026-09-29.

- Ancienne interface : tiroir ng-zorro à droite
  (`libs/feature/notification/browser/src/lib/components/notification-drawer/`), liste `nz-list`
  (`notification-list/`), ouvert par la cloche de la barre (`widgets/toolbar/toolbar.component.html:58`).
- `NotificationService` (`libs/feature/notification/browser/src/lib/api/notification.service.ts`),
  sur Apollo : `paginate(20)` (connexion paginée par curseur), `markAsRead`, `markAllAsRead`,
  `deleteNotification`, `deleteAllNotifications`, et l'abonnement `OnChangeNotifications`
  (`unreadCount`, `newNotification`). Le compteur part de 0 et ne bouge qu'au premier événement
  (B20) ; `notifications(filters: { unread: true })` renvoie un `totalCount` qui peut donner le
  compte initial.
- Types (`data.type`) : dix côté cours (`libs/feature/course/common/src/lib/notification.model.ts`),
  deux côté ressource (`libs/feature/resource/common/src/lib/models/notification.model.ts`).
- Rendu : jeton multiple `NOTIFICATION_PARSER` ; chaque parseur donne l'icône, le contenu (texte ou
  composant), les actions et le clic. Les parseurs de cours ne rendent que du texte ; celui des
  événements de ressource rend un composant ng-zorro (`event-item`), celui des invitations porte
  Accepter et Décliner. `EXERCISE-CHANGES` n'a pas de rendu (`console.error`), et
  `MODERATION-ACTIVITY-CHANGES` a un contenu vide.
- Aujourd'hui aussi : Supprimer par notification, « Tout supprimer », « Charger plus ».
- Le lecteur (`player-activity.component.ts:228`) lit le dernier signal `MODERATION-ACTIVITY-CHANGES`
  par `paginate(1)` : écarter les signaux de la liste côté serveur le casserait. `unreadCount`
  (`notification.service.ts:149`, côté serveur) compte toutes les non lues, signaux compris.
- Défaut de sécurité : `NotificationService.delete(userId, ids)` côté serveur supprime par
  identifiant sans vérifier `userId` ; une personne peut supprimer les notifications d'une autre si
  elle connaît leurs identifiants (B21, `design/docs/08-bugs.md`). À corriger pour les deux
  interfaces.
- `@platon/feature/notification/browser` n'a qu'une entrée, qui exporte aussi le tiroir et la liste
  ng-zorro ; les bibliothèques de cours et de ressource y prennent les jetons des parseurs. Aucun test
  côté navigateur.

## 4. Changements

- Entrées légères (D21) : le service, les modèles et les jetons de notification ; les parseurs de
  cours et de ressource.
- Bibliothèque : `pl-notification-item` (icône, titre, contexte, date, état lu) et le panneau.
- Nouvelle interface : le store du panneau (compteur initial par la requête `unreadCount`, abonnement, pages) ;
  le texte de chaque type au format du wireframe, dans des fonctions de vue (les parseurs gardent
  l'icône et la cible du clic) ; un rendu texte pour les événements de ressource, à la place du
  composant ng-zorro ; l'écran entier du téléphone.
- API : `unreadCount` écarte `EXERCISE-CHANGES` et `MODERATION-ACTIVITY-CHANGES` (D29). La
  suppression limitée aux notifications de la personne (B21) est corrigée à part, PR #120.

## 5. Hors scope

Les préférences de notification (elles n'existent pas) ; `markAsUnread`, que l'API a mais que
l'interface n'utilise pas.

## 6. Points ouverts

Aucun : tranchés le 2026-10-08 par D29. Pour mémoire, les questions étaient :

- Supprimer une notification et « Tout supprimer » existent aujourd'hui, pas dans le wireframe. On
  les garde (dans un menu d'actions de la notification et du panneau) ou on les retire ?
- `EXERCISE-CHANGES` et `MODERATION-ACTIVITY-CHANGES` n'ont pas de rendu utile aujourd'hui : les
  afficher, et avec quel texte ?

## 7. Definition of Done

- [x] Les tests du §2 passent.
- [x] Le compteur est juste dès le chargement (B20 corrigé dans la nouvelle interface).
- [x] Chaque type connu a son rendu et sa cible, ou un écart décidé.
- [x] Le démarrage de la nouvelle interface reste sans code ng-zorro, Material ni Monaco.

> **Amendement à la livraison.** API : `unreadCount` écarte les signaux, que la bibliothèque des cours
> déclare au démarrage (`declareSignals`, liste unique `COURSE_SIGNAL_NOTIFICATIONS` de
> `@platon/feature/course/common`) : la bibliothèque des notifications ne connaît aucun type de cours.
> Le compteur initial vient d'une requête `unreadNotificationCount` (le `totalCount` des non lues
> compte les signaux). La liste reçoit un filtre `excludeSignals`, qui partage sa condition avec le
> compteur, pour des pages de 20 vraies notifications ; sans lui, elle garde les signaux que le lecteur
> lit par `paginate(1)`. Un filtre envoyé à `null` se lit comme absent : `toBoolean` le lisait comme
> vrai, et la nouvelle interface n'aurait montré que les non lues. Le compteur de l'abonnement écarte
> aussi les signaux dans l'ancienne interface.

> **Amendement à la livraison.** Entrées légères : `@platon/feature/notification/browser/shared`
> (opérations GraphQL générées, modèles) ; les parseurs et leurs jetons restent dans l'entrée
> principale, car ils importent ng-zorro et `@cisstech/nge/ui/icon`, et la nouvelle interface a ses
> propres fonctions de vue. `@platon/feature/resource/browser/shared` : `ResourceService`,
> `RESOURCE_PROVIDERS` (les liaisons HTTP) et les libellés de statut ; les parseurs de l'ancienne
> interface passent dans `RESOURCE_NOTIFICATION_PROVIDERS`. `@platon/core/browser/shared` gagne les
> utilitaires HTTP. La nouvelle interface lit les notifications hors du cache Apollo et son store tient
> la liste ; le `NotificationService` partagé reste celui de l'ancienne interface.

> **Amendement à la livraison.** Textes : les acteurs des événements de ressource ne sont connus que
> par leur identifiant ; les titres s'en passent (« Nouveau membre dans Graphes », « Nouvelle
> ressource : Graphes »). La ligne de contexte nomme le cours, ou le cercle de la ressource, et rien
> quand le titre nomme déjà l'objet. Les dates relatives passent par `Intl` dans la langue de
> l'application (`relativeTime` du design system) : « il y a 18 min », « il y a 2 h », « hier »,
> « jeudi », « 12 septembre » ; l'heure n'accompagne plus « hier » ni le jour (« hier à 17 h » au §1),
> car `Intl` écrit « 09 h » et ne fournit pas le « à ». La teinte d'un cours dérive de son identifiant
> (D32).

> **Amendement à la livraison.** Choisir une notification la marque comme lue, puis mène à sa cible
> une fois que l'API l'a enregistrée (une seconde au plus) : les cibles ne sont pas encore portées, le
> pont recharge la page et coupait la requête. Une notification non lue sans cible est un bouton qui la
> marque comme lue ; lue, elle informe seulement. Le clic du milieu et le Ctrl-clic l'ouvrent ailleurs
> et la marquent comme lue. Répondre à une invitation supprime sa notification, comme aujourd'hui ; la
> page suivante repart alors du début pour n'en sauter aucune. « Charger plus » devient « Afficher les
> plus anciennes ».

> **Amendement à la livraison.** « Tout supprimer » (menu « Plus d'actions », ton danger) nomme le
> total sans les signaux et efface aussi les signaux, qui ne portent rien que le serveur ne sache déjà :
> le lecteur recharge l'état de l'activité. Les actions de tête n'apparaissent que si elles
> s'appliquent. Quand le bouton qui avait le focus disparaît, le focus va à la notification voisine ou
> au bouton de fermeture, jamais à la page sous le dialogue. Une notification arrivée panneau ouvert
> est annoncée. « Réessayer » relance le chargement même s'il est resté pendant. Le panneau se ferme à
> chaque navigation et au passage de 840 px. Bibliothèque : `pl-notification-item`,
> `pl-notification-list`, `pl-notification-skeleton`, `pl-panel` (`popover` et `screen`). Les toasts
> passent désormais au-dessus des dialogues : une erreur levée panneau ouvert restait dessous.

> **Amendement à la livraison.** Vérifié dans Chrome sur le build de production, avec une API simulée
> (25 notifications, pages, invitation, échec de « Tout supprimer »), à 1280 et 390 px, en clair et en
> sombre, sans violation axe ; et sur l'application lancée avec `ypicker` (36 notifications, aucune
> donnée modifiée) : Échap, Fermer et un clic ailleurs rendent le focus à l'entrée ou à la cloche. Non
> vérifié : l'arrivée en direct dans un navigateur (l'API simulée n'a pas de WebSocket ; couverte par
> les tests) ; les specs d'intégration, qui démarrent un conteneur ; le coût du compteur sur un long
> historique de signaux, la condition lisant `data` ligne à ligne (à mesurer avec `EXPLAIN` avant
> d'indexer une colonne générée) ; Safari ; `NotificationsApi` n'a pas de spec, les classes GraphQL
> générées ne se construisant pas sous Jest.
