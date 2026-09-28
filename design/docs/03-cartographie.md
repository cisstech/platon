# Cartographie des composants

Usage de Angular Material et ng-zorro-antd dans `apps/web`, `apps/home` et `libs` (hors `apps/docs`),
relevé le 28 septembre 2026 par recherche de sélecteurs. Les comptes sont justes à quelques unités
près.

Material 22.1 est présent dans environ 100 templates, ng-zorro 20.4 dans environ 190, les deux dans 78. ng-zorro 20 attend `@angular/core ^20` alors que l'app tourne en Angular 22 : chaque montée
d'Angular dépend de lui.

## Material vers le design system

| Material                                         | Templates            | Usage                                                                          | Remplacé par                    |
| ------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------ | ------------------------------- |
| `mat-icon`                                       | 65 (235 occurrences) | Ligatures Material Icons, plus des noms calculés par pipes (`resourceIcon`...) | `pl-icon`                       |
| `mat-card`                                       | 29                   | En-tête, titre, contenu, actions                                               | `pl-card`                       |
| `mat-*-button`, `mat-fab`                        | environ 25           | Surtout `mat-icon-button` et `mat-raised-button`                               | `pl-button`, `pl-icon-button`   |
| `mat-form-field` + `matInput`                    | 23 (63 champs)       | Surtout `fill`, parfois `outline`                                              | `pl-field` + `plInput`          |
| `mat-drawer-container`, `mat-toolbar`            | 2                    | Cadre de l'app, lecteur de correction                                          | `pl-shell`, `pl-nav`            |
| `mat-select`                                     | 6                    | Simple et multiple                                                             | `pl-select`                     |
| `matTooltip`                                     | 6                    | Aides                                                                          | `pl-tooltip`                    |
| `mat-menu`                                       | 3                    | Menus utilisateur, création, thème ; lecteur                                   | `pl-menu`                       |
| `mat-chips`                                      | 3                    | Filtres retirables                                                             | `pl-tag`                        |
| `mat-expansion`                                  | 3                    | Lecteur, éditeur PLA                                                           | `pl-disclosure`                 |
| `mat-radio`, `mat-checkbox`                      | 5                    | Formulaires                                                                    | `pl-radio-group`, `pl-checkbox` |
| `mat-autocomplete`                               | 2                    | Modération, champ de réponse                                                   | `pl-combobox`                   |
| `mat-table` + `matSort`                          | 1                    | Synthèse des corrections                                                       | `pl-table`                      |
| `mat-divider`, `mat-spinner`, `mat-progress-bar` | environ 7            | Séparateurs, chargement                                                        | `pl-spinner`, `pl-progress`     |
| `MatDialog`                                      | 7 appels             | Tests, annonces, builder                                                       | `PlDialog`                      |

Importés mais inutilisés : `datepicker`, `button-toggle`.

## ng-zorro vers le design system

| ng-zorro                                                                              | Templates         | Remplacé par                                                    |
| ------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------- |
| `nz-button`                                                                           | 100 (environ 270) | `pl-button`, `pl-icon-button`                                   |
| `nz-icon`                                                                             | 71 (environ 225)  | `pl-icon`                                                       |
| `nz-tooltip`                                                                          | 47                | `pl-tooltip`                                                    |
| `nz-spin`                                                                             | 37                | `pl-spinner`                                                    |
| `nz-select`                                                                           | 24                | `pl-select`                                                     |
| `nz-form`                                                                             | 22                | `pl-field`                                                      |
| `nz-popconfirm`                                                                       | 17                | `plConfirm`                                                     |
| `nz-input`                                                                            | 15                | `pl-field` + `plInput`                                          |
| `nz-empty`                                                                            | 15                | `pl-empty-state`                                                |
| `nz-table`                                                                            | 14                | `pl-table`, `pl-pagination`                                     |
| `nz-skeleton`                                                                         | 13                | `pl-skeleton`                                                   |
| `nz-tag`, `nz-badge`, `nz-ribbon`                                                     | 13, 6, 8          | `pl-tag`, `pl-badge`                                            |
| `nz-popover`                                                                          | 11                | `pl-popover`                                                    |
| `nz-page-header`, `nz-breadcrumb`                                                     | 9 chacun          | `pl-page-header`                                                |
| `nz-tabs`                                                                             | 7                 | `pl-tabs`                                                       |
| `nz-collapse`                                                                         | 8                 | `pl-accordion`                                                  |
| `nz-modal`, `nz-drawer`                                                               | 6, 5              | `PlDialog`, `pl-drawer`                                         |
| `nz-dropdown`                                                                         | 5                 | `pl-menu`                                                       |
| `nz-date-picker`, `nz-range-picker`, `nz-time-picker`                                 | 8                 | `pl-date-picker`, `pl-date-range`                               |
| `nz-tree`, `nz-tree-select`, `nz-tree-view`                                           | 5                 | `pl-tree`                                                       |
| `nz-input-number`                                                                     | 9                 | `pl-number-input`                                               |
| `nz-switch`, `nz-radio`, `nz-checkbox`                                                | 4, 1, 9           | `pl-switch`, `pl-radio-group`, `pl-checkbox`                    |
| `nz-steps`, `nz-timeline`, `nz-countdown`, `nz-segmented`, `nz-slider`, `nz-progress` | 1 à 4             | composants `pl-` du même nom (`pl-progress` pour `nz-progress`) |
| Services `NzModalService`, `NzMessageService`, `NzNotificationService`                | 13, 8, 3 fichiers | `PlDialog`, `pl-toast`                                          |

