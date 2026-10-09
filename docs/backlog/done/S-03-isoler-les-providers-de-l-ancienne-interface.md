# S-03 : Isoler les providers de l'ancienne interface

Source : stratégie de code du 2026-09-28 ; décisions : D6, D7.
Statut : Livré (2026-09-28).
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

- [x] Le test de configuration passe.
- [x] L'ancienne interface fonctionne à l'identique (tutoriels, annonces, icônes).

> **Amendement à la livraison.** `ANNOUNCEMENT_PROVIDERS` est un port de données, pas la fenêtre
> d'annonce (elle vit dans la barre de l'ancienne interface) : il reste avec les autres ports. Seul
> `TUTO_PROVIDERS` est propre à l'ancienne interface (services ng-zorro fournis au niveau de l'app).
> `apps/web/src/app/legacy.providers.ts` réunit animations, `NgZorroProviders`, web components
> d'exercice, tutoriels et initialiseur du thème. `NgZorroProviders` sort de `CoreBrowserModule`, est
> exporté par la lib et ajouté explicitement à `apps/home` (inchangée). La locale française passe
> dans `shared/shared.providers.ts`.

> **Amendement à la livraison.** La nouvelle interface n'importe toujours pas `CoreBrowserModule` ni
> l'authentification : le barrel `@platon/core/browser` exporte aussi les composants d'auth, qui
> dépendent de ng-zorro. C'est la même question que le point ouvert ci-dessus, à trancher avant A-01.

> **Vérification.** `next.config.spec.ts` (5 tests : locale, pas de ng-zorro, pas de tutoriels, pas
> d'animations, pas d'initialiseur). Dans Chrome, connecté : un tutoriel se lance (visite Shepherd),
> ng-zorro parle français (`jump_to` = « Aller à »), icônes Material et ng-zorro présentes, captures de
> l'ancienne interface (accueil, cours, ressources, clair et sombre) identiques au pixel près.
