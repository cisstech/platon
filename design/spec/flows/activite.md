# activite

Ajouter une activité à un cours. L'ajout garde les étapes réelles (section,
activités, fonction et dates) et leur contenu : on choisit une ou plusieurs ressources de type
activité dans une recherche filtrée, puis leur fonction. Entraînement ne règle rien de plus ;
Notée ajoute durée, tentatives, code de déblocage, sécurité et désigne les enseignants du cours
comme correcteurs ; Challenge marque l'activité comme challenge, un choix qui ne se défait pas.
Si aucune activité ne convient, l'enseignant la compose avec des exercices du catalogue, dans
l'ordre voulu ; PLaTon enregistre la ressource activité dans son cercle. Fonction et
configuration sont réunies sur une seule étape, parce que la configuration dépend de
la fonction.

Le suivi (écran suivi du flow cours) montre ce que calcule déjà le tableau de bord d'une activité : qui a
commencé, taux de réussite, note et durée moyennes, et par exercice le taux de réponse, la
réussite du premier coup et les abandons. C'est là que Karim voit où ses étudiants bloquent.

## Rules

- on ne peut ajouter que des ressources de type activité ; la page propose de créer un exercice à
  partir d'un modèle quand la recherche ne trouve rien
- le choix Challenge dit qu'il est définitif avant l'envoi

spec:
  screens:
    - { id: ajouter, states: [default] }
    - { id: ajouter-composer, states: [default] }
    - { id: ajouter-fonction, states: [default] }
  edges:
    - { from: ajouter, to: ajouter-fonction, on: next }
    - { from: ajouter, to: ajouter-composer, on: compose }
    - { from: ajouter-composer, to: ajouter, on: back }
    - { from: ajouter-composer, to: ajouter-fonction, on: next }
    - { from: ajouter, to: creation, on: template }
    - { from: ajouter-fonction, to: ajouter, on: back }
    - { from: ajouter-fonction, to: cours, on: add }
