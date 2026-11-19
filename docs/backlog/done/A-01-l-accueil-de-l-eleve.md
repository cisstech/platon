# A-01 : L'accueil de l'élève

Source : `design/flows/accueil-etudiant` (bureau et téléphone : défaut, vide, chargement, lent,
erreur) et ses annotations ; `design/spec/flows/accueil-etudiant.md` ; `design/docs/06-faisabilite.md`
(accueil étudiant) ; inventaire du code du 2026-10-12 ; décisions : D8, D21, D25, D26, D32, D38, D40.
Statut : Livré (2026-10-12), sur la branche `feat/home-data`, avec A-04.
Dépend de : C-05, A-04.
Taille : L.

## 1. Comportement attendu

- Étant donné un élève ou un compte de démonstration qui ouvre `/dashboard` dans la nouvelle
  interface, alors il voit son accueil, en quatre zones au plus : le bandeau d'annonce, « À faire »
  (qui se termine par « Bientôt »), « Résultats récents », et « Mes cours » avec trois chiffres. Le
  compte de démonstration n'a plus un accueil vide (B5). L'enseignant et l'administrateur gardent
  l'accueil provisoire jusqu'à A-02.
- Étant donné les activités ouvertes de tous ses cours, alors « À faire » les liste triées par
  échéance, une activité sans échéance après les autres. Chaque ligne prend la teinte de son cours
  (`courseHue`, D32) sur son icône et sur sa barre d'avancement, dit son cours, son avancement en
  exercices (« 5 exercices sur 6 ») et son échéance (« Ferme ce soir à 23 h 59 », « Ferme jeudi à
  18 h »). Une échéance à moins de 24 h est en attention ; une échéance dépassée d'une activité
  encore ouverte est en correction, avec « En retard ». La couleur n'est jamais seule : l'icône et
  le texte la disent aussi.
- Étant donné une activité de « À faire », alors son action se dit en toutes lettres : Commencer
  (rien fait), Reprendre (commencée), Voir mes résultats (terminée). Seule l'activité la plus
  urgente porte un bouton ; les autres lignes sont des liens entiers, leur action écrite dans la
  colonne du bouton. Reprendre ouvre le lecteur (`/player/activity/:id`) sur l'exercice où l'élève
  s'est arrêté.
- Étant donné une activité qui ouvre dans les 7 jours, alors « Bientôt » la dit avant qu'elle
  ouvre (« Ouvre mercredi à 10 h »), avec Lire les règles. Une activité notée porte « Notée », sa
  durée et son nombre de tentatives, avant même d'ouvrir (point ouvert n° 2).
- Étant donné les copies récentes de l'élève, alors « Résultats récents » montre les trois dernières
  comme de petites copies : la feuille, sa marge, la note écrite dans la marge (sur 100) et « Voir la
  correction », qui ouvre la copie corrigée dans le lecteur ; une copie encore en correction a la
  marge vide et dit « En correction ».
