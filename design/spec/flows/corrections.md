# corrections

Julien corrige par lots, souvent le soir. Il veut savoir ce qui l'attend, reprendre là où il
s'était arrêté, et corriger sans quitter le clavier.

La file des corrections range les copies assignées par épreuve, avec ce qui reste. La copie de
correction montre à gauche la liste des étudiants de l'épreuve (faites, en cours, à faire), au
centre la copie de l'étudiant avec sa marge (le résultat des tests automatiques s'y inscrit comme
pour l'étudiant), à droite la note : note automatique, étiquettes de correction qui l'ajustent
(chaque étiquette a un nom, une couleur et une variation de note dans le modèle), commentaire. Les
étiquettes ont un raccourci chiffré ; `J` et `K` passent d'une copie à l'autre.

## Rules

- la note affichée dit toujours d'où elle vient : note automatique, puis la somme des étiquettes
- une étiquette se pose et se retire au clavier (1 à 9)
- valider une copie passe à la suivante non corrigée
- sans copie assignée, l'écran dit comment des copies arrivent, sans zone blanche

spec:
  screens:
    - { id: file, states: [default, empty] }
    - { id: copie, states: [default] }
  edges:
    - { from: file, to: copie, on: open }
    - { from: copie, to: copie, on: next }
    - { from: copie, to: file, on: back }
