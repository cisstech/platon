# PLaTon

Plateforme d'apprentissage et d'enseignement en ligne de l'Université Gustave Eiffel. Les
enseignants y écrivent des exercices auto-évalués, les rassemblent en activités et les proposent
dans leurs cours ; les étudiants les font et reçoivent un retour immédiat ; des correcteurs
annotent les copies des épreuves notées ; des candidats y passent des tests d'entrée.

La navigation dépend du rôle. Le menu déclaré ci-dessous est celui d'un enseignant ; l'étudiant
ne voit que Accueil, Cours et, s'il a des copies à corriger, Corrections ; l'administrateur voit en
plus Administration.

## Rules

Critères d'acceptation communs à tous les flows.

- chaque écran est atteignable depuis un point d'entrée
- une surcouche a toujours une sortie, et `Échap` la ferme
- un écran a une seule action principale, libellée, placée à droite du titre ou en tête de sa zone
- une erreur n'est jamais présentée comme un contenu vide ; un chargement affiche un message au
  bout de 10 s et devient une erreur au bout de 30 s
- une couleur d'état est toujours accompagnée d'un mot ou d'une icône
- une suppression se confirme : en place pour un élément de liste, par un dialogue qui nomme
  l'objet pour un cours, un cercle ou une activité notée
- la navigation suit le rôle : l'étudiant ne voit ni Ressources, ni Tests d'entrée, ni
  Administration
- les échéances proches sont relatives (« ferme jeudi à 18 h »), les dates des tableaux absolues
- les notes sont au format français (virgule décimale) et sur 100, comme dans la plateforme
- l'interface vouvoie, partout
- pas de tiret cadratin ni demi-cadratin dans les textes

spec:
  nav:
    - { flow: accueil-enseignant, label: Accueil, icon: home }
    - { flow: cours, label: Cours, icon: school }
    - { flow: corrections, label: Corrections, icon: rate_review }
    - { flow: ressources, label: Ressources, icon: folder_open }
    - { flow: tests, label: Tests d'entrée, icon: fact_check }
    - { flow: administration, label: Administration, icon: shield_person }
  flows:
    - connexion
    - accueil-etudiant
    - accueil-enseignant
    - cours
    - activite
    - lecteur
    - corrections
    - ressources
    - creation
    - tests
    - administration
    - compte
