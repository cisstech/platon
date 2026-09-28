# F-01 : La bibliothèque `@platon/design-system` et Storybook

Source : `design/docs/05-plan.md`, `design/docs/03-cartographie.md` ; décisions : D9.
Statut : À faire.
Dépend de : aucun.
Taille : M.

## 1. Comportement attendu

- Étant donné le dépôt, quand on lance `yarn storybook`, alors Storybook s'ouvre sur la
  bibliothèque, avec une page d'introduction, le sélecteur de thème clair et sombre, et le contrôle
  d'accessibilité sur chaque story.
- Étant donné une story, alors elle est écrite en CSF3, pilotée par `args`, avec des textes réels
  en français.

## 2. Tests à écrire d'abord

- Un composant témoin `pl-icon` avec ses stories (taille, couleur héritée) et un test de rendu.
- `build-storybook` en CI.

## 3. État actuel du code

Vérifié le 2026-09-28.

- `storybook` 10.5.10 et `@nx/storybook` 23.2.0 sont dans `package.json`, sans configuration :
  aucun dossier `.storybook` dans le dépôt.
- `libs/shared/ui` (`@platon/shared/ui`) contient les composants `ui-*` actuels, adossés à
  ng-zorro ; il reste à l'ancienne interface.

## 4. Changements

- Générer `libs/design-system` (Angular, standalone, OnPush), alias `@platon/design-system`,
  préfixe `pl`.
- `libs/design-system/.storybook/{main.ts,preview.ts,preview-head.html}` ; cibles `storybook`
  (port 6006) et `build-storybook` ; `@storybook/addon-docs`, `@storybook/addon-a11y`.
- Décorateur de thème qui pose `data-theme` sur la racine de la story.
- Scripts `yarn storybook`, `yarn build:storybook`.

## 5. Hors scope

Les tokens (F-02), les composants eux-mêmes (phase C).

## 6. Points ouverts

- Compatibilité de Storybook 10.5 avec Angular 22 à vérifier à l'installation.

## 7. Definition of Done

- [ ] Storybook démarre et se construit.
- [ ] `pl-icon` a ses stories et passe le contrôle d'accessibilité.
