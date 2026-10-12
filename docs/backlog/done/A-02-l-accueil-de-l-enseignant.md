# A-02 : L'accueil de l'enseignant

Source : `design/flows/accueil-enseignant` (défaut, vide, menu Créer) et ses annotations ;
`design/spec/flows/accueil-enseignant.md` ; `design/docs/06-faisabilite.md` (accueil enseignant) ;
inventaire du code du 2026-10-12 ; décisions : D8, D21, D22, D25, D32, D38.
Statut : Livré (2026-10-12), sur la branche `feat/home-data`, avec A-04 et A-01.
Dépend de : C-05, A-04, A-01 (bandeau, ligne d'activité, dates à venir).
Taille : L.

## 1. Comportement attendu

- Étant donné un enseignant ou un administrateur qui ouvre `/dashboard` dans la nouvelle interface,
  alors il voit son accueil, en quatre zones au plus : « En cours », « À faire », « Mes cours » et
  « Vu récemment ». Le bandeau d'annonce d'A-01 appartient à l'en-tête de la page, sous le titre, et
  ne compte pas parmi les zones.
- Étant donné le jour, alors le sous-titre ne dit que ce qui est vrai à cette date (« Deux activités
  ferment cette semaine, 2 copies à corriger. »).
- Étant donné les activités ouvertes de ses cours qui suivent leurs dates, alors « En cours » les
  liste triées par échéance, la plus proche en premier. Chaque ligne dit son cours, son échéance, la
  participation en clair au-dessus de la barre, à la teinte du cours (« 187 sur 302 ont commencé »),
  et la moyenne, dite provisoire tant que l'activité est ouverte. La ligne entière ouvre le suivi de
  l'activité (`/activities/monitor/:courseId/:activityId`), sans bouton ; le chevron le dit.
- Étant donné ce qui attend un geste de sa part, alors « À faire » le liste, chaque ligne avec le
  bouton qui le nomme : les copies qui lui sont confiées (« 2 copies à corriger sur 2 », Corriger,
  vers `/player/correction/:courseId?activityId=…`) ; une activité ouverte sans dates (« Ouverte,
  sans dates », Planifier), en information neutre pour un entraînement, en attention pour une épreuve
  notée ; une épreuve planifiée (« Ouvre le lundi 12 octobre à 8 h », Relire les réglages). Une
  ligne discrète, sans action, dit où en sont les copies de ses cours confiées à un autre correcteur
  (point ouvert n° 3). Tous ces boutons sont secondaires : Créer reste l'action primaire.
- Étant donné ses cours, alors « Mes cours » les liste à leur teinte, avec leurs nombres
  d'étudiants et d'enseignants.
- Étant donné les ressources qu'il a vues, alors « Vu récemment » montre les trois premières de la
  liste de Ressources, dans le même ordre : leur type, le moment de la visite (« ce matin », « hier »)
  et, pour un exercice, son statut (Prêt `verified`, Brouillon `save`).
- Étant donné un enseignant sans cours, alors l'accueil le salue par son prénom, la chaleur sur
  l'icône seule, une animation de 600 ms ; la copie vierge dit que rien n'est encore là, puis trois
  étapes : créer un cours (la seule action primaire, le bouton Créer de la couverture passant en
  secondaire), trouver ou écrire un exercice, l'ajouter comme activité. Pas de visite guidée (D25),
  contrairement au wireframe.
- Étant donné le chargement, le chargement lent et l'erreur, alors l'accueil suit A-01 : squelettes à
  la forme des zones, message à 10 s pendant que le store réessaie, erreur à 30 s avec seulement
  Réessayer.
- Étant donné le menu Créer (C-02), alors son entrée Exercice mène toujours à la galerie des modèles,
  qui ne vit aujourd'hui que dans l'accueil actuel (point ouvert n° 4).

> **Amendement à la livraison.**
>
> - « En cours » : une activité à périodes de restriction sans fermeture dit « Dates par période » ;
>   la participation accorde son verbe (« 1 sur 302 a commencé », « 118 sur 302 participent » pour
>   un challenge).
> - « À faire » :
>   - les épreuves planifiées sont les activités notées à venir, quelle que soit leur date ; un
>     entraînement planifié n'y figure pas ;
>   - une activité notée ouverte sans dates prend l'icône `warning` avec son ton d'attention ;
>   - une ligne de copies montre sa barre dès qu'une copie est corrigée ;
>   - une activité que la personne corrige sans y enseigner garde le nom du résumé, ou « Activité sans
>     titre ».
> - La ligne des copies confiées à un autre correcteur attend L-04 (D38).
> - Une date au-delà de la semaine porte son jour : « Ouvre le lundi 12 octobre à 8 h » (`upcomingTime`
>   du design system, aussi pour l'élève).
> - « Vu récemment » dit le moment par `relativeTime` : « il y a 3 h », « hier », « vendredi », et non
>   « ce matin ». Le type vient de `RESOURCE_TYPE_NAMES` ; le statut d'un exercice dit « Prêt » plutôt
>   que le libellé long de la liste.
> - L'état vide :
>   - il suit le wireframe : Créer un cours (primaire, `add`), Partir d'un modèle (secondaire,
>     `tune`, vers `/templates`), Parcourir les ressources (discret, `folder_open`) ;
>   - « Pour aller plus loin » ne garde que la documentation, sans visite guidée (D25) ;
>   - la deuxième étape dit « des exercices prêts à l'emploi » : les disciplines du wireframe ne valent
>     pas pour toutes les instances.
> - L'accueil n'est vide que sans cours et sans copie à corriger. Les cours archivés par la personne
>   quittent « Mes cours » et, par `taught`, « En cours » et « À faire ». Un enseignant dont tous les
>   cours sont archivés mais qui a des copies à corriger garde l'accueil, « Mes cours » disant
>   « Aucun cours en dehors de vos archives ».
> - La galerie de `/templates` crée toujours l'exercice dans le cercle personnel, comme l'accueil
>   actuel. Seul « Écrire sans modèle » garde le cercle ouvert au moment de Créer
>   (`/resources/create?parent=…`) : la création rapide ne choisit pas son cercle.
> - « Revenir à l'interface actuelle », que S-05 promettait au menu du profil, y est enfin : menu du
>   profil sur ordinateur, feuille du profil sur téléphone. L'accueil provisoire, qui le portait,
>   disparaît.

## 2. Tests à écrire d'abord

- Fonctions de vue (`teacher-home.vm.ts`) : le tri de « En cours », la participation et la moyenne
  provisoire, les lignes de « À faire » et leur bouton (Corriger, Planifier, Relire les réglages),
  le ton d'une activité sans dates selon qu'elle est notée, la ligne des autres correcteurs, le
  sous-titre à une date donnée, « Vu récemment » (type, moment, statut), l'état vide.
- Store : le chargement des sources, l'erreur, Réessayer, la nouvelle tentative pendant le message
  des 10 s.
- Page : défaut, vide, chargement, lent, erreur ; aucune ligne de « En cours » ne porte de bouton ;
  Créer passe en secondaire quand l'accueil est vide.
- API sur `HttpTestingController` ; design system : stories et axe pour chaque composant nouveau.

> **Amendement à la livraison.** La politique de chargement est testée une fois, sur `HomeLoader`,
> que partagent les stores des deux accueils ; chaque store teste ses sources. La ligne des autres
> correcteurs n'a pas de test : elle attend L-04.

## 3. État actuel du code

Vérifié le 2026-10-12.

- Accueil actuel : l'enseignant et l'administrateur n'y voient que le sélecteur de modèles
  (`resource-template-selection`), seul accès à la galerie (`ResourceService.search` sur les
  exercices configurables certifiés, puis un brouillon dans le cercle personnel et `/builder/:id`).
- Activités : comme pour A-01, seulement par cours ; `progression` et `timeSpent` sont ceux de
  l'enseignant lui-même. Un co-enseignant qui n'a pas créé une activité réservée à des membres ou à
  des groupes ne la voit pas (`activity.service.ts`).
- Participation et moyenne : seulement activité par activité, `GET
/api/v1/results/dashboard/activities/:id`, qui charge toutes les sessions de l'activité ; le taux
  de réponse s'y compte sur les sessions, pas sur les membres.
- Corrections : `GET /api/v1/results/corrections/summary` (une requête), déjà chargé par
  `ShellStore` pour le compteur de la couverture ; il donne `pendingCopies` par activité confiée à la
  personne, mais ni le total des copies rendues ni leur date, ni les copies confiées à d'autres.
- Vu récemment : `GET /api/v1/resources?views=true` rend les cinq dernières ressources vues, sans la
  date de la visite.
- Notée : aucun champ (A-01, point n° 2).
- Cadre : `quietCreate` (Créer en secondaire) vient des données statiques de la route ; l'état vide
  a besoin de le décider selon les données.

## 4. Changements

- API : par A-04 (point ouvert n° 1).

> **Amendement (A-04 livré).** La vue de l'enseignant est `GET activities/taught` (D40), pas
> `activities/mine`. Une activité dont les dates suivent des périodes de restriction (`restricted`)
> n'est pas « Ouverte, sans dates » : ses dates de base sont vides, mais chaque groupe a les siennes ;
> elle se dit « Dates par période » et ne demande pas Planifier. Le nom d'une activité vient de
> `taught`, qui se rabat sur le nom de la ressource quand le titre est vide, et pas du résumé des
> corrections, qui ne le fait pas.

- Accès navigateur : l'entrée légère de `course` (A-01) ; les corrections par l'entrée de `result` ;
  « Vu récemment » par l'entrée de `resource`.
- Design system : les composants d'A-01 ; une ligne avec bouton nommé pour « À faire ».
- Nouvelle interface : l'accueil par rôle de `pages/home/` prend la vue de l'enseignant pour
  l'enseignant et l'administrateur ; `ShellStore` expose « Créer en secondaire » comme un signal que
  l'accueil vide règle.

> **Amendement à la livraison.**
>
> - API : `taught` écarte les cours que la personne a archivés, comme `mine` (A-04), pour que
>   « Mes cours » (`courses?archived=false&expands=statistic`) et les activités parlent des mêmes
>   cours.
> - Accès navigateur : `RESOURCE_TYPE_NAMES` passe par l'entrée légère de `resource`.
> - Design system :
>   - `pl-steps` et `pl-step` pour les étapes numérotées (aussi dans le wireframe du cours vide) ;
>   - `pl-activity-row` prend un bouton `secondary`, une action facultative (le chevron seul), des
>     `queryParams`, une barre seulement quand il y a un total, et le tag dans la description de
>     son bouton ;
>   - `upcomingTime` donne le jour d'une date au-delà de la semaine.
> - Nouvelle interface :
>   - `HomeLoader` porte le chargement des deux stores (`StudentHomeStore`, ex-`HomeStore` d'A-01, et
>     `TeacherHomeStore`), et `homePage` ce que les deux pages font autour : la phase, l'accueil, le
>     bandeau, Réessayer, le focus ;
>   - `pages/home/` suit l'organisation écrite dans `.claude/rules/front/new-interface.md`, appliquée
>     à tout `next/` : l'aiguillage et ce que les vues partagent à la racine (`home-page.ts`,
>     `home.vm.ts`, `home-layout.scss`), les API et les stores dans `data/`, les composants
>     d'affichage dans `ui/` (`app-home-zone`, le bandeau, l'état vide de l'enseignant), une vue par
>     dossier (`student/`, `teacher/`) ;
>   - une zone (`app-home-zone`) montre son contenu ou son squelette : une seule mise en page pour le
>     chargement et les données ;
>   - `lint:dead-css` vérifie une feuille partagée contre tous les gabarits qui la listent ;
>   - le compte des copies (`pendingCopies`, `copiesToCorrect`) et `DOCS_URL` passent dans
>     `next/shared` ;
>   - l'accueil chargé rafraîchit le compteur Corrections de la couverture
>     (`ShellStore.summaries`) ;
>   - Exercice, dans le menu Créer, mène à `/templates`.
> - Interface actuelle : la route `/templates` (enseignant et administrateur) reprend
>   `resource-template-selection`, avec « Écrire sans modèle ».