## Façades à garder

Ces composants maison sont déjà partout. On garde leur API et on change l'intérieur : les appels
n'ont pas à bouger.

| Façade                                                    | Consommateurs                   | Enveloppe aujourd'hui                 |
| --------------------------------------------------------- | ------------------------------- | ------------------------------------- |
| `DialogService`                                           | 59 fichiers, environ 180 appels | NzModal, NzMessage, NzNotification    |
| `user-avatar`                                             | 20 templates                    | nz-avatar, nz-badge, nz-tooltip       |
| `ui-search-bar`                                           | 13                              | nz-autocomplete, mat-button, mat-icon |
| `ui-statistic-card`                                       | 8                               | mat-icon, nz-icon, nz-input-number    |
| `ui-modal-drawer`, `ui-modal-template`, `ui-modal-iframe` | 7 à 8 chacun                    | nz-drawer, nz-modal                   |
| `ui-layout-tabs`                                          | 6                               | nz-tabs avec liens de routeur         |
| `ui-stepper`                                              | 4                               | nz-steps                              |
| `ui-filter-indicators`                                    | 4                               | mat-chips                             |
| `user-table`, `user-group-table`                          | 4                               | nz-table, pagination serveur          |

## Points d'attention

- **API d'auteur** : `wc-input-box` expose `appearance: 'fill' | 'outline' | 'inline'` aux exercices.
  Elle doit continuer de marcher.
- **Donnée stockée** : le champ `icon` des annonces contient un nom d'icône Ant. Il faut une table de
  correspondance ou une migration.
- **Code qui lit des classes de bibliothèque** : les tutoriels ciblent `.ant-tabs-nav`,
  `.mat-mdc-menu-panel`..., le sélecteur de couleur lit `.ant-slider-*`.
- **Sélecteurs sans effet** : `nz-flex` (5 templates, jamais importé), `matRipple` (non importé),
  `matTextareaAutosize`. À retirer tout de suite.
- **Surcharges de style** : environ 110 `.ant-*`, 30 `.mat-*`, 85 `::ng-deep`. Le plus lourd :
  `activity-settings.component.scss` (une trentaine de `.ant-*`).
- **Thèmes** : Material en API M2, ng-zorro en Less, chacun en deux bundles (clair, sombre) chargés
  par `ThemeService`.
- **Préfixe** : `pl-`, car `@cisstech/nge` utilise déjà `ui-` (`ui-icon`, `ui-list`, `ui-tree`...).
  Deux composants sur le même sélecteur cassent la compilation.

## Icônes

Trois systèmes : `mat-icon` (ligatures), `nz-icon` (noms Ant, SVG chargés à l'exécution) et
`@cisstech/nge/ui/icon` (codicons, Font Awesome, surtout dans l'éditeur). Material Symbols Outlined
est déjà déclarée dans `shared/styles/fonts.scss`.

Cible : un seul `pl-icon` sur un sprite SVG Material Symbols. Les noms des ligatures `mat-icon`
restent valables, la migration est donc mécanique. Les noms Ant passent par une table. L'éditeur
garde ses codicons.

## Composants `pl-` à construire

Priorité **1** : cadre de l'app et retrait de Material. **2** : listes et formulaires. **3** : retrait
complet de ng-zorro.

| Priorité | Composants                                                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Tokens (couleur, typo, espacement, rayon, élévation, mouvement, z-index ; clair et sombre), polices auto-hébergées, sprite d'icônes, pont de thème pour Material et ng-zorro pendant la transition      |
| 1        | `pl-icon`, `pl-button`, `pl-icon-button` (libellé accessible obligatoire), `pl-menu` (CDK Menu), `pl-tooltip`, `pl-shell`, `pl-nav`, `pl-nav-item`                                                      |
| 1        | `pl-card`, `pl-avatar`, `pl-error-state` (avec « Réessayer »), `pl-toast` (derrière `DialogService`), `PlDialog` (CDK Dialog)                                                                           |
| 2        | `pl-page-header`, `pl-tabs`, `pl-badge`, `pl-tag`, `pl-empty-state` (rien encore, aucun résultat, accès refusé), `pl-skeleton`, `pl-spinner`, `pl-progress`, `pl-stat`, `pl-disclosure`, `pl-accordion` |
| 2        | `pl-field` + `plInput`, `pl-select`, `pl-combobox`, `pl-checkbox`, `pl-radio-group`, `pl-switch`, `pl-drawer`, `pl-popover`, `plConfirm`                                                                |
| 3        | `pl-number-input`, `pl-date-picker`, `pl-date-range`, `pl-segmented`, `pl-slider`, `pl-table`, `pl-pagination`, `pl-tree` (CDK Tree), `pl-steps`, `pl-timeline`, `pl-countdown`                         |

Hors design system : l'éditeur nge-ide, Editor.js, ECharts (thématisé par les tokens).
