# Cartographie des composants

Inventaire de Angular Material et ng-zorro-antd dans `apps/web`, `apps/home` et `libs/**` (hors
`apps/docs`), relevé le 28 septembre 2026. Les comptes de templates sont obtenus par recherche de
sélecteurs : ils sont justes à quelques unités près.

## Vue d'ensemble

| | Angular Material 22 | ng-zorro-antd 20 | CDK 22 |
| --- | --- | --- | --- |
| Points d'entrée importés | 23 | 53 | 7 |
| Fichiers TS qui importent | 124 | 216 | 25 |
| Templates qui utilisent des sélecteurs | environ 103 | 191 | environ 20 |
| Templates qui utilisent les deux | 78 | 78 | |

ng-zorro 20 déclare Angular 20 en dépendance, alors que l'application tourne en Angular 22. Chaque
mise à jour d'Angular reste donc suspendue à ng-zorro tant qu'il est là.

Répartition par zone (templates avec Material / avec ng-zorro / total) :

| Zone | Material | ng-zorro | Total |
| --- | --- | --- | --- |
| apps/web | 42 | 83 | 105 |
| apps/home | 5 | 0 | 11 |
| libs/core/browser | 3 | 11 | 13 |
| libs/shared/ui | 4 | 19 | 24 |
| libs/feature/webcomponent (surface élève) | 12 | 10 | 36 |
| feature/course | 4 | 21 | 22 |
| feature/player | 11 | 10 | 13 |
| feature/resource | 6 | 12 | 17 |
| feature/result | 5 | 6 | 12 |
| autres features (cas, lti, tests, announcement, builder, notification, tuto) | 12 | 19 | 23 |

## Material : ce qui est réellement utilisé

| Élément | Templates | Usage réel |
| --- | --- | --- |
| `mat-icon` | 65 (235 occurrences) | Ligatures Material Icons Outlined, environ 111 noms, plus des noms dynamiques issus de pipes (`resourceIcon`, `answerStateIcon`...) |
| `mat-card` | 29 | En-tête, titre, sous-titre, contenu, actions. Jamais d'image ni d'avatar |
| Boutons | 26 | `mat-icon-button` 15 fichiers, `mat-raised-button` 11, `mat-stroked-button` 5, `mat-button` 5, `mat-fab` 3, `mat-mini-fab` 1 |
| `mat-form-field` + `matInput` | 23 (63 champs) | `fill` 48 fois, `outline` 11, liée à une entrée publique 4 fois ; label, hint, erreur, préfixe et suffixe ; textareas auto-dimensionnées |
| Cadre de l'application | 2 | `mat-drawer-container` et `mat-toolbar` dans `pages/dashboard`, et la barre latérale du lecteur de correction |
| `matTooltip` | 6 | Libellés d'aide |
| `mat-select` | 6 | Simple et multiple |
| `mat-menu` | 4 | Menu utilisateur, menus du lecteur |
| `mat-chips` | 3 | Indicateurs de filtres retirables |
| `mat-expansion` | 3 | Lecteur et éditeur PLA |
| `mat-radio`, `mat-checkbox` | 5 | Formulaires réactifs |
| `mat-autocomplete` | 2 | Modération d'activité, champ de réponse élève |
| `mat-table` + `matSort` | 1 | Tableau de synthèse des corrections |
| `mat-divider`, `mat-spinner`, `mat-progress-bar` | 7 | Séparateurs, chargement |
| `MatDialog` (service) | 7 appels | Éditeurs de conditions et de courriel des tests, annonces, invite IA du builder |

Inutilisés malgré l'import : `datepicker`, `button-toggle`. Jamais utilisés : snack-bar, bottom-sheet,
tabs, stepper, paginator, badge, list, tree.

## ng-zorro : ce qui est réellement utilisé

Les plus présents, par nombre de templates :

| Élément | Templates | Usage réel |
| --- | --- | --- |
| `nz-button` | 101 (269) | `primary` dans 80 fichiers, `nzDanger` 30, formes cercle et arrondie, tailles, chargement |
| `nz-icon` | 71 (environ 220) | 68 noms d'icônes Ant, SVG chargés à l'exécution |
| `nz-tooltip` | 47 | Surtout la forme courte `nz-tooltip="..."` |
| `nz-spin` | 37 | Indicateur de chargement, souvent seul |
| `nz-select` | 24 | Recherche, multiple, étiquettes, gabarits d'option |
| `nz-form` | 22 | Grille label et contrôle, 136 lignes de formulaire |
| `nz-popconfirm` | 17 | Confirmation avant action |
| `nz-empty` | 15 | États vides |
| `nz-input` | 16 | Champs et zones de texte |
| `nz-table` | 14 | 5 avec pagination serveur, 6 avec sélection de lignes |
| `nz-skeleton` | 13 | Chargements |
| `nz-tag` | 13 | Statuts, étiquettes éditables |
| `nz-popover`, `nz-grid`, `nz-badge` et `nz-ribbon` | 11 à 14 chacun | |
| `nz-page-header`, `nz-breadcrumb` | 9 chacun | En-têtes de pages de détail |
| `nz-collapse`, `nz-date-picker`, `nz-tabs`, `nz-modal`, `nz-drawer`, `nz-dropdown` | 5 à 8 chacun | |
| `nz-tree`, `nz-tree-select`, `nz-tree-view` | 5 | Fichiers, groupes, arbre des cercles |
| Rares | 1 à 4 | timeline, switch, countdown, result, progress, slider, segmented, avatar, steps, space, rate, radio, qr-code, comment, calendar, time-picker, auto-complete |

