# F-03 : Les frontières et les garde-fous

Source : stratégie de code du 2026-09-28 ; décisions : D8, D9.
Statut : À faire.
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

- [ ] Chaque règle échoue sur son fichier fautif et passe sur le code réel.
- [ ] Les règles sont dans la CI.
