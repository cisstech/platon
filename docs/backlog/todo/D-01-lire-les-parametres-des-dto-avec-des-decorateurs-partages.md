# D-01 : Lire les paramètres des DTO avec des décorateurs partagés

Source : la relecture de C-08 (2026-10-12) et la règle de réutilisation de `CLAUDE.md` ; inventaire
du code du 2026-10-12 ; décisions : aucune.
Statut : À faire.
Dépend de : C-08 (`@ToBoolean()` et `@ToInt()`).
Taille : M.

## 1. Comportement attendu

- Étant donné un DTO de l'API qui lit un booléen, un nombre, une liste ou une date venus de
  l'adresse ou du corps, alors il le fait par un décorateur partagé de `libs/core/server`
  (`@ToBoolean()`, `@ToNumber()`, `@ToArray()`, `@ToDate()`), jamais par un `@Transform` écrit sur
  place.
- Étant donné un booléen à `null` dans un corps de requête, alors il reste absent, au lieu d'être lu
  comme vrai.
- Étant donné un nombre qui n'en est pas un (`limit=abc`), alors l'API répond 400, au lieu d'ignorer
  le filtre et de rendre toute la liste. Un nombre décimal reste décimal : `@IsInt()` le refuse là
  où un entier est attendu, au lieu qu'il soit tronqué en silence.
- Étant donné une liste ou une date, alors elles se lisent comme aujourd'hui (`toArray`, `toDate`).
- Étant donné les écrans des deux interfaces, alors aucun ne change : ils envoient déjà des valeurs
  valides.

## 2. Tests à écrire d'abord

- Unitaires des décorateurs (`decorator.spec.ts`), à compléter pour `@ToArray()` et `@ToDate()` :
  valeurs données, valeurs absentes, `null`, chaîne vide.
- Pour chaque DTO dont le comportement change, une spec par `ValidationPipe` : un booléen à `null`
  reste absent, un nombre invalide est refusé, un nombre décimal est refusé là où l'entier est
  attendu.
- Les specs e2e existantes (annonces, lecteur) restent vertes en CI.

## 3. État actuel du code

Vérifié le 2026-10-12, sur `feat/realtime-sse`.

- `@Transform(({ value }) => toNumber(value))` est écrit 25 fois, `toArray` 22 fois, `toBoolean`
  19 fois et `toDate` 6 fois, dans 15 fichiers : `libs/core/server` (2), `feature/course/server` (5),
  `feature/resource/server` (5), `feature/announcement/server`, `feature/cas/server`,
  `feature/lti/server`.
- Variantes écrites à la main :
  - `libs/feature/course/server/src/lib/course.dto.ts` : `value === 'true'` (`showAll`) et un booléen
    optionnel (`archived`) ;
  - `libs/feature/course/server/src/lib/course-member/course-member.dto.ts` : un booléen optionnel ;
  - `libs/feature/announcement/server/src/lib/announcement.dto.ts` : un booléen à la main (`active`)
    et `@Type(() => Number)` sur `limit` et `offset`.
- `libs/core/server/src/lib/utils/cast.ts` : `toBoolean(null)` et `toBoolean('')` rendent `true` ;
  `toNumber` rend `undefined` sur une valeur invalide, que `@IsOptional()` laisse passer, et tronque
  les décimales (`parseInt`).
- `libs/core/server/src/lib/utils/decorator.ts` : `@ToBoolean()` et `@ToInt()`, ajoutés par C-08 et
  utilisés par le seul DTO des notifications.

## 4. Changements

- `libs/core/server/src/lib/utils/decorator.ts` : `@ToInt()` devient `@ToNumber()`, puisque c'est la
  validation (`@IsInt()` ou `@IsNumber()`) qui dit si l'entier est attendu ; `@ToArray()` et
  `@ToDate()` s'ajoutent, sur `toArray` et `toDate`.
- Chaque DTO des 15 fichiers et des variantes passe aux décorateurs, en gardant ses validations ;
  `@IsInt()` remplace `@IsNumber()` là où l'entier est attendu (pages, positions, durées en
  secondes).
- `cast.ts` garde les fonctions qu'un code appelle directement ; celles qui ne servaient qu'aux
  `@Transform` partent si plus rien ne les appelle.
- La règle `back/nestjs.md` nomme les décorateurs à la place de la phrase sur `toBoolean`.

## 5. Hors scope

Les paramètres de route (`@UUIDParam` existe déjà). Les DTO de sortie, qui ne lisent rien. Une
validation plus stricte que la forme (bornes métier), qui reste dans les services.

## 6. Points ouverts

1. Un nombre invalide est-il refusé (400) partout, ou seulement là où l'ignorer change le résultat
   (pages, positions) ? Proposé : partout ; les deux interfaces envoient déjà des nombres valides, et
   un client tiers apprend son erreur au lieu de recevoir autre chose que ce qu'il demandait.

## 7. Definition of Done

- [ ] Plus aucun `@Transform(({ value }) => to...)` ni variante écrite à la main dans les DTO.
- [ ] Les tests du §2 passent ; les specs e2e passent en CI.
- [ ] Les deux interfaces vérifiées sur l'application qui tourne : filtres des cours, des
      ressources, des annonces et des membres.