- Étant donné ses cours en cours (ni archivés, ni tests d'entrée), alors « Mes cours » dit pour
  chacun son avancement en exercices, de la même façon sous chaque barre (« 34 exercices sur 59 ») ;
  un cours terminé dit « Cours terminé », avec `task_alt` et la barre pleine en chaleur, le mot
  restant dans la couleur du texte. Sous les cours, sur ordinateur seulement, trois chiffres en
  chiffres tabulaires : la moyenne, la réussite et le temps passé, ceux de `GET
/api/v1/results/dashboard`.
- Étant donné une annonce visible et pas encore fermée, alors le bandeau en montre une seule, sous
  le titre ; il se ferme et ne revient pas pour la même annonce (point ouvert n° 5). Il vient avec
  les données : ni le chargement ni l'erreur ne le montrent.
- Étant donné un élève sans cours, alors l'accueil le salue par son prénom (« Bienvenue sur PLaTon,
  Inès », son identifiant à défaut de prénom), la chaleur sur l'icône seule, qui s'allume une fois en
  600 ms ; puis la copie vierge explique comment un cours apparaît (inscription depuis Moodle, lien
  de l'enseignant) et mène à l'aide par « Comment rejoindre un cours » (D26). Aucun chiffre.
- Étant donné le chargement, alors le prénom, la date et les titres des zones s'affichent tout de
  suite, et seules les données attendues sont en squelette, dans leur forme (des lignes pour À
  faire, deux petites copies). À 10 s, le squelette reste et un message neutre dit que le chargement
  prend plus de temps que d'habitude, pendant que le store réessaie ; à 30 s, l'erreur dit si c'est
  PLaTon qui ne répond pas (`cloud_off`) ou la connexion (`wifi_off`), rassure sur ce qui est
  enregistré et propose seulement Réessayer (`app-load-state`, C-05).
- Étant donné un téléphone, alors l'accueil garde tout, dans l'ordre du pouce : une annonce de
  service en tête s'il y en a une, À faire avec Bientôt, une annonce ordinaire après À faire,
  Résultats récents, Mes cours ; les trois chiffres restent sur ordinateur ; chaque cible fait au
  moins 44 px.

> **Amendement à la livraison.** Une ligne dit son avancement « 5 sur 6 », « exercices faits » n'étant
> lu que par les lecteurs d'écran, comme dans le wireframe. Une activité notée dit « Notée », sa durée
> et ses tentatives dans « À faire » aussi, pas seulement dans « Bientôt ». L'icône d'une activité ni
> challenge ni notée est `assignment` : aucun champ ne dit sa forme (quiz, code, fonctions). Une
> petite copie dit « Rendue le 22 septembre », notée ou non : aucune date de correction n'existe. Une
> copie dont l'activité cache la correction n'a ni note, ni état, ni lien : sa date seule dit qu'elle
> est rendue. Le bandeau est choisi quand les données arrivent : le fermer le ferme, aucune autre
> annonce ne prend sa place avant le prochain chargement. Sans annonce de service (A-03), une annonce
> vient après « À faire » sur téléphone, sauf sur l'accueil vide, où elle reste sous le titre. Textes
> qui ne sont pas dans les wireframes : « Rien à rendre pour l'instant. » (aucune activité ouverte),
> « Vos copies terminées apparaîtront ici. » (aucune copie), « Aucune activité pour l'instant » (un
> cours sans activité, sans barre). « Mes cours » vient de la liste des cours non archivés, triés par
> nom. Le squelette du chargement n'a ni la ligne de « Bientôt » ni le titre « Sur tous mes cours ».
> Après « Réessayer » ou la fermeture du bandeau sans zone suivante, le focus va au contenu de la
> page. Le store ne réessaie qu'une panne qui peut passer (réseau, 5xx) : un refus échoue tout de
> suite, un essai lent court jusqu'à 30 s, et les annonces ne sont attendues que 3 s.

## 2. Tests à écrire d'abord

- Fonctions de vue (`home.vm.ts`) : le tri par échéance (sans échéance en dernier), l'activité la plus
  urgente, le ton de l'échéance (normal, moins de 24 h, en retard), l'action d'une ligne, le texte
  d'avancement d'une activité et d'un cours, « Cours terminé », la fenêtre de Bientôt, la marge d'une
  copie (note ou « En correction »), le salut avec ou sans prénom, l'ordre des zones sur téléphone.
- Store (`HomeStore`) : le chargement des trois sources, l'erreur qui distingue PLaTon et la
  connexion, Réessayer, la nouvelle tentative pendant le message des 10 s, la fermeture d'une annonce.
- Page : les cinq états (défaut, vide, chargement, lent, erreur), sur ordinateur et sur téléphone ;
  le bouton seul sur l'activité la plus urgente ; les noms accessibles des lignes (action, échéance,
  avancement) ; aucun bandeau pendant le chargement ni dans l'erreur.
- API (`HomeApi`) sur `HttpTestingController` : les adresses et les paramètres des sources.
- Design system : chaque composant nouveau a sa spec et ses stories en clair et en sombre, sans
  violation axe.

> **Amendement à la livraison.** Distinguer une panne de PLaTon d'une coupure de la connexion revient à
> `app-load-state` (C-05), déjà testé : le store n'en sait rien.

## 3. État actuel du code

Vérifié le 2026-10-12.

