# Les données des maquettes

Les maquettes montrent un seul monde, cohérent d'un écran à l'autre : les mêmes personnes, les
mêmes cours, les mêmes dates et les mêmes notes. Cette page en est la référence. Un écran qui
contredit cette page a tort ; un nouvel écran y puise ses données, et une donnée nouvelle s'y
ajoute d'abord.

## Le moment de chaque scénario

| Scénario                                                 | Moment                                        |
| -------------------------------------------------------- | --------------------------------------------- |
| Accueils, cours, ressources, corrections, administration | lundi 28 septembre 2026, 10 h                 |
| Examen partiel 2 (lecteur, épreuve notée)                | lundi 12 octobre 2026, de 8 h à 9 h 30        |
| Copie corrigée de TP 3                                   | lundi 28 septembre 2026, 10 h                 |
| Test d'entrée de Mariam                                  | vendredi 9 octobre 2026, de 14 h 30 à 15 h 42 |
| Création d'un exercice (atelier)                         | mardi 29 septembre 2026, 10 h 42              |
| Ajout d'Examen partiel 2 à AP1 (flow activité)           | lundi 21 septembre 2026, 14 h                 |

Jours utiles : lundi 28 septembre, mardi 29, mercredi 30, jeudi 1er octobre, vendredi 2,
dimanche 4, lundi 5, vendredi 9, lundi 12, jeudi 15 octobre, vendredi 6 novembre.

## Les personnes

| Personne       | Compte         | Rôle dans les maquettes                                            | Courriel                        |
| -------------- | -------------- | ------------------------------------------------------------------ | ------------------------------- |
| Inès Benali    | étudiant       | L1 Informatique, groupe TD 2 d'AP1                                 | ines.benali@etud.univ-eiffel.fr |
| Karim Haddad   | enseignant     | responsable d'AP1, enseigne aussi Programmation web et Java, L3    | karim.haddad@univ-eiffel.fr     |
| Hélène Martin  | enseignant     | autrice d'exercices, propriétaire du cercle Algorithmique          | helene.martin@univ-eiffel.fr    |
| Julien Lefèvre | enseignant     | doctorant, chargé de TD et correcteur d'AP1 (groupes TD 2 et TD 4) | julien.lefevre@univ-eiffel.fr   |
| Léa Fontaine   | enseignant     | chargée de TD d'AP1 (TD 3)                                         | lea.fontaine@univ-eiffel.fr     |
| Sophie Lambert | administrateur | administratrice de la plateforme, ne corrige pas                   | sophie.lambert@univ-eiffel.fr   |
| Paul Renard    | enseignant     | compte désactivé                                                   | paul.renard@univ-eiffel.fr      |
| Mariam Diallo  | sans compte    | candidate au Master Informatique, passe le test par un lien        | mariam.diallo@gmail.com         |

Identifiants de connexion : prénom.nom, en minuscules et sans accent (ines.benali, karim.haddad,
helene.martin, julien.lefevre, lea.fontaine, sophie.lambert, paul.renard). Mariam n'a pas de
compte.

Sous le nom, la barre latérale dit le type de compte, pas un genre que la plateforme ne connaît
pas : « Compte étudiant », « Compte enseignant », « Compte administrateur », « Compte démo ».

## Les cours

| Cours                            | Sigle | Teinte    | Étudiants | Enseignants | Activités | Pour qui                  |
| -------------------------------- | ----- | --------- | --------- | ----------- | --------- | ------------------------- |
| Algorithmique et programmation 1 | AP1   | lagon     | 302       | 6           | 9         | Karim (responsable), Inès |
| Analyse 1                        | AN1   | olive     | 296       | 4           | 5         | Inès                      |
| Algèbre 1                        | AL1   | framboise | 296       | 3           | 4         | Inès, cours terminé       |
| Programmation web                | PW    | bleuet    | 84        | 2           | 11        | Karim                     |
| Java, L3                         | J3    | ambre     | 41        | 1           | 6         | Karim                     |

Inès voit trois cours (AP1, AN1, AL1). Karim en voit trois (AP1, PW, J3). AP1 compte 308
membres : 302 étudiants et 6 enseignants.

### Les activités d'AP1

