# C-05 : Le gabarit de page : en-tête, onglets, états (vide, chargement, erreur)

Source : `design/docs/04-direction.md` (gabarit de page, états), `design/spec/project.md` (règles
communes), `design/flows/cours/04-detail` (en-tête et onglets), `design/flows/cours/01-mes-cours`
(état vide), `design/flows/accueil-etudiant/01-etudiant` (chargement, chargement lent, erreur, vide,
sur bureau et téléphone), `design/flows/lecteur/02-exercice.desktop.error` (erreur avec code), révisés
après les quatre tours de critique ; décisions : D8, D19.
Statut : Livré (2026-10-08).
Dépend de : C-01, C-07.
Taille : M.

## 1. Comportement attendu

- Étant donné une page, alors elle a un titre de niveau 1, et son contenu est le repère principal
  `#contenu`, cible du lien d'évitement, avec des marges de 32 px (16 px sur mobile) et une largeur de 1200 px pour une liste,
  760 px pour un formulaire.
- Étant donné l'en-tête, alors il suit cet ordre : le fil d'Ariane à partir du deuxième niveau ; le
  titre (`h1`), avec l'action principale à droite sur la même ligne, précédée au besoin d'actions
  secondaires ; une ligne de description ; les chiffres clés en petit (icône, nombre en gras,
  libellé, ou une date) ; les onglets collés au bas de l'en-tête.
- Étant donné les onglets d'une page, alors ce sont des liens vers des adresses (Vue d'ensemble,
  Membres…) : une navigation dont l'onglet courant porte `aria-current="page"`, avec icône et
  compteur facultatifs. Des onglets qui changent de panneau sans changer d'adresse s'appuient sur les
  onglets d'Angular Aria.
- Étant donné un chargement, alors rien ne s'affiche avant 300 ms, puis un squelette à la forme du
  contenu attendu ; ce que le client sait déjà (titres, nom, date) s'affiche tout de suite.
- Étant donné un chargement qui dure 10 s, alors le squelette reste et un message neutre s'ajoute,
  avec `hourglass_empty` : « Le chargement prend plus de temps que d'habitude. Nous réessayons, vous
  n'avez rien à faire. »
- Étant donné un chargement qui dure 30 s, alors la zone ou la page devient une erreur qui le dit,
  distingue une panne de PLaTon (`cloud_off`, en correction : « Votre connexion fonctionne, c'est
  PLaTon qui ne répond pas. ») d'une coupure de la connexion de la personne (`wifi_off`, en
  graphite), rassure sur ce qui est enregistré et propose « Réessayer ».
- Étant donné un contenu vide parce qu'il n'y a encore rien, alors la page dit pourquoi et quelle
  action le remplit, avec l'illustration « copie vierge » ou le glyphe de l'objet à 56 px (C-07) ;
  en format réduit dans une zone. Une icône dans une pastille (graphite, ou rouge pour une erreur)
  remplace l'illustration quand il n'y a rien à créer.
- Étant donné un contenu vide à cause d'une recherche ou d'un filtre, alors la page rappelle la
  recherche, nomme le filtre qui écarte des résultats et propose de le retirer.
- Étant donné une zone en erreur, alors elle dit le problème en une phrase, la cause si on la
  connaît, et propose « Réessayer » ; le reste de la page marche. Une erreur ne s'affiche jamais comme
  un vide.
- Étant donné une page en erreur, alors elle montre un titre humain, la cause, ses sorties et le
  code d'erreur en petit. « Réessayer » est toujours là ; une seconde sortie n'apparaît que si elle
  mène quelque part qui marche (l'accueil n'en a pas : la page des cours dépend du même serveur).

## 2. Tests à écrire d'abord

