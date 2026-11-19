# F-04 : Les ports transverses : dialogues, notifications, thème

Source : `design/docs/04-direction.md` (retours d'action) ; décisions : D6, D7.
Statut : Livré (2026-09-29).
Dépend de : F-02, S-03.
Taille : M.

## 1. Comportement attendu

- Étant donné la nouvelle interface, quand un service partagé appelle `DialogService.success`,
  `error`, `info`, `warning`, `confirm`, `notification`, `loading` ou `prompt`, alors le retour
  prend la forme de la nouvelle interface (toast de 4 s en bas à gauche, dialogue de confirmation
  qui nomme l'objet), avec le même comportement qu'aujourd'hui.
- Étant donné l'ancienne interface, alors les retours restent ceux de ng-zorro.
- Étant donné le thème, alors la nouvelle interface le lit et l'écrit sous la même clé
  (`app.theme`) : clair, sombre ou système, le choix suit la personne d'une interface à l'autre.

## 2. Tests à écrire d'abord

- Tests du service de la nouvelle interface pour chaque méthode, dont `confirm` résolu par OK, par
  Annuler et par Échap.
- Stories du toast et du dialogue, dans chaque état.

## 3. État actuel du code

Vérifié le 2026-09-28.

- `DialogService` (`libs/core/browser/src/lib/dialog/dialog.service.ts`) injecte
  `NzModalService`, `NzMessageService`, `NzNotificationService` ; environ 80 usages dans le code.
- `confirm` prend un `ModalOptions` de ng-zorro. Les appels n'utilisent que `nzTitle`,
  `nzContent`, `nzOkText`, `nzCancelText`, `nzOkDanger`, `nzOkType`.
- `ThemeService` écrit `app.theme` via `StorageService` et charge les feuilles Material et
  ng-zorro.

## 4. Changements

- Un type neutre `ConfirmOptions` (`title`, `content`, `okText`, `cancelText`, `danger`) et un
  adaptateur qui accepte encore les clés `nz*` le temps de la bascule.
- `apps/web/src/next/core/dialog/` : l'implémentation de la nouvelle interface, fournie par
  `{ provide: DialogService, useClass: … }` dans `next.config.ts`.
- `pl-toast`, `pl-dialog` dans la bibliothèque.
- Un thème de la nouvelle interface qui pose `data-theme` et partage la clé `app.theme`.

## 5. Hors scope

Réécrire les appels existants : inutile, c'est le but du port.

## 6. Points ouverts

- `prompt` ouvre un composant de saisie ng-zorro (`dialog/prompt`) : même contrat, nouveau
  composant.

## 7. Definition of Done

- [x] Les huit méthodes ont leur implémentation et leurs tests.
- [x] Aucun appel existant n'est modifié.
- [x] Le thème suit la personne entre les deux interfaces.

> **Amendement à la livraison.** `DialogService` devient une classe abstraite sans import ng-zorro ;
> l'implémentation ng-zorro, `NzDialogService`, est liée par `DialogModule` et `legacyProviders`.
> Celle de la nouvelle interface, `NextDialog`, s'appuie sur le `Dialog` du CDK (piège du focus,
> Échap, retour du focus) et sur `Toaster` : toasts de 4 s en bas à gauche, annoncés aux lecteurs
> d'écran, en pause sous le pointeur ou le focus. Le contenu d'une confirmation reste interprété en
> HTML, assaini par Angular, comme avec ng-zorro. `pl-toast`, `pl-toast-stack` et `pl-dialog` sont dans
> la bibliothèque ; un bouton destructif a ses rôles `--pl-color-danger-strong` et
> `--pl-color-on-danger`, lisibles en sombre.

> **Amendement à la livraison.** Le thème de la nouvelle interface (`NextTheme`) n'est pas un port :
> `ThemeService` reste à l'ancienne, avec ses feuilles Material et ng-zorro. Il partage la clé
> `app.theme` et ses valeurs ; sans choix enregistré, il est clair, comme l'ancienne interface. Le
> composant racine le restaure sans bloquer le démarrage. Le choix dans l'interface arrive avec le
> menu du profil (C-02).

> **Défaut trouvé en chemin.** Importer `@platon/core/browser` par son entrée principale faisait
> charger toute la bibliothèque au démarrage de la nouvelle interface (Apollo, Monaco, ECharts,
> Material, ng-zorro) : 5,2 Mo, que webpack ne peut pas élaguer. Une entrée légère,
> `@platon/core/browser/shared`, expose ce que les deux interfaces partagent sans vendeur d'interface
> (le port `DialogService`, `StorageService`) ; ESLint refuse l'entrée principale dans `next/`. Le
> démarrage de la nouvelle interface retombe à 576 Ko (178 Ko compressés). Les bibliothèques
> `@platon/feature/*/browser` ont le même défaut : les premiers écrans qui utilisent leurs services
> d'API (phases A et K) devront leur ouvrir une entrée du même genre.
