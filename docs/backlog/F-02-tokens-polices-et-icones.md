# F-02 : Tokens, polices et icônes

Source : `design/design.md` (tokens), `design/icons/`, `design/docs/04-direction.md` ; décisions :
D9, D11.
Statut : À faire.
Dépend de : F-01, S-02.
Taille : M.

## 1. Comportement attendu

- Étant donné la nouvelle interface ou Storybook, alors couleurs, typographie, espacements,
  rayons, ombres, mouvement et z-index viennent tous de variables `--pl-*`, en clair et en sombre.
- Étant donné le thème sombre, alors les contrastes restent au niveau AA (voir la direction).
- Étant donné une icône, alors `<pl-icon name="school" />` affiche le symbole Material Symbols
  Rounded du sprite, à la taille du texte, dans sa couleur.
- Étant donné les polices, alors Atkinson Hyperlegible Next et Mono sont servies par PLaTon, sans
  appel à un service tiers.

## 2. Tests à écrire d'abord

- Une page Storybook « Tokens » générée à partir des variables CSS.
- Test : toute variable `var(--pl-…)` utilisée dans la bibliothèque existe dans `tokens.css`.

## 3. État actuel du code

Vérifié le 2026-09-28.

- Les valeurs de référence sont dans le frontmatter de `design/design.md` (palette encre,
  graphite, états, huit teintes de cours, couverture).
- Le sprite des wireframes est dans `design/icons/*.svg` (Material Symbols Rounded, 400).
- L'ancienne interface utilise `--brand-*` (`shared/styles/css-variables`), sans les polices
  qu'elle déclare.

## 4. Changements

- `libs/design-system/src/styles/tokens.css` : les variables `--pl-*`, clair et sombre
  (`[data-theme="dark"]` et `prefers-color-scheme`).
- `libs/design-system/src/styles/next.css` : base (box-sizing, typographie, focus visible,
  `prefers-reduced-motion`), qui importe les tokens.
- Polices auto-hébergées dans les assets de l'app.
- Sprite d'icônes généré depuis une liste de noms, et `pl-icon`.

## 5. Hors scope

Faire lire ces tokens à l'ancienne interface : pas nécessaire avec la bascule (D1).

## 6. Points ouverts

aucun

## 7. Definition of Done

- [ ] Page Tokens dans Storybook, clair et sombre.
- [ ] Aucune valeur en dur dans la bibliothèque (vérifié par F-03).
- [ ] Polices et icônes servies localement.
