# S-01 : Choisir l'interface au démarrage

Source : stratégie de code du 2026-09-28 ; décisions : D2, D4, D5, D10, D14.
Statut : Livré (2026-09-28).
Dépend de : aucun.
Taille : M.

## 1. Comportement attendu

- Étant donné une personne sans préférence, quand elle ouvre PLaTon, alors l'ancienne interface
  démarre, exactement comme aujourd'hui.
- Étant donné l'adresse `?ui=next`, quand la page se charge, alors la nouvelle interface démarre et
  le choix est gardé dans `localStorage` (`platon.ui`) ; `?ui=legacy` fait l'inverse.
- Étant donné `platon.ui = next` dans le stockage, quand elle revient, alors la nouvelle interface
  démarre, sans passer par l'ancienne.
- Étant donné le drapeau `ui.next = default`, quand une personne sans préférence arrive, alors la
  nouvelle interface démarre.
- Étant donné l'ancienne interface, alors aucun fichier de la nouvelle n'est téléchargé, et
  inversement.

## 2. Tests à écrire d'abord

- `apps/web/src/ui-mode.spec.ts` : `readUiMode` pour chaque combinaison (paramètre, stockage,
  drapeau), un stockage inaccessible (navigation privée), une valeur inconnue.
- Bout en bout : `?ui=next` affiche la coquille de la nouvelle interface ; `?ui=legacy` affiche
  l'actuelle.

## 3. État actuel du code

Vérifié le 2026-09-28.

- `apps/web/src/main.ts` démarre `AppPage` avec `appConfig`, `provideZoneChangeDetection()`.
- `apps/web/src/app/app.config.ts` réunit routeur, HTTP, `CoreBrowserModule`, les providers des
  features et un initialiseur `CoreService.init()` (thème, icônes ng-zorro et Material).
- L'app n'a pas de dossier `environments` ni de configuration lue à l'exécution.

## 4. Changements

- `apps/web/src/ui-mode.ts` : `readUiMode(url, storage, flag): 'legacy' | 'next'`, pure, et
  `persistUiMode(mode)`.
- `apps/web/src/assets/ui.json` : `{ "next": "off" }` ; `main.ts` le lit avant le démarrage et
  retient `off` si le fichier manque ou ne se lit pas.
- `apps/web/src/main.ts` : lit le mode, puis `import('./app/legacy.bootstrap')` ou
  `import('./next/next.bootstrap')`. L'import dynamique garde chaque interface dans ses propres
  fichiers.
- `apps/web/src/app/legacy.bootstrap.ts` : le démarrage actuel, déplacé tel quel.
- `apps/web/src/next/next.bootstrap.ts`, `next.config.ts`, `next.routes.ts`, `next-root.ts` : une
  coquille vide qui affiche « Nouvelle interface » et une route `**` (remplacée par le pont en S-04).
- Configuration : partager dans `apps/web/src/shared.config.ts` ce qui sert aux deux (HTTP,
  intercepteurs, authentification, `LOCALE_ID`, providers des features).

## 5. Hors scope

Les styles (S-02), les providers de l'ancienne interface (S-03), le pont (S-04), l'interface de
choix (S-05).

## 6. Points ouverts

aucun (le drapeau est tranché par D14)

## 7. Definition of Done

- [x] `readUiMode` testé pour toutes les combinaisons, dont `ui.json` absent ou invalide.
- [x] L'ancienne interface démarre sans différence visible ni fonctionnelle.
- [x] `?ui=next` démarre la coquille ; le choix est gardé.
- [x] Les fichiers de l'une ne se chargent pas dans l'autre (onglet réseau vérifié).
- [x] `yarn build`, `yarn lint`, `yarn test` verts.

> **Amendement à la livraison.** La fonction pure s'appelle `resolveUiMode({ param, stored,
flag })`, entourée de petites fonctions testées une à une (`parseUiMode`, `parseUiFlag`,
> `readStoredUiMode`, `writeStoredUiMode`, `withoutUiParam`, `loadUiFlag`) : 18 tests. Le
> paramètre `?ui=` est retiré de l'adresse une fois lu, pour qu'un lien copié ne le transporte pas.
> `ui.json` n'est pas demandé quand une préférence existe, et la demande abandonne au bout de 2 s.
> Les fichiers de la coquille suivent la règle de nommage du dépôt (`next-root.component.ts`,
> `shell/placeholder.page.ts`). La coquille propose déjà « Ouvrir cette page dans l'interface
> actuelle », construit sur l'adresse complète : un `?ui=legacy` relatif repartirait de
> `<base href="/">`.

> **Amendement à la livraison.** `shared.config.ts` ne contient que la détection de changements et
> HTTP. Les providers des features restent dans la configuration de l'ancienne interface : leurs
> barrels exportent aussi les composants de cette interface (point reporté dans S-03).

> **Défaut trouvé en chemin.** Le dépôt n'a pas de projet de tests bout en bout pour le web. Les
> scénarios (sans préférence, `?ui=next`, préférence gardée, retour, drapeau `default`, fichier
> absent, requête bloquée) ont été vérifiés dans Chrome par script, sans être ajoutés au dépôt.
> Vérifié aussi : connexion et parcours de l'ancienne interface sans erreur ; gardes `nx lint web`,
> `nx test web` (74 tests) et `nx build web --configuration=production` verts.

> **Mesure.** Bundle initial : 91 Ko (21 Ko transférés). L'ancienne interface est un chunk de
> 8,8 Mo chargé à la demande, la nouvelle un chunk de 455 Ko. L'ancienne interface charge le même
> volume qu'avant, avec une requête de plus en série (le chunk, et `ui.json` sans préférence).
