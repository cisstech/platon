# S-01 : Choisir l'interface au démarrage

Source : stratégie de code du 2026-09-28 ; décisions : D2, D4, D5, D10.
Statut : À faire.
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

- Le drapeau `ui.next` : fichier `assets/ui.json` lu par `main.ts` avant le démarrage (modifiable
  sans rebuild), ou option `define` du build ? Recommandation : le fichier, avec `off` si absent.

## 7. Definition of Done

- [ ] `readUiMode` testé pour toutes les combinaisons.
- [ ] L'ancienne interface démarre sans différence visible ni fonctionnelle.
- [ ] `?ui=next` démarre la coquille ; le choix est gardé.
- [ ] Les fichiers de l'une ne se chargent pas dans l'autre (onglet réseau vérifié).
- [ ] `yarn build`, `yarn lint`, `yarn test` verts.
