# S-03 : Isoler les providers de l'ancienne interface

Source : stratégie de code du 2026-09-28 ; décisions : D6, D7.
Statut : À faire.
Dépend de : S-01.
Taille : S.

## 1. Comportement attendu

- Étant donné la nouvelle interface, alors ni ng-zorro, ni Material, ni les tutoriels ne sont
  initialisés.
- Étant donné l'ancienne interface, alors rien ne change.

## 2. Tests à écrire d'abord

- Test de configuration : `nextConfig` ne contient aucun provider venant de `ng-zorro-antd` ou de
  `@angular/material` (liste des tokens).

## 3. État actuel du code

Vérifié le 2026-09-28.

- `CoreBrowserModule` (`libs/core/browser/src/lib/core.module.ts`) fournit `NgZorroProviders`, qui
  mêle `LOCALE_ID` (utile aux deux) et `NZ_I18N`, `NZ_DATE_LOCALE` (propres à ng-zorro).
- `CoreService.init()` charge le thème et règle `NzIconService` et `MatIconRegistry`.
- `TUTO_PROVIDERS` et `ANNOUNCEMENT_PROVIDERS` (fenêtre d'annonce) servent l'ancienne interface.
- Relevé en livrant S-01 : les ports des features sont propres (par exemple `CourseProvider` lié
  à `RemoteCourseProvider`), mais chaque barrel `@platon/feature/*/browser` exporte au même endroit
  ces ports, les services et les composants de l'ancienne interface. Importer `COURSE_PROVIDERS`
  depuis la nouvelle interface y ferait entrer ces composants.

## 4. Changements

- Sortir `LOCALE_ID` et l'enregistrement de la locale française dans un provider partagé.
- `apps/web/src/app/legacy.providers.ts` : `NgZorroProviders`, `CoreService.init`, tutoriels,
  fenêtre d'annonce. Seul `legacy.bootstrap` l'importe.
- `CoreBrowserModule` garde ce qui est commun (authentification, intercepteurs, GraphQL, nge).

## 5. Hors scope

Remplacer `DialogService` et le thème dans la nouvelle interface (F-04).

## 6. Points ouverts

- Partager les ports des features sans les composants. Recommandation : un point d'entrée
  secondaire par lib (`@platon/feature/course/browser/api` : modèles, ports, adaptateurs distants,
  services), que les deux interfaces importent ; le barrel actuel le réexporte pour ne rien casser.
  À trancher avant le premier écran qui lit des données (A-01).

## 7. Definition of Done

- [ ] Le test de configuration passe.
- [ ] L'ancienne interface fonctionne à l'identique (tutoriels, annonces, icônes).
