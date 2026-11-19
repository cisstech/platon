# C-02 : La couverture : navigation par rôle, intercalaire, Créer, profil, mention du logiciel libre

Source : `design/flows/accueil-etudiant` (écran `etudiant`, surcouche `profil`, annotations),
`design/flows/accueil-enseignant` (écran `enseignant`, menu `creer`, annotations), révisés après
les quatre tours de critique ; `design/spec/project.md` (navigation, règles communes),
`design/docs/04-direction.md` (navigation, accessibilité), `design/docs/06-faisabilite.md` (cadre
et navigation) ; décisions : D3, D9, D19, D21, D22 à D27.
Statut : Livré (2026-10-08).
Dépend de : C-01, C-06, C-07.
Taille : L.

## 1. Comportement attendu

- Étant donné le cadre sur bureau, alors la couverture occupe 240 px à gauche, toujours sombre, même
  en thème clair ; la page est à droite, sans barre supérieure.
- Étant donné le haut de la couverture, alors on y trouve le logo, « PLaTon » et le nom de
  l'établissement, lu dans `<meta name="platon-institution">` (D24) et absent si la balise manque ;
  le logo mène à l'accueil (`/dashboard`), comme aujourd'hui.
- Étant donné la navigation, alors elle suit le rôle, avec les adresses d'aujourd'hui (D3) :

  | Entrée         | Adresse          | Icône           | Qui                                                 |
  | -------------- | ---------------- | --------------- | --------------------------------------------------- |
  | Accueil        | `/dashboard`     | `home`          | tous                                                |
  | Annonces       | `/announcements` | `campaign`      | tous                                                |
  | Cours          | `/courses`       | `school`        | tous                                                |
  | Corrections    | `/corrections`   | `rate_review`   | enseignant, administrateur, élève qui corrige (D22) |
  | Ressources     | `/resources`     | `folder_open`   | enseignant, administrateur                          |
  | Tests d'entrée | `/tests`         | `fact_check`    | enseignant, administrateur                          |
  | Administration | `/admin`         | `shield_person` | administrateur                                      |

  Le rôle démo voit ce que voit un élève, comme aujourd'hui. Corrections est toujours là pour
  l'enseignant et l'administrateur ; pour l'élève et le rôle démo, quand leur synthèse des
  corrections, tous statuts confondus, n'est pas vide (D22). Tests d'entrée est toujours là pour
  l'enseignant et l'administrateur (D23).

- Étant donné l'entrée de la page courante, alors elle est un intercalaire : elle prend la couleur
  de la page et la rejoint (arrondis inversés au-dessus et au-dessous), porte `aria-current="page"`,
  et reste active sur les pages filles (`/courses/…` pour Cours).
- Étant donné un compteur de la couverture, alors il dit ce qu'il compte aux lecteurs d'écran :
  « 2 copies à corriger », « 2 non lues ». Le compteur de Corrections est la somme des
  `pendingCopies` de la synthèse (D22) ; à zéro, il disparaît.
- Étant donné un enseignant ou un administrateur, alors le bouton Créer, plein, est sous l'en-tête.
  Il ouvre le menu Créer (C-01), une seule décision, quel objet, dans l'ordre où ils s'emboîtent ;
  chaque entrée porte le glyphe de l'objet à 40 px (C-07) et une ligne en mots simples, sans PLE ni
  PLA :

  - Cours (`/courses/create`) : « L'espace de vos étudiants, avec vos activités rangées en
    sections : semaines, chapitres. »
  - Activité : « Une série d'exercices à faire dans un cours, avec des dates et, si vous le voulez,
    une note. »
  - Exercice : « Une question corrigée automatiquement. Partez d'un modèle (QCM, programme avec
    tests, texte à trous) ou écrivez-la en code. »
  - Cercle, pour l'administrateur, en dernier.

  Activité, Exercice et Cercle ouvrent `/resources/create` avec leur type ; sur la page d'une
  ressource (`/resources/:id`), elle devient le parent, comme aujourd'hui. Exercice mènera à la
  galerie des modèles quand R-04 sera livré.

- Étant donné une page qui a déjà une action principale de création (accueil enseignant vide), alors
  Créer passe en bouton discret : jamais deux boutons principaux à l'écran.
- Étant donné une personne qui n'a pas accepté la charte d'utilisation, quand elle ouvre Créer, alors
  la charte s'affiche d'abord, comme aujourd'hui.
- Étant donné le pied de la couverture, alors on y trouve Documentation (`/docs` dans un nouvel
  onglet, enseignant et administrateur, D26), Notifications avec le nombre de non lues (le panneau est C-04), puis le profil :
  avatar, nom et, dessous, le type de compte (« Compte étudiant », « Compte enseignant »,
  « Compte administrateur »), jamais un genre que la plateforme ne connaît pas. Tout en bas,
  « Logiciel libre, par cisstech », discret, vers `github.com/cisstech/platon`, pour tous les rôles ;
  il remplace « Propulsé par ». Pour un administrateur, le type de compte remplace le cadre rouge
  actuel.