| Section   | Activité                          | État le 28 septembre                                    | Exercices | Usage                                   |
| --------- | --------------------------------- | ------------------------------------------------------- | --------- | --------------------------------------- |
| Semaine 5 | TP 5 : fonctions récursives       | ouverte, sans dates (ouverte jusqu'à ce qu'on la ferme) | 8         | entraînement                            |
| Semaine 5 | Examen partiel 2                  | planifiée, lundi 12 octobre de 8 h à 9 h 30             | 8         | notée, une tentative, 1 h 30            |
| Semaine 5 | Challenge : tris                  | ouverte depuis le 15 septembre, sans fermeture          | 5         | challenge                               |
| Semaine 4 | Quiz : complexité des algorithmes | ouverte, du 22 septembre 8 h au 28 septembre 23 h 59    | 6         | entraînement, résultat après validation |
| Semaine 4 | TP 4 : boucles et tableaux        | ouverte, du 22 septembre 8 h au 1er octobre 18 h        | 8         | entraînement                            |
| Semaine 3 | TP 3 : conditions                 | fermée le 21 septembre à 23 h 59, corrigée              | 7         | notée                                   |
| Semaine 3 | Examen partiel 1                  | fermée le 22 septembre, en correction                   | 6         | notée, une tentative                    |
| Semaine 2 | TP 2 : variables et types         | fermée le 14 septembre                                  | 6         | entraînement                            |
| Semaine 1 | TP 1 : premiers pas               | fermée le 7 septembre                                   | 5         | entraînement                            |

Une activité sans dates est ouverte aux étudiants : c'est le comportement de la plateforme
(`calculateActivityOpenState`). L'enseignant le voit écrit « Ouverte, sans dates », en
information neutre pour un entraînement, en attention pour une épreuve notée, avec « Planifier »
à côté. Le 28 septembre à 10 h, Karim ouvre les paramètres de TP 5 et l'enregistre du lundi 5
octobre à 8 h au dimanche 11 octobre à 23 h 59 : tous les écrans du 28 septembre montrent TP 5
avant cet enregistrement (ouverte, sans dates), ceux du 12 octobre le montrent fermé.

Mots des échéances : côté étudiant, « Sans échéance » ; côté enseignant, « Sans fermeture »
quand l'ouverture est fixée et « Ouverte, sans dates » quand rien n'est fixé.

La progression d'un étudiant dans un cours se compte en exercices, partout (barre et
pourcentage) ; le nombre d'activités terminées peut l'accompagner en texte, jamais à sa place.

Inès, le 28 septembre : 34 exercices sur 59 dans AP1, soit 58 %, et 4 activités terminées sur 9
(TP 1, TP 2, TP 3, Examen partiel 1) ; le quiz à 5 exercices sur 6, TP 4 à 3 sur 8, Challenge :
tris à 2 sur 5. Analyse 1 : 40 % ; Algèbre 1 : 100 %. Participation au quiz : 251 sur 302 ont
commencé ; à TP 4 : 187 sur 302.

### Les exercices des activités montrées

Quiz : complexité des algorithmes (6 exercices, aucun en commun avec les examens) :

| N°  | Exercice                       | Inès, le 28 septembre |
| --- | ------------------------------ | --------------------- |
| 1   | Opérations d'une boucle simple | réussi                |
| 2   | Coût d'une somme               | réussi                |
| 3   | Boucles imbriquées             | partiel               |
| 4   | Recherche dans un tableau trié | réussi                |
| 5   | Tri par insertion              | réussi                |
| 6   | Comparer deux algorithmes      | pas commencé          |

Examen partiel 2 (8 exercices) : 1. Complexité d'une boucle, 2. Notation grand O, 3. Complexité
de somme, 4. Recherche dichotomique, 5. Récursivité, 6. Pile et file, 7. Tableaux à deux
dimensions, 8. Fonctions de hachage. Code de reprise : K7Q2XM. Il ne sert pas à commencer : il
rouvre une copie arrêtée (fenêtre ou page quittée), et l'enseignant le donne en salle.

Analyse 1 : Suites numériques, entraînement sans échéance (12 exercices, Inès à 0) ; Contrôle
continu 2, noté, ouvre mercredi 30 septembre à 10 h pour 45 minutes, une tentative. Inès : 2
activités terminées sur 5. Algèbre 1 : 4 activités sur 4, cours terminé.

Programmation web : Projet 1 : formulaire d'inscription, rendu le 26 septembre, 2 copies que
Karim corrige.

### Les groupes d'AP1

TD 1 (38), TD 2 (37), TD 3 (40), TD 4 (41). Les autres étudiants n'ont pas de groupe. Un
cinquième groupe, « Soutien du jeudi » (12 étudiants, créé le 21 septembre, sans période d'accès
ni copie confiée), est celui que Karim supprime dans l'écran Groupes : il en reste quatre.

