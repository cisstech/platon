# ressources

Hélène cherche avant d'écrire, Karim cherche avant de créer. Le catalogue garde tout ce que la
page actuelle permet : recherche avec suggestions, type (exercices, activités, cercles), tri
(pertinence, nom, création, mise à jour), et un panneau de filtres avec statut, modèles à
paramétrer, cercles, auteur, topics présents et absents, niveaux et période de mise à jour. Les
filtres actifs sont des pastilles retirables une par une. L'arbre des cercles s'ouvre depuis
l'en-tête et mène à la page d'un cercle.

Chaque ligne garde les informations qui aident à choisir : statut (icône et mot), type, badge
Modèle pour un exercice paramétrable, description, niveaux et topics cliquables (ils ajoutent le
filtre), note moyenne et nombre de tentatives, nombre d'activités qui l'utilisent (qui ouvre le
listing), date de mise à jour. Les actions de la ligne (Prévisualiser, Éditer ou Paramétrer, et un
menu avec Dupliquer et Voir les activités) apparaissent au survol et au focus clavier.

Mon espace (le cercle personnel) et Vu récemment restent en colonne de droite, comme aujourd'hui.

La page d'un exercice répond d'abord à « est-il fiable et où sert-il » : statut, les trois
chiffres que calcule déjà le tableau de bord d'une ressource (note moyenne, réussite du premier
coup, durée moyenne), les activités qui l'utilisent (dépendances), la documentation, les
derniers événements (statut, membres, versions).

## Rules

- les filtres actifs sont visibles et retirables un par un
- une recherche sans résultat dit quel filtre écarte des résultats et propose de le retirer
- le statut d'une ressource a toujours son icône et son mot
- les actions d'une ligne sont accessibles au clavier, pas seulement au survol
- un exercice paramétrable (modèle) s'ouvre dans l'atelier, les autres dans l'éditeur

spec:
  screens:
    - { id: catalogue, states: [default, empty] }
    - { id: catalogue-actions, overlay: true, states: [default] }
    - { id: filtres, overlay: true, states: [default] }
    - { id: cercles, overlay: true, states: [default] }
    - { id: ressource, states: [default] }
  edges:
    - { from: catalogue, to: ressource, on: open }
    - { from: catalogue, to: filtres, on: filter }
    - { from: catalogue, to: cercles, on: browse }
    - { from: catalogue, to: catalogue-actions, on: more }
    - { from: catalogue, to: creation, on: template }
    - { from: filtres, to: catalogue, on: apply }
    - { from: cercles, to: catalogue, on: dismiss }
    - { from: catalogue-actions, to: catalogue, on: dismiss }
    - { from: ressource, to: catalogue, on: back }
