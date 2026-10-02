# C-02 : La couverture : navigation par rôle, intercalaire, Créer, profil, mention du logiciel libre

Source : `design/flows/accueil-etudiant` (écran `etudiant`, surcouche `profil`, annotations),
`design/flows/accueil-enseignant` (écran `enseignant`, menu `creer`, annotations),
`design/spec/project.md` (navigation), `design/docs/04-direction.md` (navigation, accessibilité),
`design/docs/06-faisabilite.md` (cadre et navigation) ; décisions : D3, D9, D19.
Statut : À faire.
Dépend de : C-01, C-06.
Taille : L.

## 1. Comportement attendu

- Étant donné le cadre sur bureau, alors la couverture occupe 240 px à gauche, toujours sombre, même
  en thème clair ; la page est à droite, sans barre supérieure.
- Étant donné le haut de la couverture, alors on y trouve le logo, « PLaTon » et le nom de
  l'établissement ; le logo mène à l'accueil (`/dashboard`), comme aujourd'hui.
- Étant donné la navigation, alors elle suit le rôle, avec les adresses d'aujourd'hui (D3) :

  | Entrée         | Adresse          | Icône           | Qui                                    |
  | -------------- | ---------------- | --------------- | -------------------------------------- |
  | Accueil        | `/dashboard`     | `home`          | tous                                   |
  | Annonces       | `/announcements` | `campaign`      | tous                                   |
  | Cours          | `/courses`       | `school`        | tous                                   |
  | Corrections    | `/corrections`   | `rate_review`   | qui corrige, avec le nombre en attente |
  | Ressources     | `/resources`     | `folder_open`   | enseignant, administrateur             |
  | Tests d'entrée | `/tests`         | `fact_check`    | enseignant, administrateur             |
  | Administration | `/admin`         | `shield_person` | administrateur                         |

  Le rôle démo voit ce que voit un élève, comme aujourd'hui.

- Étant donné l'entrée de la page courante, alors elle est un intercalaire : elle prend la couleur
  de la page et la rejoint (arrondis inversés au-dessus et au-dessous), porte `aria-current="page"`,
  et reste active sur les pages filles (`/courses/…` pour Cours).
- Étant donné un enseignant ou un administrateur, alors le bouton Créer, plein, est sous l'en-tête.
  Il ouvre le menu Créer (C-01) : Cours (`/courses/create`), Exercice, Activité, puis Cercle pour
  l'administrateur, en dernier, chacun avec sa ligne de description. Exercice, Activité et Cercle
  ouvrent `/resources/create` avec leur type ; sur la page d'une ressource (`/resources/:id`), elle
  devient le parent, comme aujourd'hui. Exercice mènera à la galerie des modèles quand R-04 sera
  livré.
- Étant donné une page qui a déjà une action principale de création (accueil enseignant vide), alors
  Créer passe en bouton discret : jamais deux boutons principaux à l'écran.
- Étant donné une personne qui n'a pas accepté la charte d'utilisation, quand elle ouvre Créer, alors
  la charte s'affiche d'abord, comme aujourd'hui.
- Étant donné le pied de la couverture, alors on y trouve Documentation (`/docs`, enseignant et
  administrateur), Notifications avec le nombre de non lues (le panneau est C-04), puis le profil :
  avatar, nom, rôle. Tout en bas, « Logiciel libre, par cisstech », discret, vers
  `github.com/cisstech/platon`, pour tous les rôles ; il remplace « Propulsé par ».
- Étant donné le profil, quand on l'ouvre, alors le menu montre le nom et l'adresse, puis Mon compte
  (`/account`), Mon cercle (`/resources/<cercle personnel>`, enseignant et administrateur), le thème
  en trois choix (Clair, Sombre, Auto) et Se déconnecter. Pour un administrateur, le menu porte la
  mention du rôle, qui remplace le cadre rouge actuel.
- Étant donné le choix d'un thème, alors il s'applique tout de suite et suit la personne dans
  l'ancienne interface (`NextTheme`, F-04).
- Étant donné le clavier, alors un lien d'évitement « Aller au contenu » est la première cible et
  mène à `#contenu` ; la couverture est un repère de navigation, la page un repère principal ; chaque
  bouton à icône seule a son nom et sa bulle (C-01).
- Étant donné une entrée dont l'écran n'est pas porté, alors elle ouvre l'ancienne interface par le
  pont (S-04).

## 2. Tests à écrire d'abord

- Fonction de vue pure de la navigation (`cover.vm.ts`) : entrées par rôle (élève, démo, enseignant,
  administrateur), Corrections selon qu'on corrige, entrée active selon l'adresse.
- Menu Créer : entrées par rôle, cible avec le cercle parent, charte d'abord quand elle n'est pas
  acceptée.
- Profil : entrées par rôle, choix du thème, déconnexion.
- Stories : couverture élève, enseignant, administrateur, démo ; Créer plein et discret ; en clair et
  en sombre, sans violation d'accessibilité.
