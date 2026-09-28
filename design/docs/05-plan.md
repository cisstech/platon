# Plan de refonte

## Méthode

1. **Fondations d'abord** : tokens, polices, icônes, et un pont qui fait lire ces tokens à
   Material et ng-zorro. Toute l'application change de palette d'un coup.
2. **Puis une tranche par famille d'écrans**, en commençant par le cadre. Chaque tranche construit
   dans Storybook les seuls composants dont elle a besoin, puis migre ses écrans.

Pour chaque tranche : wireframes validés dans `design/`, composants dans Storybook, migration,
captures avant et après sur les mêmes données.

## Garder les API

- `DialogService` garde ses méthodes ; seul son intérieur change.
- Les composants `ui-*` et `user-avatar` gardent leurs entrées et sorties. Les types qui exposent
  ng-zorro (`NzDrawerSize`, `NzTableColumn<T>`, `ModalOptions`) reçoivent un équivalent neutre.
- Les web components élève gardent `appearance`.
- Material n'a pas de façade : `mat-icon`, `mat-card` et les boutons se remplacent par script.

## La bibliothèque

- `libs/design-system`, alias `@platon/design-system`, préfixe `pl-` (`ui-` est pris par nge).
- Standalone, OnPush, `input()` et `output()`, `inject()`, CDK pour les comportements, aucune
  dépendance à Material ni à ng-zorro.
- Tokens dans `tokens.css`, variables `--pl-*`, clair et sombre. Les `--brand-*` actuelles
  deviennent des alias.

## Storybook

Storybook 10 (compatibilité Angular 22 à confirmer), `addon-docs` et
`addon-a11y`, styles globaux de l'app, sélecteur de thème, stories CSF3 pilotées par `args`, une
story par état (défaut, désactivé, chargement, erreur, vide), textes réels en français, une page
de tokens.

## Garde-fous

- Pas de couleur, taille ou rayon en dur dans `libs/design-system` ; toute `var(--pl-*)` existe.
- Préfixe `pl-` imposé par ESLint.
- Pas de tiret cadratin ni demi-cadratin.
- Les wireframes de `design/` passent leur vérification en intégration continue.

## Phases

| Phase | Contenu | Fini quand |
| --- | --- | --- |
| 0. Fondations | Tokens, polices auto-hébergées, sprite d'icônes et `pl-icon`, pont de thème, bibliothèque, Storybook, garde-fous | Toute l'app a la palette et la typographie, rien de cassé |
| 1. Cadre | `pl-button`, `pl-menu`, `pl-tooltip`, `pl-avatar`, `pl-badge`, `pl-shell`, `pl-nav` ; navigation par rôle, Créer, profil, mobile | Plus de `mat-sidenav`, `mat-toolbar`, `mat-menu` dans le cadre |
| 2. Accueils et gabarit | `pl-page-header`, `pl-card`, `pl-stat`, `pl-empty-state`, `pl-skeleton`, `pl-tabs` ; les deux accueils | Accueils en production, aucune erreur affichée comme un vide |
| 3. Formulaires | `pl-field`, `plInput`, `pl-select`, `pl-combobox`, `pl-checkbox`, `pl-switch` ; connexion, compte, créations | `mat-form-field` retiré (23 templates) |
| 4. Surcouches | `PlDialog`, `pl-toast`, `pl-drawer`, `pl-popover` derrière les façades | Plus de `MatDialog` ni `NzModalService` |
| 5. Lecteur | La copie et sa marge, lecteur, correction, web components élève | Plus aucun import `@angular/material` |
| 6. Données | `pl-table`, `pl-pagination`, `pl-tree`, dates, `pl-steps`, `pl-timeline` ; admin, membres, suivi | Plus aucun import `ng-zorro-antd` |

Material part d'abord : environ 100 templates contre 180 pour ng-zorro, et surtout des éléments
simples.

## Risques

| Risque | Parade |
| --- | --- |
| Les web components élève changent d'apparence dans des exercices existants | Captures avant et après sur le playground |
| Les tutoriels ciblent des classes `.ant-*` et `.mat-*` | Les passer sur des attributs `data-tuto` |
| Le champ `icon` des annonces stocke un nom d'icône Ant | Table de correspondance, puis migration |
| ng-zorro 20 déclare Angular 20 | Raison de plus pour le retirer |
| L'accueil demande des agrégats (activités ouvertes de tous ses cours) | Un point d'API `activities/mine` si le client ne suffit pas |

## Décisions à valider

1. L'accent encre violette, tiré du logo.
2. Atkinson Hyperlegible Next et Mono.
3. `libs/design-system` et le préfixe `pl-`.
4. « Ressources » à la place d'« Espace de travail » ; pas de barre supérieure sur bureau.
5. Le vouvoiement partout.
6. La marge de la copie comme motif de l'identité.