| Groupe | Étudiants nommés dans les maquettes                                                                                                            |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| TD 1   | Amélie Roux, Hugo Marchand (tiers-temps tous les deux), Farid Benkirane                                                                        |
| TD 2   | Inès Benali, Bastien Morel, Clara Nguyen, David Lemaire, Léo Chevalier, Manon Roussel, Nathan Briand, Sarah Koné, Théo Rivière, Yanis Ferreira |
| TD 3   | Chloé Garnier, Élise Faure                                                                                                                     |
| TD 4   | Marc Aubert, Marceline Duval                                                                                                                   |

Gaëlle Picard a été retirée d'AP1 (écran Membres) ; elle n'apparaît plus ailleurs.

## Les corrections

Examen partiel 1 : 14 copies restent à corriger dans le cours, toutes confiées à Julien
Lefèvre : 12 sur 26 pour le groupe TD 2, 2 sur 2 pour les copies en retard du groupe TD 4.
Le compteur Corrections de Julien vaut donc 14. Celui de Karim vaut 2 (Projet 1, Programmation
web). Sophie ne corrige pas : pas de compteur.

Dans la page du cours, « 14 copies à corriger » parle du cours entier (TD 2 et TD 4). Dans
l'accueil de Karim, « À corriger » ne liste que ce qui lui est confié.

### Le calcul d'une note

C'est celui de la plateforme (`CorrectionService`, `ResourceLabel`) :

- chaque exercice est noté sur 100 ; 100 veut dire réussi ;
- une étiquette du correcteur change la note de l'exercice où elle est posée (« -10 », « +5 ») ;
- la note de la copie est la moyenne des notes des exercices.

Copie corrigée de TP 3 : conditions (Inès, 7 exercices, corrigée par Julien Lefèvre le 28
septembre) :

| Exercice                    | Note automatique | Étiquette             | Note |
| --------------------------- | ---------------- | --------------------- | ---- |
| 1. Signe d'un nombre        | 100              |                       | 100  |
| 2. Année bissextile         | 80               |                       | 80   |
| 3. Maximum de trois         | 95               | Solution élégante, +5 | 100  |
| 4. Tarif selon l'âge        | 100              |                       | 100  |
| 5. Mention au bac           | 60               |                       | 60   |
| 6. Jour de la semaine       | 100              |                       | 100  |
| 7. Équation du second degré | 36               | Nommage peu clair, -2 | 34   |

Note automatique : moyenne 81,6. Note de la copie : (100 + 80 + 100 + 100 + 60 + 100 + 34) / 7 =
82 sur 100.

Examen partiel 2, conclusion d'Inès le 12 octobre à 9 h 04 (note provisoire, avant relecture) :
100, 50, 100, 0, 100, 100, 76, 50, soit 72 sur 100 ; 6 exercices validés et 2 rendus en
brouillon (le 4 et le 7).

Écriture des notes : sur 100, virgule décimale, une décimale seulement quand la note n'est pas
entière (82 ; 81,6 ; 77,5). Une moyenne s'écrit « 71 / 100 », un taux « 64 % ».

Examen partiel 1, copie en cours de correction : exercice 4 (recherche dichotomique), note
automatique 67, étiquettes Boucle infinie -10 et Nommage peu clair -2, note 55.

## Les ressources

Recherche dichotomique : exercice d'Hélène Martin, cercle Algorithmique, statut Prêt, version 4
publiée le 24 septembre, utilisée par 4 activités (Examen partiel 1, Examen partiel 2, TP 4 et
Entraînement : recherche), moyenne 71 / 100 sur 1 204 tentatives.
Parcours en largeur d'un graphe : exercice de Karim, Brouillon.

« Vu récemment » de Karim, une seule liste partout (accueil et Ressources), dans cet ordre :
Recherche dichotomique (exercice, ce matin, Prêt), Parcours en largeur d'un graphe (exercice,
hier, Brouillon), TP 4 : boucles et tableaux (activité, vendredi), Algorithmique (cercle,
vendredi). Un écran en montre les trois premiers.

## Les annonces

| Annonce                             | Publiée le   | Pour          |
| ----------------------------------- | ------------ | ------------- |
| Les corrections détaillées arrivent | 27 septembre | Étudiants     |
| Maintenance le 4 octobre            | 25 septembre | Tout le monde |
| Nouveau : le lecteur d'exercices    | 12 septembre | Étudiants     |
| Rentrée 2026                        | 28 août      | Tout le monde |

