# S-02 : Séparer les styles par interface

Source : stratégie de code du 2026-09-28 ; décisions : D11.
Statut : Livré (2026-09-28).
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

- [x] Ancienne interface identique sur les captures.
- [x] Nouvelle interface sans aucune règle héritée.
- [x] Pas de flash sans style au démarrage, dans les deux modes.

> **Amendement à la livraison.** Les feuilles sont chargées par `main.ts`, en parallèle du code de
> l'interface, et Angular démarre quand les deux sont arrivés (`ui-styles.ts`, 9 tests). La feuille
> de la nouvelle interface vit dans `apps/web/src/next/styles.scss` en attendant la bibliothèque
> (F-02 la fera pointer vers `libs/design-system`). Si une feuille échoue ou dépasse 10 s, l'app
> démarre quand même et l'erreur est journalisée.

> **Défaut trouvé en chemin.** Un bundle `inject: false` n'a pas d'empreinte dans son nom, alors que
> la feuille globale injectée en avait une, et nginx n'envoie pas de `Cache-Control` : après un
> déploiement, un navigateur pouvait garder l'ancienne feuille. Corrigé ici : l'adresse porte la
> version du build (`styles.legacy.css?v=<empreinte de main>`). Les feuilles de thème ng-zorro et
> Material ont le même défaut depuis toujours : noté dans `design/docs/08-bugs.md` (B17).

> **Vérification.** En production, `styles.legacy.css` est identique octet pour octet à l'ancienne
> feuille globale, et les quatre feuilles de thème sont inchangées ; `index.html` n'injecte plus
> aucune feuille. Dans Chrome : la feuille de l'interface est appliquée avant le premier rendu, la
> nouvelle interface ne charge que `styles.next.css` sans aucune règle `.ant-`, `.mat-`,
> `--brand-*` ou shepherd, et l'ancienne ne charge pas `styles.next.css`. Captures de l'ancienne
> interface (accueil, cours, ressources, en clair et en sombre) identiques, sauf une capture de
> référence prise en plein chargement. Bundle initial : 41 Ko (13,5 Ko transférés).
