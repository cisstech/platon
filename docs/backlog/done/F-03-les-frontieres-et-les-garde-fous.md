# F-03 : Les frontières et les garde-fous

Source : stratégie de code du 2026-09-28 ; décisions : D8, D9.
Statut : Livré (2026-09-29).
Dépend de : F-01.
Taille : S.

## 1. Comportement attendu

- Étant donné un fichier de `apps/web/src/next/` ou de `libs/design-system`, quand il importe
  `ng-zorro-antd`, `@angular/material`, `@platon/shared/ui` ou un fichier de
  `apps/web/src/app/`, alors `yarn lint` échoue.
- Étant donné un composant de la bibliothèque, quand son sélecteur n'a pas le préfixe `pl-`, alors
  `yarn lint` échoue.
- Étant donné un style de la bibliothèque ou de `next/`, quand il contient une couleur brute, une
  taille de police ou un rayon en dur, alors le lint des tokens échoue.

## 2. Tests à écrire d'abord

- Un fichier fautif par règle dans les tests du lint, qui doit échouer.

## 3. État actuel du code

Vérifié le 2026-09-28. `eslint.config.mjs` à la racine ; aucune règle de frontière.

## 4. Changements

- `no-restricted-imports` sur `apps/web/src/next/**` et `libs/design-system/**`.
- Règle de préfixe des sélecteurs pour `libs/design-system`.
- Script `lint:tokens` (couleurs, tailles, rayons en dur ; variables inconnues).
- `.claude/rules/front/next.md` : les règles d'architecture de D8, pour qui écrit le code.

## 5. Hors scope

aucun

## 6. Points ouverts

aucun

## 7. Definition of Done

- [x] Chaque règle échoue sur son fichier fautif et passe sur le code réel.
- [x] Les règles sont dans la CI.

> **Amendement à la livraison.** Les garde-fous suivent ceux de Sabyoo, en scripts Node testables dans
> `tools/lint` : `lint:tokens` (variable déclarée nulle part, nom inventé ou venu d'ailleurs avec le token
> à utiliser, valeur en dur), `lint:dead-css`, `lint:em-dashes`, et `lint:icons` pour le sprite ;
> `yarn lint:design` les enchaîne, en CI. Chaque règle a son cas fautif dans `node --test tools/lint`
> (projet `tools-lint`), frontières ESLint comprises. La bibliothèque n'importe aucun code PLaTon.
> Depuis Angular 22, OnPush est le défaut : la règle refuse d'en sortir. Les specs de `next/` peuvent
> importer un jeton ng-zorro pour prouver qu'il n'est pas fourni. Les règles pour qui écrit le code
> sont dans `.claude/rules/front/next.md`.