- Étant donné le profil, quand on l'ouvre, alors le menu s'ouvre au-dessus de lui : le nom et
  l'adresse, puis Mon compte (`/account`), Mon cercle (`/resources/<cercle personnel>`, enseignant et
  administrateur), Aide (élève et démo, qui n'ont pas Documentation, D26), le thème en trois entrées
  `menuitemradio` dessinées comme un choix segmenté (Clair, Sombre, Auto, D27) et Se déconnecter.
  Aide ouvre `/docs` dans un nouvel onglet, ce que disent l'icône `open_in_new` et, pour les lecteurs
  d'écran, « s'ouvre dans un nouvel onglet ».
- Étant donné la nouvelle interface, alors elle n'a ni bouton de tutoriels ni tutoriel à la première
  connexion (D25).
- Étant donné le choix d'un thème, alors il s'applique tout de suite et suit la personne dans
  l'ancienne interface (`NextTheme`, F-04).
- Étant donné le clavier, alors un lien d'évitement « Aller au contenu » est la première cible et
  mène à `#contenu` ; la couverture est un repère de navigation, la page un repère principal ; chaque
  bouton à icône seule a son nom et sa bulle (C-01).
- Étant donné une entrée dont l'écran n'est pas porté, alors elle ouvre l'ancienne interface par le
  pont (S-04).

## 2. Tests à écrire d'abord

- Fonction de vue pure de la navigation (`cover.vm.ts`) : entrées par rôle (élève, démo, enseignant,
  administrateur), Corrections selon la synthèse (élève correcteur compris), compteur de copies,
  entrée active selon l'adresse.
- API : `pendingCopies` de la synthèse des corrections (copies rendues dont un exercice au moins
  attend sa correction ; zéro quand tout est corrigé).
- Menu Créer : entrées par rôle, cible avec le cercle parent, charte d'abord quand elle n'est pas
  acceptée.
- Profil : entrées par rôle (Aide sans Documentation), thème en `menuitemradio` au clavier,
  déconnexion.
- Stories : couverture élève, enseignant, administrateur, démo ; Créer plein et discret ; en clair et
  en sombre, sans violation d'accessibilité.
- Parcours dans Chrome : lien d'évitement, intercalaire sur une page fille, bascule par le pont.

## 3. État actuel du code

Vérifié le 2026-09-29 ; synthèse des corrections revue le 2026-10-08.

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
  `GET /api/v1/results/corrections/summary?status=pending`. Chaque ligne (`ActivityCorrectionSummary`)
  donne une activité avec ses `totalExercises` et `correctedExercises` : des exercices, pas des
  copies. `@platon/feature/result/browser` n'a pas d'entrée légère.
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
  - Une entrée légère pour `@platon/feature/result/browser` (D21), pour la synthèse des corrections.
  - La lecture de `<meta name="platon-institution">` (D24), et la balise dans `index.html`, vide.
- API : `pendingCopies` dans `ActivityCorrectionSummary` (`@platon/feature/result/common`) et dans
  la requête de `CorrectionService.listSummary`, calculé dans la même agrégation (D22) ; champ
  ajouté, l'ancienne interface n'en dépend pas.
- Le cadre reste hors des écrans plein écran (lecteur, éditeur, atelier, connexion), qui passent par
  le pont.

## 5. Hors scope

Le panneau des notifications (C-04) ; le cadre mobile (C-03) ; les écrans derrière les entrées.

## 6. Points ouverts

Aucun : tranchés le 2026-10-08 par D22 à D27. Pour mémoire, les questions étaient :

- Élève qui corrige : la passe UX retire Corrections de la navigation élève et le rend à qui
  corrige. Proposition : l'afficher quand la synthèse des corrections, tous statuts confondus, n'est
  pas vide. À vérifier côté API.
- Compteur de Corrections : les wireframes comptent des copies à corriger ; l'API donne, par
  activité, des exercices corrigés sur un total. Ajouter un compte de copies à l'API, ou compter des
  exercices et le dire (« 6 exercices à corriger ») ?
- Tests d'entrée : la faisabilité propose de masquer l'entrée à qui n'a aucun test (agrégation sur
  `isTest`), la direction la montre toujours. Lequel ?
- Nom de l'établissement : proposition, une balise `<meta>` de `index.html`, comme le drapeau (D18),
  modifiable sans rebuild.
- Tutoriels : l'ancienne interface a un bouton de tutoriels et en lance un à la première connexion
  d'un enseignant ; les wireframes n'en ont pas. On les garde (où ?) ou on les retire ?
- Aide et Documentation : Aide (menu du profil, tous les rôles) ouvre « les pages d'aide de
  PLaTon », Documentation (pied, enseignant) ouvre `/docs`. Aide ouvre-t-elle aussi `/docs`, ou une
  autre adresse ?
- Thème dans le menu du profil : le wireframe y place un choix segmenté (un `radiogroup` dans un
  `menu`). Dans un menu, on passe d'une entrée à l'autre aux flèches et Tab le ferme : trois boutons
  radio y seraient inaccessibles au clavier. Proposition : trois entrées `menuitemradio` (Clair,
  Sombre, Auto) dessinées comme le choix segmenté (constat de C-01).