- Fonction pure de la phase de chargement (`idle`, `loading`, `ready`, `error` du store et temps
  écoulé, donne rien, squelette, « c'est long » ou erreur), avec les seuils de 300 ms, 10 s et 30 s.
- En-tête : fil d'Ariane absent au premier niveau, onglet courant, ordre des actions.
- Stories : en-tête complet et minimal ; onglets avec compteur ; chaque état (squelette, vide, vide
  filtré, erreur de zone, erreur de page), en clair et en sombre, sans violation d'accessibilité.

## 3. État actuel du code

Vérifié le 2026-09-29.

- Ancienne interface : titres centrés sur Cours, Espace de travail et Tests, à gauche ailleurs ;
  action de création en rond à icône seule ou en pilule (`design/docs/02-audit.md`, cadre et
  navigation). Pages d'erreur `ui-error` 403, 404, 500 et 512 sur `nz-result`
  (`libs/shared/ui/src/error/`), routées à `/403`, `/404`, `/500` (`apps/web/src/app/app.routes.ts:7-9`).
- Wireframes : `page-head`, `crumbs`, `page-sub`, `head-meta`, `actions`, `tabs` et `tab` avec
  `count` ; `empty` et `empty compact` ; squelette `sk`, `sk lg`, `sk btn` ; `skip-link` vers
  `#contenu` sur 64 écrans. L'illustration est `design/icons/illus-copie.svg`.
- Nouvelle interface : aucun gabarit ; l'accueil provisoire (`apps/web/src/next/pages/home/`) pose
  ses propres marges.

## 4. Changements

- Bibliothèque : `pl-page` (repère principal, largeur, marges), `pl-page-header` (fil d'Ariane,
  titre, actions, description, chiffres clés), `pl-page-tabs`, `pl-skeleton`, `pl-empty` (avec
  l'illustration, en deux formats), `pl-zone-error`, `pl-page-error`.
- La fonction de phase de chargement, pour les stores des écrans (D8).
- L'illustration « copie vierge » rejoint les assets de la bibliothèque.
- L'accueil provisoire passe sur le gabarit.

## 5. Hors scope

Les barres d'outils de liste (recherche, filtres, choix d'affichage), qui arrivent avec les listes
(K-01, R-01) ; le contenu des écrans.

## 6. Points ouverts

Aucun : `/403`, `/404` et `/500` passent par le pont jusqu'à X-02 (D30, 2026-10-08) ; le texte de
l'erreur hors connexion de l'amendement est retenu.

## 7. Definition of Done

- [x] Les tests du §2 passent.
- [x] L'accueil provisoire utilise le gabarit.
- [x] Chaque état a sa story et sa forme ; aucune erreur ne s'affiche comme un vide.

> **Amendement à la livraison.** L'erreur de zone et l'erreur de page ne sont pas deux composants :
> ce sont des `pl-empty` avec une icône dans une pastille, `role="alert"` et, pour une page, un
> `code` en petit. `pl-alert` s'ajoute pour le message des 10 s (il servira aux bandeaux). Le texte
> français vit dans l'application : `app-load-state` (`next/shared/`) affiche le message des 10 s,
> puis l'erreur, dont la cause vient de `Connectivity` (ce que le navigateur sait du réseau) ; «
> Réessayer » est toujours là, une seconde sortie seulement si l'écran la donne. Le nom du fil
> d'Ariane passe par `BREADCRUMB_LABEL`, que `next.config.ts` fournit en français.

> **Amendement à la livraison.** Les wireframes n'ont pas de texte pour une coupure de la connexion
> sur un accueil. Texte retenu : « Votre appareil semble hors connexion. Vérifiez le réseau,
> puis réessayez. », avec `wifi_off` en graphite. Le message des 10 s promet « Nous réessayons » :
> c'est au store de chaque écran (A-01 et suivants) de réessayer vraiment ; `trackLoadPhase` ne fait
> que suivre le temps, et « Réessayer » après les 30 s change son `attempt` pour relancer l'horloge.

> **Amendement à la livraison.** Nouveaux tokens : `--pl-color-info-line`, `-success-line` et
> `-warning-line` (bordure d'un message sur fond `-soft`, comme `-danger-line`),
> `--pl-color-skeleton` et `--pl-color-skeleton-shine` (le dégradé des wireframes, graphite 100 vers
> 50, disparaissait sur le fond de page, qui est graphite 50), `--pl-duration-shimmer` (1 ms quand
> le mouvement est réduit). `pl-empty` est une carte (surface, filet, 720 px au plus) comme dans
> tous les wireframes, et s'empile sous 480 px de large. Les actions de l'en-tête sont sur la ligne
> du titre, comme le dit la direction, et non en haut de l'en-tête comme dans les wireframes. Les
> marges passent à 16 px sous 840 px, le seuil du cadre mobile (D28). La cible `main#contenu` est
> dans `pl-page` (`PAGE_CONTENT_ID`) ; le lien d'évitement arrivera avec la couverture (C-02).

> **Amendement à la livraison.** Vérifié dans Storybook : 19 stories (en-tête complet et minimal,
> largeur formulaire, squelette, chargement lent, vide, vide filtré, erreur de zone, erreur de page,
> hors connexion), en clair et en sombre, sans violation axe ; à 390 px, rien ne déborde et les
> onglets défilent. L'accueil provisoire, dans le cadre de C-02, est vérifié dans Chrome sur le build de
> production, avec une API simulée.

> **Amendement à la livraison.** Après la revue du front : le message des 10 s est annoncé par le
> `LiveAnnouncer` du CDK (une région de statut insérée avec son texte n'est pas lue par tous les
> lecteurs d'écran) ; `app-load-state` transmet le niveau du titre (3 pour une zone sous un titre de
> section) ; le lien d'évitement ne recharge jamais la page, même sans cible.
