# S-04 : Le pont vers l'ancienne interface

Source : stratégie de code du 2026-09-28 ; décisions : D3, D12.
Statut : Livré (2026-09-28).
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

- [x] Aucune adresse ne mène à une page vide dans la nouvelle interface.
- [x] La préférence survit au passage par le pont.

> **Amendement à la livraison.** La nouvelle interface n'a qu'une route portée, son accueil (`''`).
> `**` passe par `legacyBridgeGuard` (`next/core/legacy-bridge/`, 4 tests) : au premier chargement il
> remplace l'entrée d'historique (« Précédent » ne rebondit pas d'une interface à l'autre), lors d'une
> navigation interne il en ajoute une. `legacy-once` n'est jamais gardé comme préférence (testé dans
> `ui-switch/ui-mode.spec.ts`). Le contexte de démarrage (drapeau, préférence, passage par le pont) arrive aux deux
> interfaces par le jeton `UI_BOOT_CONTEXT`.

> **Amendement à la livraison.** L'avis est un composant de l'ancienne interface
> (`app/ui-switch/`, 15 tests), monté par `legacy.bootstrap` à côté de la racine. Point ouvert
> tranché : aucun avis sur les outils plein écran (lecteur, éditeur, builder, playground, démo).
> Sans session, l'ancienne interface renvoie vers sa connexion en gardant l'adresse dans `next=`.

> **Défaut trouvé en chemin.** `ViewEncapsulation.ShadowDom` recopie les styles de tous les
> composants de l'application dans chaque racine d'ombre : l'avis embarquait tout le CSS de
> l'ancienne interface. Encapsulation par défaut à la place, avec des classes scopées qui priment sur
> les règles globales de ng-zorro. Décision D16.

> **Limite connue.** Une fois dans l'ancienne interface par le pont, naviguer y reste (application
> monopage) ; l'avis propose le retour. Ramener automatiquement vers un écran porté : S-06.

> **Vérification.** Dans Chrome : adresse non portée ouverte dans l'ancienne interface avec l'avis,
> préférence gardée, paramètre retiré, une seule entrée d'historique ajoutée ; « Revenir à la
> nouvelle interface » ouvre son accueil ; « Masquer » ; rien sur le lecteur ; drapeau `default`
> sans préférence enregistrée.
