# C-05 : Le gabarit de page : en-tête, onglets, états (vide, chargement, erreur)

Source : `design/docs/04-direction.md` (gabarit de page, états), `design/spec/project.md` (règles
communes), `design/flows/cours/04-detail` (en-tête et onglets), `design/flows/cours/01-mes-cours`
(état vide), `design/flows/accueil-etudiant/01-etudiant.desktop.loading` (squelette et annotation),
`design/flows/lecteur/02-exercice.desktop.error` (erreur avec code) ; décisions : D8, D19.
Statut : À faire.
Dépend de : C-01.
Taille : M.

## 1. Comportement attendu

- Étant donné une page, alors son contenu est le repère principal `#contenu`, cible du lien
  d'évitement, avec des marges de 32 px (16 px sur mobile) et une largeur de 1200 px pour une liste,
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
  contenu attendu ; ce que le client sait déjà (titres, nom, date) s'affiche tout de suite. Au bout de
  10 s, un message dit que c'est long ; au bout de 30 s, le chargement devient une erreur.
- Étant donné un contenu vide parce qu'il n'y a encore rien, alors la page dit pourquoi et quelle
  action le remplit, avec l'illustration « copie vierge » ; en format réduit dans une zone.
- Étant donné un contenu vide à cause d'une recherche ou d'un filtre, alors la page rappelle la
  recherche, nomme le filtre qui écarte des résultats et propose de le retirer.
- Étant donné une zone en erreur, alors elle dit le problème en une phrase, la cause si on la
  connaît, et propose « Réessayer » ; le reste de la page marche. Une erreur ne s'affiche jamais comme
  un vide.
- Étant donné une page en erreur, alors elle montre un titre humain, la cause, deux sorties et le
  code d'erreur en petit.

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

- Le texte du message à 10 s et de l'erreur à 30 s n'est écrit nulle part.
- Les deux sorties d'une page d'erreur : proposition, « Revenir à l'accueil » et « Réessayer » (ou
  la page précédente pour un 404).
- Les pages `/403`, `/404` et `/500` : les porter ici sur `pl-page-error`, ou les laisser passer par
  le pont jusqu'à G-04 ?

## 7. Definition of Done

- [ ] Les tests du §2 passent.
- [ ] L'accueil provisoire utilise le gabarit.
- [ ] Chaque état a sa story et sa forme ; aucune erreur ne s'affiche comme un vide.
