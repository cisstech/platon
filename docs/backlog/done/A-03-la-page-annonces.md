# A-03 : La page Annonces

Source : `design/flows/annonces` (bureau et téléphone) et ses annotations ;
`design/spec/flows/annonces.md` ; inventaire du code du 2026-10-12 ; décisions : D17, D20, D38, D42.
Statut : Livré (2026-10-13), sur la branche `feat/announcements`.
Dépend de : C-05, A-01, A-02.
Taille : M.

## 1. Comportement attendu

- Étant donné une personne de la nouvelle interface (élève, enseignant, administrateur, compte de
  démonstration), quand elle ouvre « Annonces » dans la couverture, alors `/announcements` s'ouvre
  sans rechargement : « Annonces », « Les nouvelles de la plateforme. », et les annonces actives qui
  lui sont destinées, de la plus récente à la plus ancienne. Chaque annonce montre l'icône de sa
  nature, son titre, son résumé et sa date.
- Étant donné une annonce, alors son icône dit sa nature, choisie par l'administrateur, en graphite
  comme toutes les autres : Notification `campaign`, Alerte `notifications`, Information `info`,
  Maintenance `construction`, Événement `event`, Avertissement `warning`, Annonce `auto_awesome` ;
  sans nature, `campaign`. Une annonce de nature Maintenance parle de la disponibilité du service.
- Étant donné une annonce encore dans sa fenêtre d'affichage, que la personne n'a ni ouverte ni
  fermée en bandeau, alors elle est non lue : un point après son titre et, pour les lecteurs d'écran,
  « Non lue : » avant. Passé sa fenêtre, une annonce n'est plus jamais non lue.
- Étant donné un ordinateur, alors la liste (340 px), sous la recherche, est à gauche et le détail de
  l'annonce ouverte à droite : son titre (`h2`, 22 px), « Publiée le 25 septembre 2026 par Sophie
  Lambert, pour tout le monde », puis son contenu. Chaque ligne de la liste est un bouton ; celle de
  l'annonce ouverte porte `aria-current`. La date d'une ligne est courte (« 27 sept. »), avec l'année
  quand ce n'est pas l'année en cours.
- Étant donné une personne qui arrive sans annonce désignée, alors l'ordinateur ouvre la plus
  récente non lue, sinon la plus récente ; le téléphone n'en ouvre aucune.
- Étant donné une personne qui arrive par « Lire l'annonce » (`/announcements?highlight=<id>`), alors
  la page s'ouvre sur cette annonce : dans le détail sur ordinateur, ouverte en place et amenée à
  l'écran sur téléphone. Une annonce désignée absente de la liste est ignorée : la page s'ouvre comme
  sans annonce désignée.
- Étant donné une annonce ouverte, alors elle devient lue : son point disparaît aussitôt, et le
  serveur l'enregistre pour la personne, sur tous ses appareils. Si l'enregistrement échoue, rien ne
  le dit : le point reviendra à la prochaine visite.
- Étant donné le public d'une annonce, alors le détail le dit : « pour tout le monde » sans rôle
  ciblé, sinon « pour les étudiants », « pour les enseignants », « pour les administrateurs », « pour
  les comptes de démonstration », « pour les candidats », reliés par des virgules et « et » (« pour
  les étudiants et les enseignants »). Sans auteur (compte supprimé), « Publiée le 25 septembre 2026,
  pour tout le monde ».
- Étant donné le contenu d'une annonce, alors il s'affiche dans la typographie de la page :
  paragraphes, titres, listes, cases à cocher, citations, code (en police à chasse fixe, sans
  couleurs), images, tableaux, séparateurs. Le HTML du contenu passe par l'assainisseur d'Angular,
  sans contournement. Une annonce sans contenu montre son résumé. Pendant le chargement du contenu,
  le détail montre son squelette ; en cas d'échec, « Cette annonce n'a pas pu être chargée » et
  « Réessayer ».
