# S-02 : Séparer les styles par interface

Source : stratégie de code du 2026-09-28 ; décisions : D11.
Statut : À faire.
Dépend de : S-01.
Taille : M.

## 1. Comportement attendu

- Étant donné l'ancienne interface, alors elle a exactement les mêmes styles qu'aujourd'hui, thème
  clair et sombre compris.
- Étant donné la nouvelle interface, alors aucune règle de `shared/styles/app.scss`, de
  `apps/web/src/styles.scss`, de Material ou de ng-zorro ne s'applique à la page.

## 2. Tests à écrire d'abord

- Bout en bout : dans la nouvelle interface, aucune feuille `styles.legacy`, `styles.material.*`
  ou `styles.ng-zorro.*` n'est chargée.
- Captures de l'ancienne interface avant et après sur trois écrans (accueil, cours, ressource).

## 3. État actuel du code

Vérifié le 2026-09-28.
- `apps/web/project.json`, `styles` : `shared/styles/app.scss` et `apps/web/src/styles.scss` sont
  injectés partout ; les thèmes Material et ng-zorro sont déjà des bundles `inject: false`.
- `app.scss` importe normalize, les polices, les variables `--brand-*`, la base Material et
  `theme-overrides`.
- `ThemeService` (`libs/core/browser/src/lib/services/theme.service.ts`) ajoute les liens
  `styles.<vendor>.<theme>.css` à la demande.

## 4. Changements

- `project.json` : `app.scss` et `styles.scss` passent dans un bundle `styles.legacy`,
  `inject: false`. Nouveau bundle `styles.next` (`libs/design-system/src/styles/next.css`),
  `inject: false`.
- `legacy.bootstrap.ts` ajoute le lien `styles.legacy.css` avant de démarrer ; `next.bootstrap.ts`
  ajoute `styles.next.css`.
- Éviter l'écran sans style : le lien est posé et chargé avant `bootstrapApplication`.

## 5. Hors scope

Le contenu des tokens de la nouvelle interface (F-02).

## 6. Points ouverts

aucun

## 7. Definition of Done

- [ ] Ancienne interface identique sur les captures.
- [ ] Nouvelle interface sans aucune règle héritée.
- [ ] Pas de flash sans style au démarrage, dans les deux modes.
