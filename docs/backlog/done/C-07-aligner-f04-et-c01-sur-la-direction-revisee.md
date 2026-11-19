# C-07 : Aligner F-04 et C-01 sur la direction révisée

Source : `design/design.md` et `design/design.css` après les quatre tours de critique
(commit `docs(design): wireframes after four critique rounds`), `design/spec/project.md` (règles
communes), écrans `cours/09-membres`, `cours/11-groupes`, `creation/05-enregistre`,
`accueil-enseignant/02-creer` ; décisions : D19, D20.
Statut : Livré (2026-10-08).
Dépend de : C-01, F-04.
Taille : M.

## 1. Comportement attendu

- Étant donné un bouton de petite taille, alors il fait 36 px de haut, comme un bouton moyen, avec
  moins de marge et un texte plus petit : 36 px est la cible minimale sur ordinateur.
- Étant donné un bouton qui travaille, alors sa roue prend la place de son icône ; un bouton sans
  icône la met devant son libellé. Le libellé ne bouge pas.
- Étant donné une action destructrice, alors elle a deux formes : pleine (fond rouge, texte blanc,
  rouge plus sombre au survol) et discrète (fond de la surface, filet rouge clair, texte rouge, fond
  rouge pâle et filet rouge au survol), lisibles en clair et en sombre.
- Étant donné l'étiquette « Notée », alors c'est un filet neutre sur la surface, sans couleur :
  l'encre ne sert plus aux étiquettes, aux barres de progression ni aux graphiques.
- Étant donné une notification flottante (toast), alors elle a le fond de la couverture, le texte et
  l'icône de la couverture, des coins de 8 px, au plus 520 px de large, en bas à gauche de la page :
  - une confirmation prend `check`, discrète (rester n'est pas réussir) ;
  - une erreur prend `error`, et une alerte `warning`, lisibles sur la couverture ;
  - une information est neutre : le bleu « repère » ne sert qu'au planifié ;
  - elle peut porter une action (« Annuler », avec `undo`) dans l'encre claire de la couverture, et
    toujours « Fermer la notification » ;
  - elle disparaît seule si elle ne fait que confirmer ; elle reste jusqu'à ce qu'on la ferme si
    elle porte une action.
- Étant donné une entrée de menu destructrice (« Supprimer la section »), alors son texte est rouge et
  son icône aussi.
- Étant donné un glyphe PLaTon (cours, activité, exercice, cercle, copie), alors il s'affiche à 40 ou
  56 px avec ses couleurs, en clair comme en sombre.

## 2. Tests à écrire d'abord

- Bouton : la roue remplace l'icône projetée, le libellé reste ; formes destructrices pleine et
  discrète.
- `Toaster` : une notification avec action ne disparaît pas seule ; l'action s'exécute puis la
  ferme ; la confirmation porte `check`.
- `DialogService` de la nouvelle interface : `success` donne `check`, `info` un ton neutre.
- `pl-menu-item` : le ton destructeur.
- `pl-glyph` : le bon symbole, sa taille, son nom accessible quand il en a un.
- Stories mises à jour, en clair et en sombre, sans violation d'accessibilité.

## 3. État actuel du code

Vérifié le 2026-10-08.

- `plButton` (`libs/design-system/src/lib/button/button.ts`) : petit à 32 px ; la roue s'ajoute
  après le libellé et l'icône reste ; le ton `danger` existe en plein (`--pl-color-danger-strong`) et
  en secondaire (filet `--pl-color-danger`, pas le rouge clair des wireframes).
- `pl-tag` : le ton `graded` est à l'encre (`--pl-color-primary-soft`, `--pl-color-primary`).
- `pl-toast` et `Toaster` : carte claire (`--pl-color-surface-raised`), icône colorée par ton
  (`check_circle` en vert pour une confirmation, `info` en bleu), pas d'action ; `NextDialog` passe
  les tons `success`, `info`, `warning`, `danger`.
- `pl-menu-item` : pas de ton destructeur.
- Glyphes : `design/icons/glyph-{cours,activite,exercice,cercle,copie}.svg`, en couleurs écrites en
  dur, pour le thème clair seulement ; aucun composant.
- Sprite : `check` et `undo` y manquent ; `undo` est dans `design/icons`.

## 4. Changements

- Bibliothèque :
  - `plButton` : hauteur du petit, roue à la place de l'icône, formes destructrices.
  - Tokens : un rôle de filet rouge clair (`--pl-color-danger-line`), clair et sombre, contrastes
    vérifiés.
  - `pl-tag` : `graded` au filet.
  - `pl-toast` et `Toaster` : fond de couverture, action facultative (libellé, icône, rappel),
    durée infinie quand il y a une action ; ton `info` neutre.
  - `pl-menu-item` : entrée `tone` (`default`, `danger`).
  - `pl-glyph` : les cinq glyphes, aux couleurs passées en rôles de tokens pour le thème sombre.
  - Sprite : `check`, `undo`.
- Nouvelle interface : `NextDialog` donne `check` aux confirmations.

## 5. Hors scope

Les icônes d'état du tableau de `design.md` qui ne servent à aucun composant livré : elles entrent
dans le sprite avec les écrans qui les montrent.

## 6. Points ouverts

aucun

## 7. Definition of Done

- [x] Les tests du §2 passent.
- [x] Les stories des composants touchés suivent `design/design.css`, en clair et en sombre.
- [x] `yarn lint:design`, `yarn lint`, `yarn test` et `build-storybook` passent.

> **Amendement à la livraison.** Les couleurs des glyphes deviennent des classes branchées sur des rôles
> existants (surface, contour, filets, marge, chaleur) : ils suivent le thème sans nouveau token, sauf
> leurs deux tailles (`--pl-glyph-size-1` et `-2`). `pl-menu-item` prend aussi une entrée `glyph`, pour
> le menu Créer de C-02. Trois rôles s'ajoutent : `--pl-color-danger-strong-hover`,
> `--pl-color-cover-warning` et `--pl-color-cover-danger` ; le filet rouge clair vaut rouge 200 en clair et
> `#7b2e2d` en sombre. La roue d'un bouton qui travaille masque l'icône projetée par un sélecteur
> profond, le seul qui atteigne le contenu de la page.
