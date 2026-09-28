# Plan de refonte

## Stratégie : des tranches verticales sur des fondations

Partir uniquement du haut (le cadre, les pages) oblige à construire des écrans sur des composants
qui n'existent pas encore. Partir uniquement du bas (tous les atomes d'abord) repousse le premier
résultat visible de plusieurs semaines et produit des composants qu'aucun écran n'a encore mis à
l'épreuve.

On fait donc les deux, dans cet ordre :

1. **Les fondations d'abord**, parce qu'elles changent toute l'application d'un coup : tokens,
   polices, icônes, et un pont qui fait lire ces tokens à Material et à ng-zorro pendant la
   transition. Dès cette étape, plus de beige, un seul accent, une seule typographie.
2. **Puis une tranche par écran ou par famille d'écrans**, en commençant par le haut (le cadre de
   l'application). Chaque tranche construit dans Storybook les seuls composants dont elle a besoin,
   puis migre ses écrans. Un composant n'entre dans le design system que lorsqu'un vrai écran
   l'utilise.

Chaque tranche suit la même boucle : spec et wireframes dans `design/` (relus et validés), composants
dans Storybook, migration des écrans, captures avant et après sur les mêmes données.

## Garder les API

La transition se joue sur les façades déjà en place (détail dans la cartographie) :

- `DialogService` garde toutes ses méthodes ; son intérieur passe de ng-zorro au design system.
  Les 180 appels ne bougent pas.
- Les composants `ui-*` de `@platon/shared/ui` et `user-avatar` gardent leurs entrées et leurs
  sorties. Seuls les types qui exposent ng-zorro (`NzDrawerSize`, `NzTableColumn<T>`,
  `ModalOptions`) reçoivent un équivalent neutre, avec un alias le temps de la migration.
- Les web components élève gardent leur entrée publique `appearance`.
- Pour Material, il n'y a pas de façade : les remplacements de `mat-icon`, `mat-card` et des
  boutons se font par script (codemod), vérifiés par la compilation.

## La bibliothèque

- Emplacement : `libs/design-system`, alias `@platon/design-system`.
- Préfixe des sélecteurs : `pl-` pour les composants, `pl` en camelCase pour les directives
  (`plTooltip`, `plInput`). Le préfixe `ui-` est pris par `@cisstech/nge`.
- Conventions : composants standalone, `ChangeDetectionStrategy.OnPush`, `input()` et `output()`,
  `inject()`, objet `host` plutôt que `@HostBinding`, CDK pour les comportements (overlay, menu,
  dialogue, listbox, a11y) et aucune dépendance à Material ni à ng-zorro.
- Tokens : `libs/design-system/src/styles/tokens.css`, variables préfixées `--pl-` (couleur,
  typographie, espacement, rayon, ombre, mouvement, z-index), clair et sombre. Les variables
  `--brand-*` actuelles deviennent des alias des nouvelles, pour que les styles existants suivent
  sans être réécrits.

## Storybook

Même base que sabyo et placy, avec les corrections relevées pendant l'étude :

- `storybook` et `@storybook/angular` en 10.3, compatibilité Angular 22 à confirmer à
  l'installation ; `@storybook/addon-docs` pour la documentation générée, `@storybook/addon-a11y`
  pour le contrôle d'accessibilité de chaque story.
