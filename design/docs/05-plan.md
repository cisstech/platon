# Plan de refonte

## Méthode

La nouvelle interface se construit **à côté** de l'ancienne, pas à sa place : une seule
application, deux interfaces choisies au démarrage, et une personne qui essaie la nouvelle quand
elle le veut. Les écrans pas encore portés s'ouvrent dans l'ancienne interface, à la même adresse.
Tout ce qui est sous les composants (modèles, services d'API, authentification) sert aux deux.

Le suivi du code, les décisions et les tickets sont dans [`docs/backlog`](../../docs/backlog/).

## La bibliothèque

- `libs/design-system`, alias `@platon/design-system`, préfixe `pl-` (`ui-` est pris par nge).
- Standalone, OnPush, `input()` et `output()`, `inject()`, CDK pour les comportements, aucune
  dépendance à Material ni à ng-zorro.
- Tokens dans `tokens.css`, variables `--pl-*`, clair et sombre. L'ancienne interface garde ses
  `--brand-*` : les deux ne se mélangent pas.

## Storybook

Storybook 10 (compatibilité Angular 22 à confirmer), `addon-docs` et
`addon-a11y`, styles de la nouvelle interface seulement, sélecteur de thème, stories CSF3 pilotées par `args`, une
story par état (défaut, désactivé, chargement, erreur, vide), textes réels en français, une page
de tokens.

## Garde-fous

- Pas de couleur, taille ou rayon en dur dans `libs/design-system` ; toute `var(--pl-*)` existe.
- Préfixe `pl-` imposé par ESLint.
- Pas de tiret cadratin ni demi-cadratin.
- Les wireframes de `design/` passent leur vérification en intégration continue.

## Phases

L'ordre et le détail sont dans la [roadmap](../../docs/backlog/ROADMAP.md) : le socle de la bascule,
les fondations, le cadre, puis les parcours (accueils, cours, ressources, lecteur, tests,
administration), puis la bascule en trois paliers.

## Risques

| Risque                                                                     | Parade                                                                                                             |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Deux interfaces à maintenir en même temps                                  | Tout ce qui est sous les composants est partagé ; la bascule a des paliers datés ; chaque écran livré sort du pont |
| Les web components élève changent d'apparence dans des exercices existants | Captures avant et après sur le playground                                                                          |
| Les tutoriels ciblent des classes `.ant-*` et `.mat-*`                     | Les passer sur des attributs `data-tuto`                                                                           |
| Le champ `icon` des annonces stocke un nom d'icône Ant                     | Table de correspondance, puis migration                                                                            |
| ng-zorro 20 déclare Angular 20                                             | Raison de plus pour le retirer                                                                                     |
| L'accueil demande des agrégats (activités ouvertes de tous ses cours)      | Un point d'API `activities/mine` si le client ne suffit pas                                                        |

## Décisions à valider

1. L'accent encre violette, tiré du logo.
2. Atkinson Hyperlegible Next et Mono.
3. `libs/design-system` et le préfixe `pl-`.
4. « Ressources » à la place d'« Espace de travail » ; pas de barre supérieure sur bureau.
5. Le vouvoiement partout.
6. La marge de la copie comme motif de l'identité.
