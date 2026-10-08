# C-03 : Le cadre mobile : barre haute et panneau

Source : `design/flows/accueil-etudiant` (écrans `etudiant` mobile, `navigation`, `profil` mobile et
annotations), révisés après les quatre tours de critique ; `design/spec/project.md` (règles
communes) ; `design/design.css` (`.topbar`, `.drawer`, `.scrim`) ; `design/docs/04-direction.md`
(navigation, gabarit, accessibilité) ; décisions : D19, D26, D27, D28.
Statut : À faire.
Dépend de : C-02.
Taille : M.

## 1. Comportement attendu

- Étant donné le téléphone, alors il porte tout le parcours de l'étudiant et du candidat ; les écrans
  des enseignants, des correcteurs et de l'administration sont dessinés pour le bureau. Le cadre
  mobile reste utilisable par tous les rôles, mais seuls les écrans de l'étudiant et du candidat y
  ont une forme propre.
- Étant donné un écran de moins de 840 px (D28), alors la couverture laisse place à une barre de 56 px, dans la
  couleur de la couverture, collée en haut : à gauche « Ouvrir la navigation », au milieu le titre de
  la page, à droite la cloche des notifications, dont le nom dit le nombre de non lues
  (« Notifications, 3 non lues ») et qui ouvre les notifications en plein écran (C-04).
- Étant donné le bouton de navigation, quand on l'actionne, alors la couverture glisse depuis la
  gauche en 260 ms (panneau de 300 px) au-dessus d'un voile, avec en haut le logo, le nom de
  l'établissement et « Fermer la navigation ». C'est un dialogue nommé « Navigation » : le focus y
  entre et y reste.
- Étant donné le panneau ouvert, quand on touche le voile, qu'on appuie sur `Échap`, qu'on choisit
  une entrée ou qu'on actionne Fermer, alors il se ferme et le focus revient au bouton de navigation.
- Étant donné le panneau, alors il reprend la navigation par rôle de C-02, le profil et la mention du
  logiciel libre ; les entrées font 44 px de haut. Pour l'enseignant et l'administrateur, Créer est
  en tête du panneau, sous la marque, et ouvre le même menu que sur bureau (D28).
- Étant donné le profil du panneau, quand on l'actionne, alors une feuille monte du bas : le nom, le
  type de compte (« Compte étudiant »), l'adresse, puis Mon compte, Aide (ou Mon cercle et pas d'Aide
  pour qui a Documentation, D26), le thème en choix segmenté de trois fois 44 px (la feuille est un
  dialogue, D27) et Se déconnecter. Le voile, `Échap` et un glissement vers le bas la ferment.
- Étant donné le titre de la barre, alors il reprend le titre de la route (`title`), comme l'onglet
  du navigateur.
- Étant donné un écran de moins de 840 px, alors la page a des marges de 16 px au lieu de 32 (D28,
  `pl-page` de C-05).
- Étant donné `prefers-reduced-motion`, alors le panneau apparaît sans glisser.

## 2. Tests à écrire d'abord

- Ouverture et fermeture par le bouton, le voile, `Échap`, une entrée et Fermer, avec le retour du
  focus au bouton de navigation.
- Titre de la barre selon la route.
- Stories de la barre et du panneau, en clair et en sombre, sans violation d'accessibilité.
- Parcours dans Chrome à 380 px : ouverture, navigation, fermeture.

## 3. État actuel du code

Vérifié le 2026-09-29.

- Ancienne interface (`widgets/toolbar/toolbar.component.ts:123-170`, points de rupture du CDK) : un
  bouton ouvre ou ferme le tiroir Material ; en dessous de « Large » (1280 px), le tiroir pousse la
  page et se ferme après navigation ; « Medium » n'est pris par aucune des deux règles. Les boutons à
  icône de la barre n'ont pas de nom accessible.
- Wireframes : quatre écrans mobiles (accueil élève, navigation, connexion, lecteur), aucun écran
  tablette ; le mobile enseignant n'est pas dessiné (`design/docs/07-revue-ux.md`, reste ouvert 3).
- Le dialogue du CDK (piège du focus, `Échap`, retour du focus) est déjà utilisé par `NextDialog`.

## 4. Changements

- Bibliothèque : la barre haute et le panneau de couverture, sur l'overlay et le dialogue du CDK ;
  les tokens `--pl-topbar-height` et `--pl-duration-panel` existent déjà.
- Nouvelle interface : le cadre de C-02 bascule entre couverture fixe et barre plus panneau selon la
  largeur ; le titre vient de la route.

## 5. Hors scope

Les notifications en plein écran (C-04) ; les écrans mobiles des parcours.

## 6. Points ouverts

Aucun : tranchés le 2026-10-08 par D28. Pour mémoire, les questions étaient :

- Seuil de bascule : aucun wireframe tablette. Proposition : barre et panneau en dessous de 840 px,
  la largeur du cadre tablette des wireframes ; l'ancienne interface bascule en dessous de 1280 px.
- Enseignant sur téléphone : ses écrans sont dessinés pour le bureau et Créer n'est pas dans le
  panneau. Proposition : le bouton Créer en tête du panneau, sous la marque, comme sur bureau, sans
  autre adaptation.

## 7. Definition of Done

- [ ] Les tests du §2 passent.
- [ ] Le cadre est utilisable au clavier et au toucher à 380 px, sans défilement horizontal.
- [x] Les points ouverts sont tranchés.