## 5. Hors scope

Le suivi d'une activité (K-07), la file de correction (L-04) et le panneau de réglage d'une
activité (K-05), vers lesquels mènent les lignes : ils passent par le pont tant qu'ils ne sont pas
portés. Le menu Créer (C-02, livré).

## 6. Points ouverts

Aucun : tranchés le 2026-10-12 par D38, comme proposé. Pour mémoire, les questions étaient :

1. Les données. La participation et la moyenne coûtent aujourd'hui une requête lourde par activité,
   et lister les activités, un appel par cours. Proposé : A-04 donne aussi la vue de l'enseignant
   d'`activities/mine` (les activités des cours où il peut écrire, toutes, avec le nombre de membres
   qui ont commencé sur le nombre de membres et la moyenne provisoire, en une requête), le total et
   la date des copies rendues dans le résumé des corrections, et le moment de la visite dans « Vu
   récemment », chaque fois en champ ajouté.
2. Les activités qu'un co-enseignant ne voit pas. Proposé : la vue de l'enseignant d'A-04 liste
   toutes les activités des cours où la personne peut écrire, puisque l'accueil sert à piloter le
   cours.
3. La ligne des autres correcteurs (« les 14 copies de l'Examen partiel 1 sont confiées à Julien
   Lefèvre »). Aucune route ne la donne. Proposé : la reporter à L-04, qui portera la file de
   correction ; l'accueil s'en passe d'ici là. Reportée.
