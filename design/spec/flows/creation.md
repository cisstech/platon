# creation

Karim n'écrira pas de PLE. Pour lui, créer un exercice, c'est choisir un modèle, le remplir et
voir tout de suite ce que verront ses étudiants. Hélène, elle, veut l'éditeur complet. Le flow
sert les deux, sans que l'un paie la complexité de l'autre.

Le chemin du modèle part de trois endroits : Créer puis Exercice sur la couverture, le bloc
Partir d'un modèle de l'accueil enseignant, et Créer à partir sur une ressource paramétrable. La
galerie montre d'abord les modèles certifiés (ceux qu'un administrateur a marqués), puis les
modèles paramétrables des cercles de l'enseignant. Chaque carte a un aperçu jouable. Choisir un
modèle crée l'exercice en brouillon dans le cercle personnel et ouvre l'atelier, comme le fait
déjà la sélection de modèles du tableau de bord.

L'atelier est le builder actuel : à gauche les variables du modèle (lues dans `main.plc`), au
centre l'éditeur de la variable choisie (texte, liste, code, booléen, automate, expression…), à
droite l'aperçu étudiant, rechargé à chaque modification. Le premier enregistrement demande un nom
et une description, parce qu'un nom par défaut du type « Exercice du 29/09/2026 » ne se retrouve
pas dans le catalogue. Quitter un exercice jamais enregistré le supprime, après confirmation.

Le chemin de l'éditeur (Écrire en PLE) est un formulaire unique : quoi, où, présentation,
comment. Il remplace l'assistant en six étapes sans changer ce qui est envoyé à l'API.

## Rules

- un enseignant non auteur peut créer un exercice sans voir une ligne de code
- l'aperçu de l'atelier montre toujours l'état courant, ou dit pourquoi il ne peut pas
- un exercice jamais enregistré n'est pas laissé en brouillon orphelin
- Écrire en PLE n'est jamais l'action principale de la galerie

spec:
  screens:
    - { id: modeles, states: [default, empty] }
    - { id: apercu, overlay: true, states: [default] }
    - { id: atelier, states: [default, error] }
    - { id: enregistrer, overlay: true, states: [default] }
    - { id: enregistre, states: [default] }
    - { id: atelier-quitter, overlay: true, states: [default] }
    - { id: ajouter-au-cours, overlay: true, states: [default] }
    - { id: nouvelle, states: [default] }
  edges:
    - { from: modeles, to: apercu, on: preview }
    - { from: modeles, to: atelier, on: pick }
    - { from: modeles, to: nouvelle, on: code }
    - { from: apercu, to: atelier, on: pick }
    - { from: apercu, to: modeles, on: dismiss }
    - { from: atelier, to: enregistrer, on: save }
    - { from: atelier, to: atelier-quitter, on: leave }
    - { from: atelier, to: ajouter-au-cours, on: add }
    - { from: enregistrer, to: enregistre, on: save }
    - { from: enregistrer, to: atelier, on: dismiss }
    - { from: enregistre, to: ajouter-au-cours, on: add }
    - { from: enregistre, to: modeles, on: again }
    - { from: atelier-quitter, to: modeles, on: discard }
    - { from: atelier-quitter, to: atelier, on: dismiss }
    - { from: ajouter-au-cours, to: cours, on: add }
    - { from: nouvelle, to: ressources, on: dismiss }
