# S-04 : Le pont vers l'ancienne interface

Source : stratégie de code du 2026-09-28 ; décisions : D3, D12.
Statut : À faire.
Dépend de : S-01.
Taille : M.

## 1. Comportement attendu

- Étant donné la nouvelle interface et une adresse dont l'écran n'est pas encore porté (par
  exemple `/courses/abc/members`), quand la personne l'ouvre, alors la page se recharge dans
  l'ancienne interface, à la même adresse, avec un bandeau : « Cette page n'existe pas encore dans
  la nouvelle interface » et « Revenir à la nouvelle interface ».
- Étant donné ce passage, alors la préférence `next` est gardée : la prochaine navigation vers un
  écran porté revient dans la nouvelle interface.
- Étant donné un lien interne de la nouvelle interface vers un écran non porté, alors le même
  pont s'applique.

## 2. Tests à écrire d'abord

- `apps/web/src/next/bridge/ported-routes.spec.ts` : la table des routes portées ; une adresse
  inconnue va au pont.
- Bout en bout : `?ui=next` puis une adresse non portée arrive dans l'ancienne interface avec le
  bandeau ; « Revenir » ramène à l'accueil de la nouvelle.

## 3. État actuel du code

Vérifié le 2026-09-28.
- Les routes actuelles sont dans `apps/web/src/app/app.routes.ts` et
  `pages/dashboard/dashboard.routes.ts` (`dashboard`, `courses`, `resources`, `corrections`,
  `tests`, `admin`, `account`, `announcements`…), plus `player`, `editor`, `builder` à la racine.

## 4. Changements

- `apps/web/src/next/bridge/` : une route `**` qui recharge l'adresse avec un mode de passage
  (`?ui=legacy-once`), sans écraser la préférence.
- `readUiMode` (S-01) reconnaît `legacy-once` : ancienne interface pour ce chargement seulement.
- L'ancienne interface affiche le bandeau quand elle a été ouverte par le pont (hors composants
  existants : un composant ajouté par `legacy.bootstrap`).

## 5. Hors scope

aucun

## 6. Points ouverts

- L'éditeur (`/editor`) et le lecteur (`/player`) sont plein écran : bandeau ou non ?
  Recommandation : pas de bandeau, ce sont des outils à part.

## 7. Definition of Done

- [ ] Aucune adresse ne mène à une page vide dans la nouvelle interface.
- [ ] La préférence survit au passage par le pont.
