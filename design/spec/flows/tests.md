# tests

Un test d'entrée est un cours particulier (`isTest`) dont les membres sont des candidats. Karim
prépare le test, importe ou ajoute les candidats, envoie les invitations et suit qui a terminé.
Mariam reçoit un courriel, ouvre le lien, lit les règles et les conditions, et commence.

La page du test liste les candidats avec leur état (invitation non envoyée, envoyée, en cours,
terminé) et leur note. L'écran du candidat reprend la couverture de la connexion : Mariam ne
connaît pas PLaTon, elle doit comprendre en une page ce qui l'attend, avant de commencer.

## Rules

- les règles du test (durée, plein écran, tentatives, date limite) sont énoncées avant le bouton
- commencer demande d'avoir accepté les conditions
- le candidat sait qu'il peut revenir plus tard avec le même lien, jusqu'à la date limite
- l'état d'un candidat se lit sans ouvrir sa fiche

spec:
  screens:
    - { id: test, states: [default] }
    - { id: candidat, states: [default] }
  edges:
    - { from: test, to: candidat, on: preview }
    - { from: candidat, to: lecteur, on: start }
    - { from: candidat, to: test, on: back }
