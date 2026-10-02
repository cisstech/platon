# C-01 : Boutons, menus, bulles, avatar, badges et choix segmenté

Source : `design/design.css` (`.btn*`, `.menu*`, `.avatar`, `.count`, `.badge-count`, `.tag*`,
`.segmented`), `design/flows/accueil-enseignant/02-creer`, `design/flows/accueil-etudiant/03-profil`,
`design/docs/04-direction.md` (accessibilité, mouvement, états) ; décisions : D16, D17, D19, D20.
Statut : Livré (2026-09-29).
Dépend de : F-02.
Taille : M.

## 1. Comportement attendu

- Étant donné un bouton, alors il prend l'une des variantes des wireframes : principal, secondaire,
  discret (`ghost`), icône seule, et les deux boutons de la couverture (plein et discret) ; trois
  tailles (32, 36 et 44 px) ; un ton « danger » pour une action destructrice, qui garde la forme
  secondaire avec le filet et le texte en rouge (`cours/12-reglages`, « Supprimer le cours »).
- Étant donné un appareil tactile, alors toute cible fait au moins 44 px de haut.
- Étant donné un bouton qui travaille, alors il garde son libellé, affiche un indicateur, annonce
  `aria-busy` et ignore les clics. La règle de la direction l'emporte sur `.btn.loading` des
  wireframes, qui masque le libellé.
- Étant donné un bouton à icône seule, alors il a un nom accessible et une bulle qui montre ce nom,
  au survol et au focus clavier ; la bulle n'est pas annoncée une deuxième fois. Sans nom, la
  bibliothèque le signale en développement.
