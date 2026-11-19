# F-01 : La bibliothèque `@platon/design-system` et Storybook

Source : `design/docs/05-plan.md`, `design/docs/03-cartographie.md` ; décisions : D9, D16, D17.
Statut : Livré (2026-09-29).
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
- Encapsulation par défaut pour tous les composants, jamais `ShadowDom` (D16).
- Nommage du guide de style Angular (D17) ; la règle de suffixe de classe du lint ne s'applique pas à la
  bibliothèque.
- Scripts `yarn storybook`, `yarn build:storybook`.

## 5. Hors scope

Les tokens (F-02), les composants eux-mêmes (phase C).

## 6. Points ouverts

- Compatibilité de Storybook 10.5 avec Angular 22 à vérifier à l'installation.

## 7. Definition of Done

- [x] Storybook démarre et se construit.
- [x] `pl-icon` a ses stories et passe le contrôle d'accessibilité.

> **Amendement à la livraison.** Storybook 10.5 accepte Angular 18 à 22 : le point ouvert est levé.
> Les stories et la documentation de la bibliothèque sont en anglais (D20), ce qui remplace « textes
> réels en français » ; l'interface garde son texte français. `preview-head.html` n'a pas servi. La
> taille de `pl-icon` suit l'échelle numérotée (`1`, `2`, `3`) et, sans taille, celle du texte.
> `build-storybook` tourne en CI, avec son cache Nx.