## 7. Definition of Done

- [x] Les tests du §2 passent, stories comprises.
- [x] Chaque entrée mène à la bonne adresse, ou à l'ancienne interface par le pont.
- [x] La charte bloque toujours la création quand elle n'est pas acceptée.
- [x] Les points ouverts sont tranchés, par une décision ou un amendement.

> **Amendement à la livraison.** Bibliothèque : `pl-cover` (le repère `banner` de l'application :
> logo, navigation, compte ; axe le demande, le pied et la marque sortaient sinon de tout repère),
> `a[plCoverBrand]` avec le logo des wireframes (`assets/design-system/logo.svg`, `LOGO_URL`),
> `pl-cover-nav`, `a[plCoverItem]` et `button[plCoverItem]` (intercalaire, compteur lu avec ce qu'il
> compte), `pl-cover-foot`, `button[plCoverProfile]`, `a[plCoverCredit]`, `a[plSkipLink]`,
> `pl-menu-group` et les entrées `menuitemradio` (`role` et `checked` sur `pl-menu-item`), `open()`
> sur `plMenuTrigger`. Le lien d'évitement déplace le focus par script : un lien `#contenu` se
> résout contre la base de l'application et rechargerait la page. Un `pl-menu` sans déclencheur
> reste caché : Angular Aria l'afficherait en place.

> **Amendement à la livraison.** Application : `shell/` (cadre, `cover.vm.ts`, `ShellStore`,
> `ShellApi`, la charte sur `pl-dialog`), route parente des écrans portés ; l'accueil provisoire
> passe à `/dashboard`, `''` y redirige, comme dans l'ancienne interface. Tant que la charte n'est
> pas acceptée, Créer annonce un dialogue (`aria-haspopup="dialog"`) ; une fois acceptée, le menu
> s'ouvre sur le premier objet. Le texte de la charte est réécrit dans la voix du produit et nomme
> la licence exacte du lien (CC BY-SA 2.0). Le cercle personnel est lu par `HttpClient` (`GET
/api/v1/users/{username}/circle`) : la bibliothèque des ressources n'a pas d'entrée légère et son
> provider tire l'entrée principale du cœur et les composants de notification. L'entrée légère
> `@platon/feature/result/browser/shared` est créée (D21), avec `listCorrectionSummaries()`. Le
> build copie désormais tous les SVG des assets de la bibliothèque, plus seulement le sprite.

> **Amendement à la livraison.** Hors de ce ticket : l'entrée Notifications du pied arrive avec son
> panneau (C-04), pour ne pas montrer un bouton qui n'ouvre rien ; le cadre reste à 240 px à toute
> largeur jusqu'à C-03.

> **Amendement à la livraison.** Vérifié dans Chrome sur le build de production, avec une API
> simulée (utilisateur, synthèse des corrections, charte, cercle) : enseignant et élève correcteur,
> en clair et en sombre (thème enregistré relu), sans violation axe sur la page ; premier Tab sur «
> Aller au contenu », Entrée donne le focus à `main#contenu` sans changer l'adresse ; Créer montre
> la charte, l'accepte (`POST /api/v1/user-charter/accept`) puis ouvre le menu ; profil avec le
> thème. Dans Storybook : 5 stories de couverture et 3 de menus, en clair et en sombre, sans
> violation. Les rôles sur des données réelles restent à voir.

> **Amendement à la livraison.** Après revue, la synthèse compte les mêmes exercices que la file de
> correction (`list`) : un exercice planté avant toute réponse attend aussi sa correction, et celui
> dont la ressource a été supprimée ne compte plus ; ce changement vaut aussi pour les onglets « À
> corriger » et « Corrigées » de l'ancienne interface. Elle agrège par copie d'abord, sans
> `COUNT(DISTINCT)`, pour que PostgreSQL puisse hacher. Vérifiée sur PostgreSQL, dans une
> transaction annulée, sur sept copies qui couvrent chaque cas (6 exercices, 4 corrigés, 2 copies à
> corriger) ; fixée par `correction.summary.integration.spec.ts`, qui démarre son propre conteneur
> PostgreSQL (`nx run feature-result-server:test:integration`). Un élève désigné correcteur voit ses
> copies mais ne peut pas enregistrer ses corrections (403) : défaut existant, B22.

> **Amendement à la livraison.** Après la revue du front : la déconnexion supprime le jeton avant de
> quitter la page (la page de connexion s'ouvre par un rechargement complet, qui aurait pu annuler sa
> suppression dans IndexedDB) ; les toasts partent du bord de la page, à côté de la couverture
> (`TOAST_INSET_START`) ; la page et la couverture défilent chacune dans leur conteneur, déclaré au
> CDK (`cdkScrollable`) pour que menus et bulles suivent ; la mention du logiciel libre garde son
> libellé visible dans son nom accessible ; un échec de l'accord à la charte le dit ; le store du cadre
> est fourni par sa route.
