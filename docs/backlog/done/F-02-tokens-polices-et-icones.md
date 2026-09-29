# F-02 : Tokens, polices et icônes

Source : `design/design.md` (tokens), `design/icons/`, `design/docs/04-direction.md` ; décisions :
D9, D11.
Statut : Livré (2026-09-29).
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

- [x] Page Tokens dans Storybook, clair et sombre.
- [x] Aucune valeur en dur dans la bibliothèque (vérifié par F-03).
- [x] Polices et icônes servies localement.

> **Amendement à la livraison.** Les tokens vivent dans `tokens.scss` et la base dans `next.scss` : un
> mixin porte les valeurs sombres une seule fois, appliquées à `data-theme="dark"` et à la préférence
> système. Les noms sont en anglais et suivent une règle : une échelle est numérotée
> (`--pl-space-4`, `--pl-radius-2`, `--pl-plum-700`), un rôle est nommé (`--pl-color-primary`,
> `--pl-radius-card`) (D20). Les valeurs sombres absentes de la direction sont calculées puis vérifiées
> au seuil AA. L'ocre d'attention n'atteint que 2,74:1 sur blanc : textes et icônes prennent
> `--pl-color-warning-ink`.

> **Amendement à la livraison.** Les icônes ne viennent pas du paquet npm Material Symbols, qui ne
> livre que la taille optique 48, trop fine à 16 et 20 px. Leurs sources sont celles des wireframes
> (taille optique 24), copiées dans `libs/design-system/icons/` ; un nom nouveau est téléchargé une fois
> depuis Google Fonts puis livré. Le sprite porte un numéro de version dans son adresse.

> **Défaut trouvé en chemin.** `design/icons/auto_awesome.svg` avait un tracé en coordonnées 48 dans
> une boîte 960 : l'icône était invisible dans les wireframes. Remplacée par la version de Google.
