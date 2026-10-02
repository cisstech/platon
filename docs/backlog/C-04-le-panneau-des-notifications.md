# C-04 : Le panneau des notifications

Source : `design/flows/accueil-etudiant/02-notifications` et son annotation,
`design/docs/06-faisabilite.md` (cadre et navigation), inventaire du code du 2026-09-29 ; décisions :
D6, D19, D21.
Statut : À faire.
Dépend de : C-02, C-06, F-04.
Taille : M.

## 1. Comportement attendu

- Étant donné l'entrée Notifications de la couverture (ou la cloche sur mobile), alors elle montre le
  nombre de non lues dès le chargement, puis le tient à jour en direct.
- Étant donné l'entrée, quand on l'actionne, alors le panneau « Notifications » s'ouvre à côté de la
  couverture, en bas (380 px) : en tête, le titre, « Tout marquer comme lu » et Fermer ; `Échap`, Fermer
  ou un clic ailleurs le ferment et rendent le focus à l'entrée.
- Étant donné une notification, alors elle montre une icône de tête, un titre, puis le cours ou la
  ressource concernés et une date relative (« il y a 2 h », « hier à 17 h », « 12 septembre »).
  Une notification non lue a un filet d'encre à gauche et un titre en gras, pas de pastille.
- Étant donné une notification, quand on la choisit, alors elle est marquée comme lue et mène à
  l'objet concerné, avec les mêmes cibles qu'aujourd'hui (cours, correction, activité, ressource).
- Étant donné une invitation à une ressource, alors elle garde ses actions Accepter et Décliner.
- Étant donné une nouvelle notification pendant que le panneau est ouvert, alors elle apparaît en
  tête et le compteur suit.
- Étant donné une longue liste, alors les suivantes se chargent par pages de 20, comme aujourd'hui.

## 2. Tests à écrire d'abord

- Fonctions de vue pures : titre, ligne de contexte et date relative de chaque type, cible du clic.
- Store du panneau : compteur initial, mise à jour par l'abonnement, marquer comme lu, tout marquer,
  page suivante.
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
- `@platon/feature/notification/browser` n'a qu'une entrée, qui exporte aussi le tiroir et la liste
  ng-zorro ; les bibliothèques de cours et de ressource y prennent les jetons des parseurs. Aucun test
  côté navigateur.

## 4. Changements

- Entrées légères (D21) : le service, les modèles et les jetons de notification ; les parseurs de
  cours et de ressource.
- Bibliothèque : `pl-notification-item` (icône, titre, contexte, date, état lu) et le panneau.
- Nouvelle interface : le store du panneau (compteur initial par `totalCount`, abonnement, pages) ;
  un rendu texte pour les événements de ressource, à la place du composant ng-zorro.

## 5. Hors scope

Les préférences de notification (elles n'existent pas) ; `markAsUnread`, que l'API a mais que
l'interface n'utilise pas.

## 6. Points ouverts

- Supprimer une notification et « Tout supprimer » existent aujourd'hui, pas dans le wireframe. On
  les garde (dans un menu d'actions de la notification et du panneau) ou on les retire ?
- Le texte des notifications : reprendre celui des parseurs, ou le réécrire au format du wireframe
  (titre court, puis le cours et la date) ?
- `EXERCISE-CHANGES` et `MODERATION-ACTIVITY-CHANGES` n'ont pas de rendu utile aujourd'hui : les
  afficher, et avec quel texte ?
- Le panneau sur mobile n'est pas dessiné. Proposition : pleine hauteur, depuis la droite, comme un
  panneau.

## 7. Definition of Done

- [ ] Les tests du §2 passent.
- [ ] Le compteur est juste dès le chargement (B20 corrigé dans la nouvelle interface).
- [ ] Chaque type connu a son rendu et sa cible, ou un écart décidé.
- [ ] Le démarrage de la nouvelle interface reste sans code ng-zorro, Material ni Monaco.