Services utilisés par le code : `NzModalService` (11 fichiers), `NzMessageService` (6),
`NzNotificationService` (2), `NzContextMenuService` (2).

## Les façades à préserver

C'est là que se joue la transition. Ces composants et services maison sont déjà utilisés partout ;
en gardant leur API et en changeant leur intérieur, des centaines d'appels n'ont pas à bouger.

| Façade | Consommateurs | Enveloppe aujourd'hui | API à garder |
| --- | --- | --- | --- |
| `DialogService` | 58 fichiers, environ 180 appels (`error` 98, `success` 60...) | NzModal, NzMessage, NzNotification | `success`, `error`, `info`, `warning`, `confirm`, `prompt`, `loading`, `notification` |
| `user-avatar` | 21 templates | nz-avatar, nz-badge, nz-tooltip | toutes ses entrées |
| `ui-search-bar` | 13 | nz-autocomplete, mat-button, mat-icon | `searchbar`, `filter` |
| `ui-statistic-card` | 8 | mat-icon, nz-icon, nz-input-number | ses entrées ; `matIcon` devient un nom d'icône générique |
| `ui-modal-drawer` | 8 | nz-drawer | ses entrées, sauf les types `NzDrawer*` à remplacer |
| `ui-modal-template` | 8 | nz-modal | toutes ses entrées et sorties |
| `ui-modal-iframe` | 7 | nz-modal | toutes |
| `ui-layout-tabs` | 6 | nz-tabs avec liens de routeur | toutes |
| `ui-stepper` | 4 | nz-steps | toutes |
| `ui-filter-indicators` | 4 | mat-chips | toutes |
| `user-table`, `user-group-table` | 4 | nz-table avec pagination serveur | toutes, plus le type `NzTableColumn<T>` à renommer |

Points à traiter avec soin :

- **Web components élève** : `wc-input-box` et `wc-picker` exposent aux auteurs d'exercices une
  entrée publique `appearance: 'fill' | 'outline' | 'inline'`. C'est une API d'auteur, elle doit
  continuer de fonctionner.
- **Données persistées** : le champ `icon` des annonces stocke un nom d'icône Ant. Il faudra une
  table de correspondance ou une migration.
- **Code qui lit des classes de bibliothèque** : les tutoriels ciblent `.ant-tabs-nav`,
  `.ant-ribbon` et `.mat-mdc-menu-panel`, le sélecteur de couleur lit `.ant-slider-*`.
- **Sélecteurs inertes** : `nz-flex` (5 templates) sans import, `matRipple` et
  `matTextareaAutosize` sans directive. Ils ne font rien aujourd'hui et peuvent partir tout de
  suite.
- **Styles** : 124 surcharges `.ant-*`, 45 `.mat-*`, 85 `::ng-deep`. La plus lourde est
  `activity-settings.component.scss` (28 surcharges Ant).
- **Thèmes** : Material en API M2, ng-zorro en variables Less, chacun compilé en deux bundles
  (clair et sombre) chargés à l'exécution par `ThemeService`.

## Icônes