La maintenance a lieu le dimanche 4 octobre de 7 h à 9 h. Une annonce de disponibilité du
service passe avant toute autre : le 28 septembre, le bandeau de l'accueil est celui de la
maintenance. « Les corrections détaillées arrivent » reste non lue dans Annonces et dans les
notifications.

## Le test d'entrée

Test d'entrée Master Informatique 2027 : ouvert du 1er au 15 octobre, 1 h 30 d'une traite, une
tentative par exercice, plein écran, 6 exercices entre lesquels on peut revenir, 48 candidats.
Mariam commence le 9 octobre à 14 h 30. Sa connexion tombe de 15 h 12 à 15 h 16 : le temps
continue de courir (c'est le comportement de la plateforme, et une coupure de son côté ne
mettrait pas non plus le chronomètre en pause dans la proposition), et ses réponses ne se
modifient pas pendant la coupure. Elle envoie à 15 h 42 : 1 h 12 comptées sur 1 h 30, il lui
restait 18 minutes. Référence MI27-0418, décision avant le 6 novembre.

| Candidat                                 | État au 9 octobre, 15 h 42                       | Note     |
| ---------------------------------------- | ------------------------------------------------ | -------- |
| Mariam Diallo                            | terminé, 9 octobre à 15 h 42                     | 78 / 100 |
| Lucas Bernard                            | en cours, commencé à 15 h 20                     |          |
| Sofia Rossi                              | invitation envoyée le 1er octobre                |          |
| Yanis Belkacem                           | terminé, 5 octobre à 16 h 12                     | 64 / 100 |
| Clara Vidal                              | invitation non envoyée, compte créé le 9 octobre |          |
| Thomas Girard                            | invitation envoyée le 1er octobre                |          |
| Awa Ndiaye                               | terminé                                          | 71 / 100 |
| Kenji Moreau, Leïla Mansour, Julia Costa | invitation envoyée                               |          |

## Compléments

Faits ajoutés en dessinant les écrans, cohérents avec ce qui précède.

### Personnes et comptes

- Nadia Ferrand est responsable d'Analyse 1, Olivier Lacroix d'Algèbre 1.
- Sarah Koné (TD 2) est 6e du classement de Challenge : tris.
- Marc Tessier est l'étudiant qu'on ajoute à AP1 ; Marc Aubert et Marceline Duval y sont déjà.
- Nora Kessler (nora.kessler@gmail.com) est l'intervenante dont Sophie crée le compte.
- Comptes ajoutés le : Sophie 4 février 2022, Julien 1er septembre 2025, Léa 2 septembre 2025.
- Comptes de démonstration de l'an dernier, désactivés en lot : demo-ap1-2025, demo-j3-2025,
  demo-pw-2025.
- Candidats au test : Mariam Diallo, Lucas Bernard (commencé à 15 h 20), Thomas Girard, Awa
  Ndiaye (71 sur 100), Kenji Moreau, Leïla Mansour, Julia Costa.

### Cours

- Algorithmique et programmation 2 (AP2, menthe) est le cours qu'on crée, encore vide.
- Inès n'a aucun cours archivé ; elle a fait 40 % d'Analyse 1.
- Examen partiel 1 s'est tenu le 22 septembre de 8 h à 9 h 30. Les 2 copies du TD 4 ont été
  rendues en retard le 23 septembre.
- TP 5 : 23 étudiants l'ont commencé. Challenge : tris : 118 participants sur 302, 41 ont tout
  réussi. Le classement ne retient que ceux qui ont fini tous les exercices, dans l'ordre où ils
  ont fini (600, 599, 598 points...) ; Inès, à 2 sur 5, n'y est pas encore.

### Épreuves

- Examen partiel 2, Inès : début à 8 h, exercice 3 validé à 8 h 17, brouillon de l'exercice 4 à
  8 h 46 ; à 8 h 52 elle quitte la fenêtre de l'épreuve et celle-ci s'arrête (exercices 1, 2, 3 et 5
  validés, elle était sur le 6, 0:37:40 restantes) ; elle reprend à 8 h 54 avec le code, valide
  l'exercice 6 à 8 h 56, laisse un brouillon du 7 à 8 h 58, valide le 8 à 9 h 03 et rend sa copie
  à 9 h 04 avec 6 exercices validés et 2 brouillons, rendus tels quels. Le temps a continué de
  s'écouler pendant l'arrêt.
- Examen partiel 1, copie de David Lemaire (TD 2) en correction : 100, 85, 90, 55, 75 et 60, soit
  77,5 sur 100, provisoire.