- Accueil actuel : `apps/web/src/app/pages/dashboard/overview/` ne charge des données que pour
  l'élève (B5) : huit statistiques et deux graphiques de `GET /api/v1/results/dashboard`, aucune
  activité. Les annonces y arrivent en notification ng-zorro, depuis la barre d'outils.
- Nouvelle interface : `/dashboard` est porté (`apps/web/src/shared/ported-paths.ts`) et montre
  l'accueil provisoire `next/pages/home` ; le cadre, `pl-page`, `app-load-state` et `trackLoadPhase`
  existent (C-05).
- Cours : `GET /api/v1/courses` (filtres `archived`, `isTest`), avec `expands=statistic` qui coûte
  trois requêtes par cours ; `CourseStatistic.progression` est une moyenne pondérée (100 par
  exercice noté, 10 par exercice commencé), pas un compte d'exercices.
- Activités : seulement par cours, `GET /api/v1/courses/:id/activities`, chaque appel faisant une
  requête de droits par activité ; le DTO n'a ni le nom du cours, ni « commencée » ou « terminée »,
  ni le nombre d'exercices faits, ni l'identifiant de la session. Une activité inaccessible revient
  fermée, ses dates à `null`. Aucune requête ne couvre tous les cours (pas d'`activities/mine`).
- Notée : aucun champ ne le dit ; `code` existe pour toutes les activités. `activitySettings` donne
  la durée et le nombre de tentatives.
- Résultats : aucune route ne liste les copies récentes d'une personne ; `SessionData` (vue indexée
  par personne) porte la note, la note de correction et le cours, et pourrait la servir.
- Annonces : `GET /api/v1/announcements/visible` refuse le compte de démonstration (403), ne connaît
  ni l'état lu ni une annonce de service, et la fenêtre d'affichage est calculée dans le navigateur ;
  aucune entrée légère.
- Entrées légères : `course` et `announcement` n'ont pas de `/shared` (D21) ; `result` en a une.
- Design system : `pl-page`, `pl-empty` (avec l'illustration de joie), `pl-skeleton`, `pl-alert`,
  `pl-tag`, `pl-glyph`, `courseHue`, `relativeTime` (passé seulement). Manquent une ligne
  d'activité, une barre d'avancement à la teinte d'un cours, la petite copie, un bandeau qui se
  ferme, les dates à venir (« Ferme ce soir à 23 h 59 ») et les icônes `construction` et
  `history_edu`.

## 4. Changements

- API : par A-04 (point ouvert n° 1).

> **Amendement (A-04 livré).** L'avancement d'un cours se compte en sommant `exercisesDone` et
> `exerciseCount` d'`activities/mine` par cours. Une copie de `results/recent` peut aussi être
> `hidden` (l'activité cache la correction) : sa marge reste vide et elle n'offre pas « Voir la
> correction », à tester avec la marge d'une copie (§2). « En retard » ne peut pas arriver :
> une activité ferme à son échéance, son état passe à `closed` et elle quitte « À faire » ; le ton de
> l'échéance n'a que normal et moins de 24 h.

- Accès navigateur : l'entrée légère de `course` (`CourseService`, ses providers sans les analyseurs
  de notifications) et celle d'`announcement` ; `ResultService.userDashboard` depuis l'entrée de
  `result`.
- Design system : une ligne d'activité (icône, titre, contexte, barre, échéance, action), une barre
  d'avancement à la teinte d'un cours, la petite copie de résultat, la variante qui se ferme de
  `pl-alert`, les dates à venir à côté de `relativeTime`, les icônes `construction` et `history_edu`.
- Nouvelle interface : `pages/home/` devient l'accueil par rôle ; pour l'élève et la démonstration,
  `HomeApi`, `HomeStore` (fourni par la route), `home.vm.ts` et la page ; le titre de la route
  « Accueil ».

> **Amendement à la livraison.** Design system : `pl-activity-row` (avec `pl-activity-list` et son
> squelette), `pl-copy-card` (et son squelette), `pl-progress`, `pl-joy-mark`, le `dismissLabel` de
> `pl-alert` ; `upcomingTime`, `clockTime`, `longDate`, `calendarDay`, `durationText`, `capitalize`,
> `NO_BREAK_SPACE` et `percentOf` ; les icônes `construction`, `history_edu` et `assignment` ; les
> rôles `--pl-color-track` et `--pl-hue-strong`. Les liens d'une ligne et d'une copie passent par le
> routeur, pour qu'une adresse de l'interface actuelle n'y arrive qu'en un rechargement, par le pont.
> Les filets entre les lignes, dont ceux des notifications, ne s'affichaient pas (`:host + :host` ne
> vise rien sous l'encapsulation d'Angular) : `:host(:not(:first-child))`. La règle d'affichage des
> annonces (`isOnDisplay`) et leur mémoire dans le navigateur, gardée contre un stockage refusé,
> passent dans l'entrée légère d'`announcement` ; `FeatureAnnouncementService` les reprend. Partagés
> dans la nouvelle interface : `plural`, `narrowScreen`, `DOCS_URL`. « Voir la correction » et les
> lignes mènent à `/player/activity/:id`, comme la notification de correction de l'interface
> actuelle.