Trois systèmes cohabitent : `mat-icon` (ligatures, environ 111 noms), `nz-icon` (68 noms Ant) et
`@cisstech/nge/ui/icon` (codicons et Font Awesome, surtout dans l'éditeur).

Proposition : un seul composant d'icône à partir d'un sprite SVG de Material Symbols (graisse 300).
Les noms restent ceux des ligatures `mat-icon` actuelles, donc la migration des 235 occurrences est
mécanique. Les 68 noms Ant sont traduits une fois dans une table. L'éditeur (nge-ide) garde ses
codicons, qui sont le langage des éditeurs de code.

## Composants du design system à créer

Préfixe proposé : `pl-`. Le préfixe `ui-` est déjà pris par `@cisstech/nge` (`ui-icon`, `ui-list`),
et une collision de sélecteur casse la compilation dès qu'un composant importe les deux.

Priorité : **1** pour le cadre de l'application et le retrait de Material, **2** pour les listes et
les formulaires, **3** pour le retrait de ng-zorro.

### Fondations

| Élément | Remplace | Priorité |
| --- | --- | --- |
| Tokens (couleur, typographie, espacement, rayon, élévation, mouvement, z-index), clair et sombre | variables `--brand-*`, thèmes M2 et Less | 1 |
| Polices auto-hébergées (Atkinson Hyperlegible Next et Mono) | Source Sans Pro, Roboto | 1 |
| Sprite d'icônes | Material Icons, Ant icons | 1 |
| Pont de thème : Material et ng-zorro lisent les tokens pendant la transition | thèmes actuels | 1 |

### Actions et navigation

| Composant | Remplace | Occurrences | Priorité |
| --- | --- | --- | --- |
| `pl-icon` | `mat-icon`, `nz-icon` | 235 + 220 | 1 |
| `pl-button` (primaire, secondaire, discret, danger ; tailles ; chargement ; icône) | `mat-*-button`, `nz-button` | 26 + 101 templates | 1 |
| `pl-icon-button` (libellé accessible obligatoire) | `mat-icon-button`, `nz-button nzShape="circle"` | 15 + 18 fichiers | 1 |
| `pl-menu` (sur CDK Menu) | `mat-menu`, `nz-dropdown` | 4 + 5 | 1 |
| `pl-tooltip` | `matTooltip`, `nz-tooltip` | 6 + 47 | 1 |
| `pl-shell`, `pl-nav`, `pl-nav-item` | `mat-drawer-container`, `mat-toolbar`, barre latérale | 2 | 1 |
| `pl-page-header` (fil d'Ariane, titre, description, actions) | `nz-page-header`, `nz-breadcrumb`, en-têtes maison | 9 + gabarits | 2 |
| `pl-tabs` (liens de routeur) | `nz-tabs`, intérieur de `ui-layout-tabs` | 7 | 2 |

### Contenu et retour

| Composant | Remplace | Occurrences | Priorité |
| --- | --- | --- | --- |
| `pl-card` | `mat-card`, `nz-card` | 29 + 2 | 1 |
| `pl-avatar` | intérieur de `user-avatar`, `nz-avatar` | 21 | 1 |
| `pl-badge`, `pl-tag` (état, filtre retirable) | `nz-badge`, `nz-tag`, `mat-chips`, `nz-ribbon` | 6 + 13 + 3 + 8 | 2 |
| `pl-empty-state` (rien encore, aucun résultat, accès refusé) | `nz-empty`, `nz-result`, illustrations actuelles | 15 + 4 | 2 |
| `pl-error-state` (avec réessai) | nouveau | | 1 |
| `pl-skeleton`, `pl-spinner`, `pl-progress` (barre et anneau) | `nz-skeleton`, `nz-spin`, `mat-spinner`, `mat-progress-bar`, `nz-progress` | 13 + 37 + 7 + 4 | 2 |
| `pl-stat` (intérieur de `ui-statistic-card`) | cartes actuelles | 8 | 2 |
| `pl-disclosure`, `pl-accordion` | `mat-expansion`, `nz-collapse` | 3 + 8 | 2 |
| `pl-toast` (derrière `DialogService`) | `NzMessageService`, `NzNotificationService` | 180 appels | 1 |

### Formulaires

| Composant | Remplace | Occurrences | Priorité |
| --- | --- | --- | --- |
| `pl-field` (label, aide, erreur, préfixe, suffixe) + directive `plInput` | `mat-form-field`, `matInput`, `nz-form-item` | 23 + 22 | 2 |
| `pl-select` (simple, multiple, recherche) | `mat-select`, `nz-select` | 6 + 24 | 2 |
| `pl-combobox` (saisie avec suggestions) | `mat-autocomplete`, `nz-autocomplete` | 2 + 1 | 2 |
| `pl-checkbox`, `pl-radio-group`, `pl-switch` | `mat-checkbox`, `mat-radio`, `nz-checkbox`, `nz-switch`, `nz-radio` | 5 + 9 + 4 + 1 | 2 |
| `pl-number-input` | `nz-input-number` | 9 | 3 |
| `pl-date-picker`, `pl-date-range` | `nz-date-picker`, `nz-range-picker`, `nz-time-picker` | 7 + 1 | 3 |
| `pl-segmented` | `nz-segmented` | 3 | 3 |
| `pl-slider` | `nz-slider` | 3 | 3 |

### Surcouches

| Composant | Remplace | Occurrences | Priorité |
| --- | --- | --- | --- |
| `PlDialog` (service, sur CDK Dialog) | `MatDialog`, `NzModalService`, `nz-modal` | 7 appels + 11 fichiers + 6 | 1 |
| `pl-drawer` (intérieur de `ui-modal-drawer`) | `nz-drawer` | 5 | 2 |
| `pl-popover`, `plConfirm` (confirmation en place) | `nz-popover`, `nz-popconfirm` | 11 + 17 | 2 |

### Données

| Composant | Remplace | Occurrences | Priorité |
| --- | --- | --- | --- |
| `pl-table` (tri, sélection, pagination serveur, colonnes en gabarits) | `nz-table`, `mat-table` | 14 + 1 | 3 |
| `pl-pagination` | pagination de `nz-table` | 5 | 3 |
| `pl-tree` (sur CDK Tree) | `nz-tree`, `nz-tree-view`, `nz-tree-select` | 5 | 3 |
| `pl-steps` (intérieur de `ui-stepper`) | `nz-steps` | 1 | 3 |
| `pl-timeline` | `nz-timeline` | 3 | 3 |
| `pl-countdown` | `nz-countdown` | 3 | 3 |

Ce qui reste hors du design system : l'éditeur nge-ide (langage d'éditeur de code), Editor.js,
ECharts (thématisé par les tokens), le calendrier de l'agenda (écran désactivé).