- Cibles `storybook` et `build-storybook` sur `libs/design-system`, avec `browserTarget: web:build`
  pour charger les styles globaux, et `staticDirs` vers les assets (sprite d'icônes, polices).
- `preview-head.html` pour les polices, un sélecteur de thème clair et sombre dans la barre
  d'outils (décorateur qui pose la classe du thème), arrière-plans et viewports au format de
  Storybook 10 (`options`, et non plus `values` et `viewports`).
- Stories en CSF3 pilotées par `args` (le modèle de placy) : une story par état qui compte
  (défaut, désactivé, chargement, erreur, vide), avec des contenus réels en français.
- Une page d'introduction et une page de tokens (couleurs, typographie, espacements) générées à
  partir des variables CSS.

## Garde-fous

- Lint des tokens : pas de couleur brute, de taille de police ni de rayon en dur dans
  `libs/design-system` et dans les zones déjà migrées ; toute variable `var(--pl-...)` doit exister.
- Règle ESLint sur le préfixe des sélecteurs de la bibliothèque.
- Lint des tirets cadratins et demi-cadratins dans les textes de l'application.
- `foundry check` vert sur `design/` en intégration continue.

## Phases

| Phase | Contenu | Critère de sortie |
| --- | --- | --- |
| **0. Fondations** | Tokens clair et sombre, polices auto-hébergées, sprite d'icônes et `pl-icon`, pont de thème Material et ng-zorro, bibliothèque et Storybook, garde-fous | L'application entière a la nouvelle palette et la nouvelle typographie sans écran cassé ; Storybook tourne avec la page des tokens |
| **1. Cadre** | `pl-button`, `pl-icon-button`, `pl-menu`, `pl-tooltip`, `pl-avatar`, `pl-badge`, `pl-shell` et `pl-nav` ; navigation par rôle, menu Créer, profil, mobile ; fin du cadre rouge admin | `mat-sidenav`, `mat-toolbar` et `mat-menu` sortis du cadre ; parcours de navigation vérifiés pour les trois rôles |
| **2. Accueils et gabarit** | `pl-page-header`, `pl-card`, `pl-stat`, `pl-empty-state`, `pl-error-state`, `pl-skeleton`, `pl-tabs` ; accueil étudiant et accueil enseignant ; en-tête unique sur toutes les pages | Les deux accueils en production ; plus aucune erreur affichée comme un vide sur les écrans migrés |
| **3. Formulaires** | `pl-field`, `plInput`, `pl-select`, `pl-combobox`, `pl-checkbox`, `pl-radio-group`, `pl-switch` ; connexion, compte, paramètres, création de cours et d'activité | `mat-form-field` et `matInput` retirés (23 templates) |
| **4. Surcouches et retours** | `PlDialog`, `pl-toast` derrière `DialogService`, `pl-drawer`, `pl-popover`, `plConfirm` | `MatDialog` et `NzModalService` retirés ; façades inchangées |
| **5. Lecteur et web components** | Surface « copie » avec la marge, lecteur d'activité et d'exercice, correction ; web components élève | Plus aucun import `@angular/material` ; paquet et thèmes M2 supprimés |
| **6. Données et fin de ng-zorro** | `pl-table`, `pl-pagination`, `pl-tree`, sélecteurs de date, `pl-steps`, `pl-timeline`, `pl-countdown` ; administration, membres, résultats | Plus aucun import `ng-zorro-antd` ; paquet, thèmes Less et icônes Ant supprimés |

Material part d'abord, comme prévu : il est moins présent (environ 103 templates contre 191) et
concentré sur des éléments simples (icônes, cartes, boutons, champs). ng-zorro reste en place
jusqu'à la phase 6, mais il suit déjà les tokens grâce au pont de thème.

## Risques

| Risque | Parade |
| --- | --- |
| Les web components élève changent d'apparence dans des exercices existants | Garder `appearance`, comparer des captures sur les exercices de la documentation (playground) avant et après |
| Les tutoriels ciblent des classes `.ant-*` et `.mat-*` | Passer les tutoriels sur des attributs `data-tuto`, déjà en partie en place avec les identifiants `tuto-*` |
| Le champ `icon` des annonces stocke un nom d'icône Ant | Table de correspondance vers les noms Material Symbols, puis migration des données |
| ng-zorro 20 déclare Angular 20 alors que l'application est en Angular 22 | Raison de plus pour le retirer ; en attendant, ne pas monter ng-zorro sans tester |
| Les accueils demandent des données que l'API ne fournit peut-être pas encore (activités ouvertes de tous les cours d'un étudiant, corrections en attente d'un enseignant) | Vérifier les points d'accès en phase 2 ; prévoir un point d'API d'agrégation si nécessaire |
| Le bundle initial dépasse déjà son budget (8,9 Mo pour 6,3 Mo) | Mesurer à chaque phase ; le retrait des deux bibliothèques doit le réduire |

## Décisions à valider

1. L'accent : l'encre violette dérivée du logo.
2. La typographie : Atkinson Hyperlegible Next et Mono.
3. Le préfixe `pl-` et la bibliothèque `libs/design-system`.
4. La navigation : « Ressources » à la place d'« Espace de travail », les annonces rattachées à
   l'accueil et aux notifications, la barre supérieure supprimée sur bureau.
5. Le vouvoiement partout, lecteur compris.
6. La marge de la copie comme seul motif de l'identité.