- Étant donné un téléphone (écran étroit), alors la liste est seule : chaque annonce est un titre
  `h2` qui contient un bouton de 44 px avec `aria-expanded` et un chevron, puis son résumé et sa
  date (« 27 septembre »). L'ouvrir remplace le résumé et la date par « Publiée le … » et montre le
  contenu en place ; en ouvrir une autre referme la précédente. Le focus reste sur le bouton.
- Étant donné la recherche, alors son champ porte le libellé « Rechercher une annonce », lu par les
  lecteurs d'écran, la loupe et le même texte en indication. Elle cherche dans le titre et le résumé
  de toutes les annonces de la personne, pas seulement de celles affichées, au fil de la frappe
  (300 ms). Sans résultat : « Aucune annonce ne correspond à « … ». » et « Effacer la recherche ».
- Étant donné plus de 20 annonces, alors la liste en montre 20, puis « Afficher les annonces plus
  anciennes » ajoute les 20 suivantes.
- Étant donné aucune annonce, alors « Aucune annonce pour le moment » et « Les nouvelles de la
  plateforme s'afficheront ici. ».
- Étant donné le chargement de la liste, alors des lignes squelettes, puis le message des 10 s et
  l'erreur avec « Réessayer » de `app-load-state` (C-05), comme les accueils.
- Étant donné le bandeau d'un accueil, alors il montre une seule annonce non lue : une annonce de
  nature Maintenance avant toute autre, sinon la plus récente. Le fermer la rend lue, sur tous les
  appareils de la personne, et elle ne revient pas ; « Lire l'annonce » ouvre la page sur elle, qui
  la rend lue.
- Étant donné une personne dans l'interface actuelle sur `/announcements`, alors « Revenir à la
  nouvelle interface » de l'avis du pont l'amène sur la page Annonces (chemin porté).

## 2. Tests à écrire d'abord

- API, intégration (`announcement.service.integration.spec.ts`) : la liste visible porte la date de
  lecture de la personne qui demande, jamais celle d'une autre ; marquer comme lue une annonce
  visible l'enregistre une fois, même appelé deux fois ; une annonce inactive ou destinée à un autre
  rôle n'est pas marquée.
- API, e2e (`announcement.controller.e2e.spec.ts`) : `PATCH /announcements/:id/read` répond 204 à
  l'élève, l'enseignant, l'administrateur et le compte de démonstration, 404 pour une annonce qui ne
  leur est pas destinée ou inactive, 403 au candidat, 401 sans session ; la liste suivante porte
  `readAt`.
- Bibliothèque navigateur : `AnnouncementService.markAsRead` appelle
  `PATCH /api/v1/announcements/:id/read` (`HttpTestingController`).