- Test d'entrée de Mariam : 6 exercices (le 3 est une jointure SQL) ; 2 validés à 15 h 05,
  connexion perdue de 15 h 12 à 15 h 16 (temps compté, réponses figées pendant la coupure), les 6
  validés à 15 h 42 avec 18 minutes d'avance ; 78 sur 100 côté enseignant.

### Ressources et contenus

- Recherche dichotomique a été créée le 12 janvier 2026. Ses 4 activités : Examen partiel 1,
  Examen partiel 2, TP 4 (AP1) et Entraînement : recherche, dans le cours d'un collègue.
- Modèle certifié recommandé : « QCM : recherche séquentielle ou dichotomique ». Autres exercices
  cités : Palindrome récursif, Suite récurrente ; activités : Partiel blanc : récursivité
  (Hélène), Examen partiel 2, session 2025.
- Topic renommé dans l'administration : Graphes devient Théorie des graphes (12 ressources).
- Les quatre annonces sont signées Sophie Lambert. « Rentrée 2025 », ancienne et non publiée, est
  celle qu'on supprime.

### Questions ouvertes

- Durée d'un tiers-temps : aujourd'hui une période d'accès ne porte que des dates, des
  membres, des groupes et des correcteurs (`RestrictionConfig`) ; la durée maximale est un
  réglage de l'activité entière (`settings.duration`, chronomètre `startedAt + duration`). Une
  période plus large ne donne donc pas plus de temps. Les maquettes proposent une durée par
  période ; c'est un changement de modèle.

### Ajouts de la troisième passe

- Analyse 1 compte 40 exercices ; Inès en a fait 16 (40 %), 2 activités terminées sur 5.
- Quiz : complexité des algorithmes, exercice 4 : 198 des 251 qui ont commencé y ont répondu,
  46 justes du premier coup (23 %), 152 non. Inès revoit l'exercice 3, Boucles imbriquées, en
  tentative 2 (tentatives illimitées).
- Lien démo d'AP1 : `3f8a1c27` (à ne pas confondre avec le code d'épreuve K7Q2XM).
- Lots corrigés de Julien : TP 3, TD 2 (37 copies, fini le 28 septembre) ; Examen partiel 1,
  TD 4 (39 copies rendues à l'heure, fini le 26 septembre) ; TP 3, TD 4 (41 copies, fini le 24
  septembre).
- Test d'entrée de Mariam : écran de reconnexion à 15 h 14 ; exercice 6 (question à plusieurs
  réponses sur `f(p, q)`) validé à 15 h 42.
- Identifiant d'Inès : ines.benali.

### Ajouts de la quatrième passe

- Hélène Martin : 2 cours et 38 ressources. La plateforme compte 4 812 comptes actifs.
- Annonce en cours de rédaction par Sophie (écran d'édition) : « Inscriptions pédagogiques du
  second semestre », brouillon, pour les étudiants, non publiée.
- Écriture des dates : relatives dans les échéances proches (« ferme jeudi à 18 h »), absolues
  dans les tableaux et les journaux (« 26 sept. 2026, 9 h 41 ») ; jamais « 26/09/2026 ».
- TP 5 : fonctions récursives est ajouté à la Semaine 5 après le 21 septembre ; ce jour-là, la
  Semaine 5 ne contient que Challenge : tris.- La plateforme compte 4 431 étudiants (parmi les 4 812 comptes actifs).
- Brouillon de Sophie, « Inscriptions pédagogiques du second semestre » : pour les étudiants,
  inscriptions du lundi 2 au vendredi 13 novembre sur l'ENT, bandeau de 14 jours, icône
  `campaign`, non publié.
- Examen partiel 1, TD 2 : Julien a corrigé les 14 premières copies par copie, puis il est passé
  au mode Par exercice pour les 12 dernières : exercices 1 à 3 corrigés partout, exercice 4
  corrigé jusqu'à la copie de David Lemaire (15 sur 26).- Plein écran : la plateforme ne le demande ni ne le surveille aujourd'hui (sécurité :
  `noCopyPaste`, `terminateOnLoseFocus`, `terminateOnLeavePage`) ; « Plein écran obligatoire » est une
  proposition des maquettes.
- États hypothétiques de l'Examen partiel 2 d'Inès : panne de PLaTon depuis 8 h 18, montrée à
  8 h 20 avec 1:09:40 restantes ; code de reprise erroné (K7Q2MX) tapé à 8 h 53, 0:36:40 restantes.
- Test de Mariam : l'écran de reconnexion montre 0:46:00 à 15 h 14.