## 5. Hors scope

L'accueil de l'enseignant et de l'administrateur (A-02). La page Annonces (A-03). Le lecteur et la
copie corrigée (phase L), vers lesquels mènent les liens. Les notifications, le profil et la
navigation, livrés dans la phase C.

## 6. Points ouverts

Aucun : tranchés le 2026-10-12 par D38, comme proposé. Pour mémoire, les questions étaient :

1. Les données. Construire « À faire » dans le navigateur coûte un appel par cours, chacun avec une
   requête de droits par activité, et il manque le nom du cours, « commencée », les exercices faits
   et les copies récentes. Proposé : A-04 devient le ticket des données des deux accueils, livré
   avant A-01 : `GET /api/v1/activities/mine` (les activités de la personne dans tous ses cours,
   avec ses dates propres, son avancement en exercices, son état et le nom du cours), `GET
/api/v1/results/recent` (ses dernières copies, notées ou en correction) et l'avancement en
   exercices par cours.
2. « Notée ». Aucun champ ne le dit. Proposé : un champ `graded` sur l'activité, faux par défaut,
   réglé plus tard dans le panneau de l'activité (K-05) ; d'ici là, « Notée » n'apparaît pas, plutôt
   que d'être deviné.
3. L'icône de forme. Rien ne dit si une activité est un quiz, du code ou des fonctions. Proposé :
   `emoji_events` pour un challenge, `history_edu` pour une activité notée, le glyphe de l'activité
   sinon.
4. Un cours terminé. Proposé : quand tous les exercices de ses activités sont faits ; l'avancement
   d'un cours se compte en exercices faits sur ses exercices (A-04).
5. Le bandeau. Aucune annonce n'a d'état lu ni de type « service », et le compte de démonstration
   est refusé. Proposé pour A-01 : la plus récente annonce visible que la personne n'a pas fermée
   dans ce navigateur, comme l'interface actuelle ; l'annonce de service passe en tête une fois
   qu'A-03 ajoute ce type et l'état lu côté serveur ; A-04 ouvre la route au compte de
   démonstration.

## 7. Definition of Done

- [x] Les tests du §2 passent.
- [x] Les cinq états vérifiés dans Chrome sur le build de production, sur ordinateur et sur
      téléphone, en clair et en sombre, au clavier, sans violation axe.
- [ ] Le chemin heureux vu de bout en bout : Reprendre mène au lecteur, sur l'exercice où l'élève
      s'était arrêtée.
- [x] Le compte de démonstration a un accueil.

> **Amendement à la livraison.** Vérifié dans Chrome sur le build de production avec une fausse API
> (le serveur de développement ne tournait pas) : les cinq états sur ordinateur et sur téléphone, en
> clair et en sombre, sans violation axe ; le clavier jusqu'à Reprendre ; le focus après la fermeture
> du bandeau ; aucune cible sous 44 px sur téléphone ; axe sur chaque story nouvelle ou modifiée.
> Reprendre ouvre `/player/activity/:id` dans l'interface actuelle en un seul rechargement ; que le
> lecteur reprenne sur le bon exercice n'a pas été vu, faute d'API réelle. Le compte de démonstration
> est vérifié par spec (rôle `demo` vers l'accueil de l'élève), pas dans Chrome.
