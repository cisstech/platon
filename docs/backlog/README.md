# Backlog de la nouvelle interface

Ce dossier suit ce qui reste à faire pour livrer la nouvelle interface de PLaTon. Les wireframes et
la direction artistique sont dans [`design/`](../../design/) ; ici, on décrit le code.

- [ROADMAP.md](./ROADMAP.md) : où on en est, l'ordre, les phases.
- [DECISIONS.md](./DECISIONS.md) : les décisions numérotées. Une décision se remplace par une
  nouvelle ligne datée ; elle ne se rediscute pas dans un ticket.
- Les tickets ouverts sont à la racine du dossier ; livrés, ils vont dans [`done/`](./done/) ;
  abandonnés, dans `retired/` avec un bandeau « Retiré le … ».

## Nommer un ticket

`<Phase>-<nn>-<slug>.md`. La phase est une lettre (voir la roadmap), le slug en français, en
kebab-case, sans accent. Exemple : `S-01-choisir-l-interface-au-demarrage.md`.

## Gabarit

Pas de frontmatter. Une section vide dit « aucun », elle n'est jamais omise.

```
# <Phase>-<nn> : <titre>

Source : <wireframe, écran ou décision> ; décisions : Dx.
Statut : À faire | En cours | Livré (AAAA-MM-JJ).
Dépend de : <tickets> | aucun.
Taille : S | M | L.

## 1. Comportement attendu
Étant donné …, quand …, alors …

## 2. Tests à écrire d'abord
Unitaires (jest), composants (Storybook et tests de composant), bout en bout si le parcours change.

## 3. État actuel du code
Chemins vérifiés, avec la date de vérification.

## 4. Changements
Par couche : design system, core (providers, services, stores), pages, configuration.

## 5. Hors scope

## 6. Points ouverts

## 7. Definition of Done
- [ ] …
```

Après la livraison, les écarts s'ajoutent en citation : `> **Amendement à la livraison.** …`,
`> **Défaut trouvé en chemin.** …`.

## Où vit le code

- `apps/web/src/main.ts` : choisit l'interface et ne charge qu'elle.
- `apps/web/src/ui-switch/` : le choix, avant Angular et sans lui (mode, préférence, drapeau,
  adresses, feuille globale).
- `apps/web/src/shared/` : ce que les deux interfaces démarrent en commun (providers, contexte de
  démarrage).
- `apps/web/src/app/` : l'interface actuelle. `legacy.*` pour ce qui lui est propre, `ui-switch/`
  pour l'avis qu'elle affiche sur la nouvelle.
- `apps/web/src/next/` : la nouvelle interface. `core/` pour les services et gardes (dialogues, thème,
  pont), `pages/` pour les écrans.
- `libs/design-system/` (`@platon/design-system`, préfixe `pl-`) : tokens, composants, Storybook
  (`yarn storybook`). En anglais (D20), sans code PLaTon.
- `tools/lint/` : les garde-fous de `yarn lint:design` (tokens, CSS morte, tirets) et leurs tests.

Nommage du nouveau code (D17) : `home.ts`, `home.html`, `home.scss` pour un composant `Home`,
`legacy-bridge-guard.ts` pour une garde, `next.routes.ts` pour la configuration, `*.vm.ts` pour les
fonctions de vue pures.

## Étapes d'un ticket d'écran

1. **Wireframe validé** : l'écran et ses états existent dans `design/flows/`, avec ses annotations.
2. **Composants** : ce qui manque dans `libs/design-system`, avec une story par état.
3. **Store et vue** : le store de la route et ses fonctions de vue pures, testés.
4. **Page** : branchée sur le store, sans logique métier dans le template.
5. **Parité** : la liste des fonctions de l'écran actuel est cochée, ou chaque écart est une
   décision.
6. **Vert** : `yarn build`, `yarn lint`, `yarn test`, captures comparées au wireframe, ticket
   déplacé dans `done/`.

## Choisir le prochain ticket

Le premier ticket `À faire` de la roadmap dont toutes les dépendances sont livrées.
