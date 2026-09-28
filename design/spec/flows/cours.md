# cours

Le cours est l'unité de travail commune à Inès et à Karim, mais ils n'y cherchent pas la même
chose. Inès veut ses activités, rangées par section, avec son avancement ; Karim veut les mêmes
sections, plus de quoi ajouter, régler, suivre et gérer ses membres.

La liste garde tout ce que la page actuelle permet : recherche sur le nom, Actuels et Archivés,
tri (nom, création, mise à jour) et période de mise à jour, Créer un cours pour l'enseignant, et
pour l'administrateur l'affichage de tous les cours de la plateforme. Chaque cours devient un
classeur : un intercalaire et une couverture à sa teinte, son sigle, son nom, sa description, le
lien vers ses challenges, ses effectifs (enseignants, élèves, activités) et sa date de mise à
jour ; l'avancement de la personne connectée quand elle en a un. Archiver range le cours pour soi
seulement, comme aujourd'hui (archivage de l'appartenance).

La page d'un cours garde ses onglets réels : Vue d'ensemble, Challenges (s'il y en a), Membres,
Groupes et, pour qui peut modifier, Paramètres. L'en-tête porte le nom et la description
modifiables sur place, la date de création et l'auteur, Partager (lien PLaTon ou lien LTI) et
Ajouter une activité.

La vue d'ensemble garde la recherche, le filtre d'état, le choix Sections ou Tableau,
l'export des notes en CSV, l'ajout et les actions de section (renommer, réordonner les
activités, insérer, monter, descendre, supprimer). Chaque activité dit son état, ses dates, son
nombre d'exercices ; pour l'élève son avancement et Commencer, Reprendre ou Voir mes résultats ;
pour l'enseignant Suivre, Paramètres et un menu (Lancer, notes CSV, ouvrir ou éditer la
ressource).

Le suivi d'une activité réunit les deux pages actuelles, Statistiques et Suivi de l'activité, en
trois onglets : Statistiques, Apprenants, Modération (ouverture et fermeture par élève, code de
déblocage). Régler une activité se fait dans le panneau latéral à trois onglets (Accès,
Déroulement, Gestion). La fonction (entraînement, notée, challenge) se choisit à l'ajout (flow
activite) ; `isChallenge` ne se modifie pas ensuite.

## Rules

- un classeur porte la teinte du cours ; la même teinte suit le cours partout
- l'élève ne voit ni les actions d'édition, ni l'onglet Paramètres, ni l'export des notes
- l'onglet Challenges n'apparaît que si le cours a au moins un challenge
- aucun chiffre de cours n'est une moyenne de classe : il n'existe pas de résultats au niveau du
  cours, seulement les effectifs, l'avancement et le temps de la personne connectée
- la fonction d'une activité ne se modifie pas dans le panneau de réglage
- le suivi met en évidence l'exercice où la réussite du premier coup est la plus basse
- supprimer une section qui contient des activités se confirme en nommant ce qui part avec elle

spec:
  screens:
    - { id: mes-cours, states: [default, etudiant, empty] }
    - { id: mes-cours-actions, overlay: true, states: [default] }
    - { id: nouveau, overlay: true, states: [default] }
    - { id: detail, states: [default, etudiant, tableau] }
    - { id: section-actions, overlay: true, states: [default] }
    - { id: activite-actions, overlay: true, states: [default] }
    - { id: partager, overlay: true, states: [default] }
    - { id: challenges, states: [default, etudiant] }
    - { id: membres, states: [default] }
    - { id: membres-ajouter, overlay: true, states: [default] }
    - { id: groupes, states: [default] }
    - { id: reglages, states: [default] }
    - { id: parametres, overlay: true, states: [default, periodes, deroulement, gestion] }
    - { id: suivi, states: [default, apprenants, moderation] }
  edges:
    - { from: mes-cours, to: detail, on: open }
    - { from: mes-cours, to: nouveau, on: create }
    - { from: mes-cours, to: mes-cours-actions, on: more }
    - { from: mes-cours-actions, to: mes-cours, on: dismiss }
    - { from: nouveau, to: mes-cours, on: dismiss }
    - { from: nouveau, to: detail, on: create }
    - { from: detail, to: challenges, on: tab }
    - { from: detail, to: membres, on: tab }
    - { from: detail, to: groupes, on: tab }
    - { from: detail, to: reglages, on: tab }
    - { from: detail, to: partager, on: share }
    - { from: detail, to: section-actions, on: more }
    - { from: detail, to: activite-actions, on: more }
    - { from: detail, to: parametres, on: settings }
    - { from: detail, to: suivi, on: follow }
    - { from: detail, to: activite, on: add }
    - { from: detail, to: lecteur, on: start }
    - { from: detail, to: mes-cours, on: back }
    - { from: partager, to: detail, on: dismiss }
    - { from: section-actions, to: detail, on: dismiss }
    - { from: activite-actions, to: suivi, on: follow }
    - { from: activite-actions, to: ressources, on: open }
    - { from: membres, to: membres-ajouter, on: add }
    - { from: membres-ajouter, to: membres, on: dismiss }
    - { from: parametres, to: detail, on: dismiss }
    - { from: suivi, to: parametres, on: settings }
    - { from: suivi, to: corrections, on: correct }
    - { from: suivi, to: detail, on: back }