4. La galerie des modèles. Porter `/dashboard` retire le seul accès à la galerie, et R-04 n'est pas
   livré. Proposé : une route `/templates` dans l'interface actuelle, qui reprend le sélecteur
   existant, et vers laquelle mène Exercice dans le menu Créer de la nouvelle interface, par le pont,
   jusqu'à R-04.
5. Planifier et Relire les réglages mènent au panneau de réglage d'une activité, qui vit dans la
   page du cours de l'interface actuelle jusqu'à K-05. Proposé : vers
   `/activities/:courseId/:activityId`, par le pont.

## 7. Definition of Done

- [x] Les tests du §2 passent.
- [x] Les états vérifiés dans Chrome sur le build de production, sur ordinateur et sur téléphone,
      en clair et en sombre, au clavier, sans violation axe.
- [x] Un enseignant atteint toujours la galerie des modèles depuis la nouvelle interface.
- [ ] Les liens de « En cours » et de « À faire » ouvrent le suivi, la correction et les réglages.

> **Amendement à la livraison.**
>
> - Vérifié dans Chrome sur le build de production avec une fausse API d'enseignant :
>   - les cinq états, sur ordinateur et sur téléphone, en clair et en sombre, sans violation axe ;
>   - le clavier de la couverture aux zones ;
>   - le focus sur « En cours » après la fermeture du bandeau ;
>   - aucune cible sous 44 px sur téléphone ;
>   - Créer discret sur l'accueil vide, de nouveau primaire quand des cours arrivent ;
>   - « Revenir à l'interface actuelle » dans le menu et dans la feuille du profil ;
>   - axe sur chaque story nouvelle ou modifiée.
> - L'accueil de l'élève, refait sur `homePage`, est revérifié de la même façon.
> - Les liens portent les bonnes adresses (`/activities/monitor/…`, `/player/correction/…?activityId=…`,
>   `/activities/…`), mais les écrans d'arrivée n'ont pas été vus, faute d'API réelle.
> - La page `/templates` de l'interface actuelle compile et se charge à part, mais n'a pas été vue
>   dans Chrome.
> - Le cas des cours archivés de `taught` a sa spec d'intégration, lancée avec testcontainers : les
>   17 cas passent, et celui-ci échoue quand on retire le filtre.
