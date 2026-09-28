# accueil-enseignant

L'accueil de Karim sert à piloter. En tête, « En cours » : les activités ouvertes de ses cours,
avec l'échéance, la part des étudiants qui ont commencé et la moyenne provisoire ; chaque ligne mène
au suivi de l'activité. Puis « À corriger » : les épreuves dont des copies lui sont assignées, avec
le nombre restant. Puis « À préparer » : les activités planifiées ou encore sans dates, pour qu'une
séance ne commence pas sur une activité fermée.

À droite, ses cours et ses ressources récemment modifiées avec leur statut. Le sélecteur de modèles
d'exercice, qui occupe tout l'accueil actuel, rejoint la création d'exercice.

Le bouton Créer, dans la barre latérale, ouvre un menu qui décrit chaque objet en une ligne :
un enseignant qui découvre PLaTon apprend la différence entre un cours, une activité et un
exercice sans quitter l'écran.

Sans cours, l'accueil déroule les trois gestes qui rendent la plateforme utile : créer un cours,
trouver ou écrire un exercice, l'ajouter comme activité. Le premier est l'action principale.

## Rules

- « En cours » est trié par échéance, la plus proche en premier
- la participation s'écrit en clair (« 187 sur 302 ont commencé ») en plus de la barre
- « À corriger » n'apparaît que si des copies sont assignées à l'enseignant
- une activité à préparer dit ce qui lui manque (« Pas encore de dates », « Ouvre mercredi à 10 h »)
- le menu Créer ne propose Cercle qu'aux administrateurs

spec:
  screens:
    - { id: enseignant, states: [default, empty] }
    - { id: creer, overlay: true, states: [default] }
  edges:
    - { from: enseignant, to: creer, on: create }
    - { from: enseignant, to: activite, on: follow }
    - { from: enseignant, to: corrections, on: correct }
    - { from: enseignant, to: cours, on: open }
    - { from: enseignant, to: ressources, on: open }
    - { from: creer, to: enseignant, on: dismiss }
    - { from: creer, to: cours, on: create }
    - { from: creer, to: activite, on: create }
    - { from: creer, to: creation, on: create }
    - { from: enseignant, to: creation, on: template }