- Parcours dans Chrome : lien d'évitement, intercalaire sur une page fille, bascule par le pont.

## 3. État actuel du code

Vérifié le 2026-09-29.

- Cadre actuel : `apps/web/src/app/pages/dashboard/dashboard.page.*` (`mat-drawer` de 220 px, barre
  `mat-toolbar`), `widgets/sidebar/` et `widgets/toolbar/` ; pas de `<main>` ni de lien d'évitement.
- Navigation (`widgets/sidebar/sidebar.component.ts:41-113`) : Corrections montré à tous, sans
  compteur ; Espace de travail et Tests d'entrée si `isTeacherRole` ; Administration pour
  l'administrateur ; Documentation vers `/docs`, enseignant et administrateur ; « Propulsé par » et
  le logo cisstech vers le dépôt, dans un nouvel onglet.
- Menu de création (`widgets/toolbar/toolbar.component.html:19-36, 78-115`) : bouton rond « + »,
  charte d'abord si elle n'est pas acceptée (`toolbar/user-charter/`) ; cercle parent déduit de
  `/resources/:id`.
- Profil (`toolbar.component.html:118-133`) : Mon compte, Mon cercle (identifiant par
  `GET /api/v1/users/{username}/circle`), Déconnexion (`AuthService.signOut()`). Le thème est un menu
  à part de la barre. Un bouton de tutoriels (`play_lesson`) s'affiche pour qui peut créer.
- Nombre de corrections en attente : aucun dans le cadre. `ResultService.listPendingCorrections()`
  (`libs/feature/result/browser/src/api/result.service.ts:157`) appelle
  `GET /api/v1/results/corrections/summary?status=pending`, dont `total` compte des activités, pas
  des copies ; `@platon/feature/result/browser` n'a pas d'entrée légère.
- Nom de l'établissement : aucune configuration.
- Nouvelle interface : `apps/web/src/next/next.routes.ts` n'a qu'un accueil provisoire à `''` et le
  pont ; `NextTheme` et `DialogService` existent (F-04).

## 4. Changements

- Bibliothèque : les pièces visuelles de la couverture (`pl-cover`, entrée de navigation avec
  l'intercalaire et son compteur, bouton plein et discret de couverture, pied), sans connaissance des
  rôles ni des adresses.
- Nouvelle interface :
  - `shell/` : le cadre, route parente des écrans portés ; `cover.vm.ts` pour les entrées par rôle ;
    le menu Créer, le profil, la charte (sur `pl-dialog`).
  - Une entrée légère pour `@platon/feature/result/browser` (D21), pour le nombre de corrections.
  - La source du nom de l'établissement (voir les points ouverts).
- Le cadre reste hors des écrans plein écran (lecteur, éditeur, atelier, connexion), qui passent par
  le pont.

## 5. Hors scope

Le panneau des notifications (C-04) ; le cadre mobile (C-03) ; les écrans derrière les entrées.

## 6. Points ouverts

- Élève qui corrige : la passe UX retire Corrections de la navigation élève et le rend à qui
  corrige. Proposition : l'afficher quand la synthèse des corrections, tous statuts confondus, n'est
  pas vide. À vérifier côté API.
- Compteur de Corrections : le wireframe compte 14, sans dire quoi ; l'API compte des activités.
  Afficher les activités, ou ajouter un compte de copies à l'API ?
- Tests d'entrée : la faisabilité propose de masquer l'entrée à qui n'a aucun test (agrégation sur
  `isTest`), la direction la montre toujours. Lequel ?
- Nom de l'établissement : proposition, une balise `<meta>` de `index.html`, comme le drapeau (D18),
  modifiable sans rebuild.
- Libellé du rôle sous le nom : les wireframes écrivent « Étudiante », « Enseignant »,
  « Administrateur ». La règle de rédaction demande un texte neutre. Proposition : « Élève »,
  « Équipe pédagogique », « Administration ».
- Tutoriels : l'ancienne interface a un bouton de tutoriels et en lance un à la première connexion
  d'un enseignant ; les wireframes n'en ont pas. On les garde (où ?) ou on les retire ?

- Thème dans le menu du profil : le wireframe y place un choix segmenté. Dans un menu, on passe d'une
  entrée à l'autre aux flèches et Tab le ferme : trois boutons radio y seraient inaccessibles au
  clavier. Proposition : trois entrées `menuitemradio` (Clair, Sombre, Auto) dessinées comme le choix
  segmenté (constat de C-01).

## 7. Definition of Done

- [ ] Les tests du §2 passent, stories comprises.
- [ ] Chaque entrée mène à la bonne adresse, ou à l'ancienne interface par le pont.
- [ ] La charte bloque toujours la création quand elle n'est pas acceptée.
- [ ] Les points ouverts sont tranchés, par une décision ou un amendement.