- `EditorjsViewerService` : la balise fermante d'une liste ordonnée ou non est bien formée.
- Fonctions de vue (`announcements.vm.ts`, et celles partagées avec les accueils) : l'icône de chaque
  nature, la nature Maintenance, non lue (dans la fenêtre et sans lecture), le public en toutes
  lettres, « Publiée le … » avec et sans auteur, la date courte avec et sans année, l'annonce ouverte
  à l'arrivée (désignée, plus récente non lue, plus récente, désignée absente), le choix du bandeau
  (Maintenance d'abord, puis la plus récente ; ni lue ni passée).
- Store (`AnnouncementsStore`) : la première page, la suivante, la recherche qui repart de la
  première page, l'ouverture qui charge le contenu une fois par annonce, la lecture enregistrée
  aussitôt dans la liste et son échec silencieux, Réessayer de la liste et du détail.
- Contenu : chaque type de bloc de l'éditeur d'administration s'affiche ; un `<script>` ou un
  `onerror` du contenu n'arrive pas dans la page.
- Page : sur ordinateur, la liste et le détail, `aria-current`, l'annonce désignée ; sur téléphone,
  `aria-expanded`, une seule ouverte, le focus sur le bouton ; recherche sans résultat, liste vide,
  « Afficher les annonces plus anciennes », chargement, erreur.
- Accueils : le bandeau suit la nouvelle règle, et le fermer appelle la lecture côté serveur.
- `ported-paths` : `/announcements` est porté.
- Design system : chaque composant nouveau ou modifié a sa spec et ses stories en clair et en
  sombre, sans violation axe.

## 3. État actuel du code

Vérifié le 2026-10-12.

- Entité `Announcements` (`libs/feature/announcement/server/src/lib/announcement.entity.ts`) :
  `title`, `description` (le résumé), `active`, `data` (EditorJS, jsonb), `icon` (nom d'icône
  ng-zorro), `version`, `displayUntil`, `displayDurationInDays`, `targetedRoles` (vide ou absent :
  tout le monde), `publisher` (`SET NULL`), `actions`. Ni type, ni état lu.
- API (`announcement.controller.ts`, `announcement.service.ts`) : `GET /announcements/visible` liste
  les annonces actives destinées au rôle de la personne, sans `data`, de la plus récente à la plus
  ancienne, 20 par défaut, avec `search` (titre et résumé), `limit`, `offset` et le total ;
  `GET /announcements/visible/:id` donne une annonce entière, `data` compris. Le paramètre `userId`
  de `getVisibleForUser` est reçu et inutilisé. Le candidat reçoit 403. Aucune fenêtre d'affichage
  côté serveur. Rien n'est notifié à la publication.
- Navigateur (`libs/feature/announcement/browser`) : l'entrée légère `shared.ts` exporte
  `AnnouncementService` (`getVisibleForUser`, `findByIdForUser`, `getActiveAnnouncements`),
  `isOnDisplay` (la fenêtre d'affichage, 10 jours par défaut) et les statistiques du `localStorage`
  (`platon-feature-announcements`, par navigateur, pas par personne).
- Administration (interface actuelle, `announcement-create-drawer`) : la nature se choisit parmi
  `notification` (Notification), `bell` (Alerte), `info-circle` (Information), `tool`
  (Maintenance), `calendar` (Événement), `warning` (Avertissement), `bulb` (« Announcement ») ; les
  rôles ciblés parmi administrateur, enseignant, étudiant ; le contenu dans EditorJS. `actions` et
  `version` ne se saisissent pas.
- Page actuelle (`apps/web/src/app/pages/announcements/`) : liste et détail, recherche dans les 20
  annonces chargées seulement, sans pagination ni fenêtre d'affichage ; `?highlight=<id>` ouvre une
  annonce ; le contenu passe par `ui-editorjs-viewer` (`@platon/shared/ui`), qui contourne
  l'assainisseur (`bypassSecurityTrustHtml`) et fuit ses styles (`::ng-deep`). Les `actions` ne
  s'affichent pas.
- Fenêtre après la connexion (`FeatureAnnouncementService.checkForAnnouncements`, barre de
  l'interface actuelle) : jusqu'à trois fois, à deux jours d'écart, tant qu'elle n'est pas fermée.
- Rendu du contenu : `EditorjsViewerService` (`libs/shared/utils/src/lib/editorjs/`) est une classe
  sans Angular ni bibliothèque d'interface (`editorjs-parser`, highlight.js et huit langages), permise
  dans `src/next` ; `@platon/shared/ui` y est interdit (`apps/web/eslint.config.mjs`). Son
  `ListParser` ferme une liste par `</ol style="padding-left: 1em;">`.
- Nouvelle interface : `/announcements` passe par le pont (`next.routes.ts`, `PORTED_PATHS` dans
  `apps/web/src/shared/ported-paths.ts`). L'entrée « Annonces » de la couverture
  (`shell/cover.vm.ts`) existe, sans compte. Le bandeau des accueils (`pages/home/home.vm.ts`,
  `banner`) montre la plus récente annonce dans sa fenêtre que la personne n'a pas fermée dans ce
  navigateur (`HomeApi.dismissedAnnouncements`, `dismissAnnouncement`, le signal `dismissed` de
  `HomeLoader`) ; « Lire l'annonce » mène à `/announcements?highlight=<id>`.
- Design system : `pl-page`, `pl-page-header`, `pl-field` (libellé visible obligatoire, sans icône),
  `pl-empty`, `pl-skeleton`, `pl-notification-item` (point et libellé « non lue », pour les
  notifications) ; aucun composant de texte riche ni de dépliant. Les icônes `campaign`,
  `notifications`, `info`, `construction`, `event`, `warning`, `auto_awesome`, `search` et
  `expand_more` sont dans le sprite.

## 4. Changements

Contrats (`libs/feature/announcement/common`, additifs) :

- `Announcement.readAt?: Date` : la lecture de la personne qui demande, dans la liste visible.

API (`libs/feature/announcement/server`) :

- Entité `AnnouncementReads` : `announcement_id` et `user_id` (clé primaire à deux colonnes,
  suppression en cascade avec l'annonce et la personne), `read_at`. Migration générée.
- `getVisibleForUser` joint la lecture de la personne (`user_id = :userId`) et rend `readAt`.
- `markAsRead(id, user)` : mêmes règles de visibilité que `findByIdForUser` (active, destinée au
  rôle), puis insertion sans doublon (`ON CONFLICT DO NOTHING`) ; 404 sinon.
- `PATCH /announcements/:id/read` (administrateur, enseignant, étudiant, démonstration) : 204.

Navigateur :

- `AnnouncementService.markAsRead(id)` et son appel dans `RemoteAnnouncementProvider`, dans l'entrée
  légère.
- `ListParser` (`libs/shared/utils`) : la balise fermante sans attributs.

Design system :

- `pl-field` : une icône en tête du champ et un libellé lu seulement par les lecteurs d'écran.
- Une ligne d'annonce : icône, titre avec point et libellé de non-lecture, résumé, date ; un bouton
  qui porte `aria-current`.
- Un dépliant pour le téléphone : un titre qui contient un bouton de 44 px, `aria-expanded`,
  chevron, icône en tête, point de non-lecture ; le résumé fermé, le contenu ouvert.
- `pl-prose` : la typographie d'un contenu riche (paragraphes, titres, listes, citations, code,
  images, tableaux, séparateurs), avec les tokens.
- Les squelettes de la ligne et du détail.

Nouvelle interface :

- `shared/announcements.ts` : la nature d'une annonce (icône, Maintenance), non lue, le choix du
  bandeau ; partagé par la page et les accueils.
- `shared/ui/editor-content/` : le contenu EditorJS rendu par `EditorjsViewerService`, lié par
  `[innerHTML]` (assaini par Angular), dans `pl-prose`.
- `pages/announcements/` : `announcements.ts`, `.html`, `.scss` (la page), `announcements.vm.ts`
  (public, « Publiée le … », dates, annonce ouverte à l'arrivée), `data/announcements-api.ts`,
  `data/announcements-store.ts`, `ui/announcement-detail/`.
- Route `announcements` sous le cadre, `title: 'Annonces'`, avec `AnnouncementsStore` ;
  `/announcements` dans `PORTED_PATHS`.
- Accueils : `banner` suit la nouvelle règle et lit `readAt` ; fermer le bandeau appelle
  `markAsRead` ; `dismissedAnnouncements`, `dismissAnnouncement` et le signal `dismissed` du
  `HomeLoader` cèdent la place à un ensemble local des annonces lues pendant la visite.
- `EditorjsViewerService` et highlight.js ne vont que dans le morceau chargé par la page, pas dans le
  bundle principal : vérifié sur le build de production.

Interface actuelle : rien. Sa fenêtre et sa page gardent leur fonctionnement et ignorent l'état lu.

Monde de démonstration (`dumps/local/seed`) : chaque annonce reçoit une nature (la maintenance en
Maintenance) et un contenu, avec au moins une liste, une image et du code ; le dump suit.

## 5. Hors scope

- Notifier la publication d'une annonce, et un compte de non lues sur « Annonces » dans la
  couverture : le wireframe n'en montre pas.
- Les `actions` d'une annonce, qu'aucun écran n'affiche ni ne saisit.
- L'administration des annonces, dont le choix de la nature : G-02. Le formulaire actuel reste.
- La coloration du code dans le contenu.
- La fenêtre d'affichage calculée par le serveur.
- L'état lu dans l'interface actuelle (sa fenêtre et sa page).

## 6. Points ouverts

Aucun : tranchés le 2026-10-12 par D42, comme proposé. Pour mémoire, les questions étaient :

1. Le type « service ». Proposé : pas de colonne. La nature que l'administrateur choisit déjà,
   « Maintenance » (`tool`), dit la disponibilité du service ; l'icône `construction` en découle.
   Ni migration ni changement du formulaire. L'autre voie, une colonne `kind` et un champ de plus
   dans le formulaire, attendrait G-02.
2. L'état lu. Proposé : une table par personne côté serveur. Une annonce devient lue quand elle est
   ouverte (le détail sur ordinateur, y compris celle ouverte à l'arrivée ; le dépliant sur
   téléphone) ou quand son bandeau est fermé : un seul état, sur tous les appareils, et le bandeau
   fermé a montré le titre et le résumé. Passé sa fenêtre, une annonce n'est jamais non lue, pour que
   les annonces d'avant le déploiement n'apparaissent pas toutes non lues.
3. L'annonce ouverte à l'arrivée, sur ordinateur. Proposé : la plus récente non lue, sinon la plus
   récente (l'interface actuelle ouvre la plus récente).
4. Le contenu. Proposé : réutiliser `EditorjsViewerService` (sans interface, permis dans `src/next`),
   l'assainisseur d'Angular sans contournement et `pl-prose`, le code sans couleurs. L'autre voie, un
   rendu Angular bloc par bloc, demande plus de code pour le même résultat.
5. La recherche et la pagination. Proposé : la recherche par le serveur, sur toutes les annonces, et
   « Afficher les annonces plus anciennes » par 20. L'interface actuelle ne cherche que dans les 20
   annonces chargées.
6. La taille. La roadmap disait S ; l'état lu côté serveur, le rendu du contenu et le dépliant en
   font un M.

## 7. Definition of Done

- [x] Les comportements du § 1, chacun couvert par un test du § 2.
- [x] La migration générée, les specs d'intégration et e2e de l'API vertes (testcontainers).
- [x] `yarn build`, `yarn lint`, `yarn test`, `yarn lint:design`, le build de Storybook verts.
- [x] Les stories nouvelles ou modifiées sans violation axe, en clair et en sombre.
- [x] La page vérifiée dans Chrome sur l'app lancée, avec le monde de démonstration : ordinateur et
      téléphone, clair et sombre, au clavier, arrivée par le bandeau ; captures comparées au
      wireframe.
- [x] Le bundle principal n'a pas grossi du rendu du contenu.
- [x] Le ticket dans `done/`, la roadmap et les décisions à jour.

> **Amendement à la livraison.** L'API, telle que livrée :
>
> - `PATCH /announcements/:id/read` répond 200 sans contenu, comme `PATCH /notifications/:id/read` :
>   aucune route de l'API ne fixe son code.
> - `AnnouncementReads` suit `BaseEntity` : une clé `id`, l'unicité de `(user_id, announcement_id)`,
>   `created_at` comme date de lecture, et un index sur `announcement_id` pour la suppression en
>   cascade d'une annonce.
> - `getVisibleForUser` lit les lectures par une seconde requête, partie des lignes de la personne.
> - Le prédicat de visibilité, partagé par la liste, le détail et la lecture, vit dans
>   `announcement.sql.ts`.

> **Amendement à la livraison.** Le rendu du contenu :
>
> - Il passe par `editorjsToHtml`, une fonction pure posée à côté d'`EditorjsViewerService`, que le
>   service reprend.
> - `editorjs-parser` écrit dans ses défauts partagés les parseurs qu'on lui donne : la fonction part
>   d'une copie, et un remplacement ne vaut que pour son appel (B34).
> - La page écrit à sa façon :
>   - les cases à cocher, leur état dit en mots ;
>   - le séparateur, en filet ;
>   - le tableau, avec sa ligne d'en-tête ;
>   - l'image, sa légende lue une seule fois ;
>   - les titres du contenu, rangés sous le titre de l'annonce.
> - Le `ListParser` met aussi chaque sous-liste dans son élément et lit les listes plates, ce dont
>   profite l'interface actuelle (B34).

> **Amendement à la livraison.** La page et le design system :
>
> - Le design system ajoute `pl-announcement-list`, l'hôte `list` des lignes. Le squelette du détail
>   est composé dans la page avec `pl-skeleton`.
> - Le store garde la recherche à laquelle répond la liste. Les états vides la lisent, si bien
>   qu'effacer le champ ne le détruit pas.
> - L'issue d'une recherche est annoncée aux lecteurs d'écran.
> - Après une erreur, le champ reste, et l'erreur est dite au-dessus avec « Réessayer ».
> - « Afficher les annonces plus anciennes » montre son chargement sans perdre le focus.
> - Le routeur garde l'injecteur d'une route d'une visite à l'autre : le store repart de zéro à chaque
>   visite. La règle `front/new-interface.md` le dit désormais.
> - « Non lue : » est partagé avec les notifications (`shared/unread.ts`), et les réessais jusqu'à
>   30 s avec les accueils (`shared/patiently.ts`).
> - Les fonctions du `localStorage` des annonces quittent l'entrée légère de la bibliothèque : seule
>   la fenêtre de l'interface actuelle s'en sert.
> - Les règles d'une annonce (non lue, Maintenance, choix du bandeau) vivent à côté d'`isOnDisplay`,
>   dans l'entrée légère de la bibliothèque, et non dans `shared/announcements.ts`. L'icône d'une
>   nature, propre à la nouvelle interface, est dans les fonctions de vue de la page.
> - Le contenu est rendu par `shared/ui/editor-content/` : le pont entre le format de l'éditeur et
>   `pl-prose`, qui reste la seule partie visuelle, dans le design system.
> - La page se découpe comme les accueils :
>   - `announcements.ts` démarre le store, dit le chargement et choisit la vue de l'écran ;
>   - `wide/` (la liste et l'annonce ouverte côte à côte) et `narrow/` (les dépliants), chacune avec
>     sa mise en page et son focus ;
>   - `announcements-page.ts`, ce que les deux vues partagent, et l'annonce des recherches ;
>   - `ui/announcement-search/` (le champ et son « aucun résultat ») et `ui/announcement-more/`.

> **Défauts trouvés en chemin.**
>
> - B33 : l'interface actuelle insère le contenu EditorJS sans assainissement.
> - B34 : listes mal formées, et parseurs remplacés pour tout le monde. Corrigé ici.
> - B35 : chaque migration générée embarque deux écarts sans rapport ; ils ont été retirés de
>   `AnnouncementReads` à la main.
> - La spec des notifications du design system dépendait de l'heure (« il y a 2 h » devenait « hier »
>   après minuit) : son horloge est fixée.

> **Non vérifié.** Le défilement vers l'annonce du bandeau, sur téléphone, n'a été vu qu'avec une page
> qui atteint son bas avant que l'annonce soit en haut.

> **Données.** Les specs d'intégration et e2e de l'API ont été lancées par la personne, vertes, après
> la création de l'index sur sa base. `dumps/local/platon.sql` suit : la table des lectures, son index,
> et les annonces du monde de démonstration avec leur nature et leur contenu (restauration vérifiée dans
> une base temporaire).
