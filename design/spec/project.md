# PLaTon

Plateforme d'apprentissage et d'enseignement en ligne de l'Université Gustave Eiffel. Les
enseignants y écrivent des exercices auto-évalués, les rassemblent en activités et les proposent
dans leurs cours ; les étudiants les font et reçoivent un retour immédiat ; des correcteurs
annotent les copies des épreuves notées ; des candidats y passent des tests d'entrée.

La navigation dépend du rôle et reprend celle d'aujourd'hui. Tout le monde voit Accueil,
Annonces, Cours et Corrections ; l'enseignant voit en plus Ressources (l'« Espace de travail »
actuel), Tests d'entrée et Documentation ; l'administrateur voit en plus Administration. Mon
compte, Mon cercle, le thème et la déconnexion vivent dans le menu du profil.

## Rules

Critères d'acceptation communs à tous les flows.

- chaque écran est atteignable depuis un point d'entrée
- une surcouche a toujours une sortie, et `Échap` la ferme
- un écran a une seule action principale, libellée, placée à droite du titre ou en tête de sa zone
- une erreur n'est jamais présentée comme un contenu vide ; un chargement affiche un message au
  bout de 10 s et devient une erreur au bout de 30 s
- une couleur d'état est toujours accompagnée d'un mot ou d'une icône, un chiffre mis en couleur aussi
- une suppression se confirme : en place pour un élément de liste, avec une annulation possible
  quelques secondes ; par un dialogue qui nomme l'objet et ce qui part avec lui pour un cours, une
  section, un cercle, un groupe de la plateforme, une activité notée ou un compte
- un changement de rôle ou de droits se confirme et nomme la personne
- ce qui se réordonne à la souris se réordonne aussi au clavier
- une notification qui porte une action reste jusqu'à ce qu'on la ferme
- chaque écran a un titre de niveau 1 et un lien d'évitement vers son contenu ; un champ de
  recherche a un libellé, visible ou lu par les lecteurs d'écran
- le temps d'une épreuve court depuis son début, quoi qu'il arrive : c'est le comportement de la
  plateforme (`isTimeouted`, `startedAt + duration`) et c'est ce que les écrans disent à
  l'étudiant. Proposition, changement de modèle à valider : une panne de PLaTon détectée par le
  serveur met le chronomètre en pause ; une coupure de la connexion de l'étudiant ne le met
  jamais en pause
- hors connexion, une réponse ne se modifie plus : elle redevient modifiable avec la connexion
- quitter une épreuve notée, par n'importe quel chemin (fermer ou recharger la page, changer
  d'onglet, de fenêtre ou d'application ; quitter le plein écran, quand il sera exigé : le plein
  écran obligatoire est une proposition, la plateforme ne le demande pas aujourd'hui), l'arrête ; le code de reprise que donne l'enseignant la rouvre tant que
  le temps n'est pas écoulé. Seul « Rendre ma copie » la termine. Une épreuve notée n'a ni flèche
  de retour ni croix : le verbe est « arrêter », partout
- une épreuve se rend : « Rendre ma copie » dit ce qui reste non validé avant de confirmer
- sous le nom d'une personne, le type de compte (« Compte étudiant »), jamais un genre que la
  plateforme ne connaît pas
- l'étudiant et le candidat ont tout leur parcours sur téléphone ; les écrans des enseignants,
  des correcteurs et de l'administration sont dessinés pour le bureau
- les maquettes puisent leurs données dans `docs/09-donnees.md` : mêmes personnes, cours, dates
  et notes partout
- la navigation suit le rôle : l'étudiant ne voit ni Ressources, ni Tests d'entrée, ni
  Administration
- les échéances proches sont relatives (« ferme jeudi à 18 h »), les dates des tableaux absolues
- les notes sont au format français (virgule décimale) et sur 100, comme dans la plateforme
- l'interface vouvoie, partout
- pas de tiret cadratin ni demi-cadratin dans les textes

spec:
  nav:
    - { flow: accueil-enseignant, label: Accueil, icon: home }
    - { flow: annonces, label: Annonces, icon: campaign }
    - { flow: cours, label: Cours, icon: school }
    - { flow: corrections, label: Corrections, icon: rate_review }
    - { flow: ressources, label: Ressources, icon: folder_open }
    - { flow: tests, label: Tests d'entrée, icon: fact_check }
    - { flow: administration, label: Administration, icon: shield_person }
  flows:
    - connexion
    - accueil-etudiant
    - accueil-enseignant
    - annonces
    - cours
    - activite
    - lecteur
    - corrections
    - ressources
    - creation
    - tests
    - administration
    - compte
