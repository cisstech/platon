# S-07 : Écran de chargement

Source : retour du porteur du produit (2026-09-29, « le temps de chargement est vraiment visible ») ;
décisions : D14.
Statut : Livré (2026-09-29).
Dépend de : S-02.
Taille : S.

## 1. Comportement attendu

- Étant donné un démarrage de plus de 400 ms, quand la page se charge, alors le logo et « Chargement
  de PLaTon » s'affichent jusqu'au premier rendu de l'interface, au lieu d'une page blanche.
- Étant donné un démarrage plus rapide, alors rien ne clignote.
- Étant donné un échec du démarrage, alors l'écran dit « PLaTon n'a pas pu démarrer. » et propose
  « Recharger ».

## 2. Tests à écrire d'abord

- `ui-switch/boot-screen.spec.ts` : le message d'échec, avec ou sans écran présent, une seule fois.
- Chrome : l'écran est visible pendant un chargement lent et disparaît au rendu.

## 3. État actuel du code

Vérifié le 2026-09-29. `index.html` ne contient qu'un `<app-root>` vide : rien ne s'affiche avant
le premier rendu d'Angular. C'était déjà le cas avant S-01.

## 4. Changements

- `apps/web/src/index.html` : l'écran dans `<app-root>` (Angular le remplace au premier rendu), avec
  ses styles en ligne ; apparition après 400 ms, `prefers-reduced-motion` respecté.
- `ui-switch/boot-screen.ts` : le message d'échec, appelé par `main.ts`.

## 5. Hors scope

Réduire le poids de l'ancienne interface (1,8 Mo compressés) : c'est ce téléchargement qui fait
l'essentiel de l'attente. La nouvelle interface pèse aujourd'hui 126 Ko compressés.

## 6. Points ouverts

aucun

## 7. Definition of Done

- [x] L'écran s'affiche pendant un chargement lent et disparaît au rendu.
- [x] Un échec de démarrage affiche un message et « Recharger ».

> **Mesure.** Build de production, Chrome en « Fast 4G », compression comme nginx, page de connexion,
> médiane de trois chargements.
>
> |                                      | Premier affichage | App rendue |
> | ------------------------------------ | ----------------- | ---------- |
> | Avant S-01                           | rien avant l'app  | 3,46 s     |
> | Après S-05, sans écran               | rien avant l'app  | 3,70 s     |
> | Avec l'écran, sans préférence        | 0,78 s            | 3,72 s     |
> | Avec l'écran, préférence enregistrée | 0,61 s            | 3,55 s     |
>
> Le basculement ajoute environ 0,09 s (le code de l'interface est demandé après `main.js`) et
> environ 0,17 s pour `ui.json` quand il n'y a pas de préférence.

> **Amendement à la livraison.** Le drapeau quitte `assets/ui.json` pour la balise meta
> `platon-ui-next` de `index.html` (D18) : lecture synchrone, sans requête ni cas d'échec. Le contexte
> transmis aux interfaces porte désormais toujours la vraie valeur du drapeau.
