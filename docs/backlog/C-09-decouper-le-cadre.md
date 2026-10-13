# C-09 : Découper le cadre

Source : relecture du code de la nouvelle interface du 2026-10-13 ; règle `front/new-interface.md`
(un dossier par partie, `ui/` pour les composants de présentation) ; décisions : aucune.
Statut : À faire.
Dépend de : C-02, C-03, C-04, et la fusion de la pile #118 à #125, qui touche `shell.ts`.
Taille : M.

## 1. Comportement attendu

- Étant donné le cadre, avant et après le découpage, alors rien ne change pour la personne : la
  couverture sur ordinateur ; la barre haute, le panneau et la feuille du profil sur téléphone ; le
  menu Créer et la charte ; le menu du profil (Mon compte, Mon cercle, Aide, Revenir à l'interface
  actuelle, Thème, Se déconnecter) ; les notifications ; la fermeture de tout ce qui est ouvert quand
  on navigue ou quand l'écran passe la largeur de bascule ; le retour du focus après chaque panneau.
- Étant donné le code du cadre, alors chaque partie a son dossier et une seule responsabilité, comme
  `shell/notifications/` : le composant `Shell` ne garde que la mise en page (couverture ou barre
  haute) et la page courante.

## 2. Tests à écrire d'abord

- Aucun comportement nouveau. `shell.spec.ts` reste la preuve : il passe sans changement avant et
  après, hors des sélecteurs qui suivent un composant déplacé.
- Chaque partie sortie emporte les cas de `shell.spec.ts` qui la concernent dans sa spec (profil,
  Créer, panneaux), sans en perdre un.

## 3. État actuel du code

Vérifié le 2026-10-13.

- `apps/web/src/next/shell/shell.ts` (345 lignes) et `shell.html` (226 lignes), 11 `inject`, 11
  `computed`, 2 effets. Le composant porte six responsabilités :
  - la mise en page : la couverture, ou la barre haute avec son titre de page ;
  - les panneaux (navigation, feuille du profil, notifications) : ouverture, fermeture, position,
    retour du focus, et tout fermer à chaque navigation ou au passage de la largeur de bascule ;
  - le menu Créer : ses entrées, la charte avant le premier usage (`acceptCharter`,
    `openCreateOnRender`), le mode discret (`quietCreate`) ;
  - le profil : deux gabarits pour les mêmes choix (le menu sur ordinateur, la feuille sur
    téléphone) et `chooseFromProfile`, qui aiguille compte, cercle, aide, retour à l'interface
    actuelle, thème et déconnexion ;
  - le chargement du store du cadre et la connexion des notifications ;
  - les libellés (nom, type de compte, cloche, aide en pied de couverture).
- `shell/notifications/` montre déjà la forme visée : une partie avec son composant d'entrée, son
  `data/` et ses fonctions de vue.

## 4. Changements

- `shell/profile/` : le menu et la feuille du profil, leurs entrées dans `profile.vm.ts` (une seule
  liste pour les deux gabarits), et les actions (compte, cercle, aide, retour, thème, déconnexion).
- `shell/create/` : le bouton et le menu Créer, la charte avant le premier usage, le mode discret.
- `shell/shell-panels.ts` : l'ouverture et la fermeture des panneaux, leur fermeture à la navigation
  et au passage de la largeur de bascule, le retour du focus ; ce que les parties du cadre partagent,
  comme `home-page.ts` pour les accueils.
- `Shell` garde la couverture ou la barre haute, le titre de page, et assemble les parties.

## 5. Hors scope

Tout changement visible ; le contenu de `ShellStore` ; le panneau des notifications, déjà découpé.

## 6. Points ouverts

1. Le moment. Proposé : après la fusion de la pile #118 à #125 sur `main`, pour ne pas créer de
   conflits dans des PR ouvertes.

## 7. Definition of Done

- [ ] `shell.spec.ts` vert sans changement de comportement, ses cas répartis dans les parties.
- [ ] `yarn build`, `yarn lint`, `yarn test`, `yarn lint:design` verts.
- [ ] Le cadre vérifié dans Chrome sur l'app lancée : ordinateur et téléphone, chaque panneau, le
      menu Créer avec et sans charte acceptée, le focus après chaque fermeture.
- [ ] Le ticket dans `done/`, la roadmap à jour.