- Étant donné un menu (Créer, profil, actions d'une ligne), quand on l'ouvre, alors il apparaît
  sous son déclencheur en 180 ms (ou au-dessus s'il manque de place), la première entrée a le focus,
  les flèches passent d'une entrée à l'autre, `Échap` le ferme et rend le focus au déclencheur. Une
  entrée porte une icône, un titre et, au besoin, une ligne de description ; le menu accepte des
  séparateurs et un en-tête (nom et adresse dans le menu du profil).
- Étant donné une personne, alors son avatar montre ses initiales sur une pastille encre : celles du
  prénom et du nom, sinon les deux premières lettres de l'identifiant (le modèle `User` n'a pas de
  photo, et prénom et nom y sont facultatifs).
- Étant donné un compteur, alors il s'affiche à côté d'un libellé (navigation, onglet, titre de
  section) ou en pastille sur un bouton à icône (cloche mobile) ; dans ce cas, le nombre fait partie
  du nom accessible du bouton (« Notifications, 3 non lues »).
- Étant donné une étiquette d'état, alors elle a toujours un mot, et au besoin une icône, dans un
  ton : neutre, succès, attention, danger, repère, notée, ou la teinte d'un cours.
- Étant donné un choix segmenté (thème, filtres de barre d'outils), alors c'est un groupe de boutons
  radio : un seul choix actif, les flèches le déplacent ; une option à icône seule a un nom accessible.

## 2. Tests à écrire d'abord

- Une story par variante et par état, en clair et en sombre, sans violation au contrôle
  d'accessibilité.
- Bouton : en travail, le libellé reste, `aria-busy` est posé et un clic n'émet rien.
- Menu : ouverture au clic et au clavier, focus sur la première entrée, flèches, `Échap` qui rend le
  focus au déclencheur.
- Bulle : visible au focus clavier, masquée par `Échap` et à la sortie du pointeur.
- Choix segmenté : les flèches changent la valeur et l'émettent.
- `yarn lint:design` passe.

## 3. État actuel du code

Vérifié le 2026-09-29.

- `libs/design-system` contient `pl-icon`, `pl-toast`, `Toaster` et `pl-dialog`. Les deux actions de
  `pl-dialog` sont des boutons stylés dans le composant (`.pl-dialog__action`).
- `@angular/aria` 22.1.5 fournit `ngMenuTrigger`, `ngMenu`, `ngMenuItem`, `ngMenuContent`, et aussi
  onglets, barre d'outils, listbox, combobox, grille, arbre et accordéon. Pas de bulle : elle
  s'appuie sur l'overlay du CDK, dont les styles sont déjà dans `next.scss`.
- Les tokens `--pl-layer-menu`, `--pl-layer-tooltip`, `--pl-duration-menu` et les rôles de couleur
  de la couverture existent. `.btn-cover:hover` utilise encre 200, qui n'a pas encore de rôle.
- Usage dans les wireframes : `btn` 841 fois, dont `btn-sm` 558, `btn-icon` 353, `btn-secondary`
  168, `btn-ghost` 141, `btn-primary` 110, `btn-cover` 61, `btn-lg` 12 ; `count` 271 ; `avatar` 137 ;
  `tag` 117 ; `segmented` 48 ; `menu` 8 ; `badge-count` 2.

## 4. Changements

- Bibliothèque :
  - `button/button.ts` : directive `Button` sur `button[plButton]` et `a[plButton]` (variante,
    taille, ton, travail).
  - `menu/` : `pl-menu`, `pl-menu-item` et le déclencheur, posés sur les directives d'Angular Aria
    (`hostDirectives`), positionnés par l'overlay du CDK.
  - `tooltip/tooltip.ts` : directive `plTooltip`.
  - `avatar/avatar.ts`, `count/count.ts`, `tag/tag.ts`, `segmented/segmented.ts`.
  - Tokens : un rôle pour le survol du bouton plein de la couverture.
  - `pl-dialog` passe ses deux actions sur `plButton`.
- Stories et documentation en anglais (D20).

## 5. Hors scope

Les champs de formulaire, les puces de filtre (`.chip`) et les étiquettes-liens (`.tag-link`), qui
arrivent avec les listes (R-01) ; les onglets de page (C-05) ; l'intercalaire de la couverture (C-02).

## 6. Points ouverts

- Sur un écran tactile, la bulle n'a pas de geste naturel. Proposition : pas de bulle au toucher, le
  nom accessible suffit. À valider.

## 7. Definition of Done

- [x] Chaque composant a ses stories, en clair et en sombre, sans violation d'accessibilité.
- [x] Les tests du §2 passent.
- [x] `pl-dialog` utilise `plButton`.
- [x] `yarn lint:design`, `yarn lint`, `yarn test` et `build-storybook` passent.

> **Amendement à la livraison.** Les boutons des wireframes portent des icônes de 18 px, absentes de
> l'échelle : `--pl-icon-size-*` passe à quatre pas (16, 18, 20, 24 px). Deux rôles s'ajoutent :
> `--pl-color-hover` (fond neutre au survol ou au clavier) et `--pl-color-cover-primary-hover`. La
> bulle nomme l'élément qui n'a pas de nom (`plTooltip` devient son `aria-label`) et n'est jamais lue ;
> au toucher, elle ne s'affiche pas, comme proposé. Le choix segmenté repose sur de vrais boutons radio,
> qui donnent les flèches et l'annonce du groupe.

> **Amendement à la livraison.** `pl-menu` porte le menu d'Angular Aria en directive hôte : les entrées
> écrites dedans le trouvent par injection, et `#menu="ngMenu"` se passe à `[plMenuTrigger]`. Il vit
> dans un panneau de l'overlay du CDK dès le départ, pour que l'ouverture ne déplace jamais l'élément
> qui a le focus ; il s'ouvre dessous, ou dessus faute de place. Une entrée est nommée par son titre et
> décrite par sa ligne de description. Vérifié dans Chrome au clavier : première entrée au focus,
> flèches, `Échap` qui rend le focus, choix à Entrée.

> **Défaut trouvé en chemin.** Le wireframe du menu du profil y place le choix segmenté du thème, qu'on
> ne peut pas atteindre au clavier dans un menu : le point est ajouté à C-02.
