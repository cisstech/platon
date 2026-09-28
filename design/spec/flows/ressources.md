# ressources

Hélène cherche avant d'écrire. La liste des ressources est une recherche avec des filtres visibles
(type, statut, niveau, thème), dont l'état se lit dans des pastilles de filtre. Le résultat dit
combien d'éléments, pour quelle recherche, et comment effacer les filtres. Chaque ligne donne le
cercle, qui l'a créée, où elle est utilisée, sa fraîcheur et son statut.

La page d'un exercice répond d'abord à « est-il fiable et où sert-il » : statut, trois chiffres
d'utilisation (au lieu des onze cartes actuelles), les activités qui l'utilisent, la documentation.
L'action principale est Prévisualiser ; Éditer ouvre l'éditeur (ou le builder pour un exercice
créé à partir d'un modèle).

Mon cercle est un raccourci, pas un résultat dupliqué.

## Rules

- les filtres actifs sont visibles et retirables un par un
- une recherche sans résultat dit quel filtre écarte des résultats et propose de le retirer
- le statut d'une ressource a toujours son icône et son mot
- la page d'un exercice montre où il est utilisé avant ses statistiques détaillées

spec:
  screens:
    - { id: liste, states: [default, empty] }
    - { id: ressource, states: [default] }
  edges:
    - { from: liste, to: ressource, on: open }
    - { from: ressource, to: edition, on: edit }
    - { from: ressource, to: lecteur, on: preview }
    - { from: ressource, to: liste, on: back }
