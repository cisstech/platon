# cours

Le cours est l'unité de travail commune à Inès et à Karim, mais ils n'y cherchent pas la même
chose. Inès veut ses activités, rangées par section, avec l'état de chacune ; Karim veut les mêmes
sections, plus la possibilité d'y ajouter, de régler et de suivre.

La liste des cours est une grille de cartes. Chaque carte porte la teinte du cours (l'intercalaire
du classeur), son avancement pour l'étudiant, ses effectifs pour l'enseignant, et la prochaine
échéance. Les cours archivés vivent dans un onglet, pas dans la liste.

La page d'un cours a un seul en-tête (fil d'Ariane, titre, description, action principale) et des
onglets selon le rôle : Vue d'ensemble et Résultats pour l'étudiant ; Vue d'ensemble, Membres,
Groupes, Résultats, Paramètres pour l'enseignant. La vue d'ensemble liste les sections et leurs
activités. Chaque ligne d'activité dit son état (ouverte, planifiée, fermée, sans dates), son
échéance, et ce que l'on peut en faire : pour Inès, Commencer, Reprendre ou Voir mes résultats ;
pour Karim, Suivre, Programmer, Paramètres. L'étudiant ne voit jamais les effectifs ni les titres
de section par défaut : une section sans nom s'appelle par son numéro.

Créer un cours tient dans un dialogue : un nom, une description, c'est tout ce que le modèle
demande. Régler une activité se fait dans un panneau latéral, sur place, sans quitter la liste :
dates, fonction (entraînement, notée, challenge), et pour une activité notée, durée, tentatives
et sécurité. Ce panneau remplace l'assistant en quatre étapes.

## Rules

- une carte de cours porte la teinte du cours ; la même teinte suit le cours partout
- l'étudiant ne voit pas les effectifs, ni les actions d'édition, ni les titres de section par
  défaut
- l'action principale de la vue d'ensemble enseignant est Ajouter une activité ; celle de la liste
  est Créer un cours
- une activité notée affiche ses règles (durée, tentatives, sécurité) sur sa ligne dès qu'elle
  est réglée
- une section vide dit à l'enseignant comment la remplir, et n'apparaît pas à l'étudiant
- le panneau de réglage se ferme par Annuler, Échap, ou Enregistrer, et Enregistrer reste actif
  (validation à l'envoi)

spec:
  screens:
    - { id: liste, states: [default, empty] }
    - { id: detail, states: [default, etudiant] }
    - { id: nouveau, overlay: true, states: [default] }
    - { id: parametres, overlay: true, states: [default] }
  edges:
    - { from: liste, to: detail, on: open }
    - { from: liste, to: nouveau, on: create }
    - { from: nouveau, to: liste, on: dismiss }
    - { from: nouveau, to: detail, on: create }
    - { from: detail, to: parametres, on: settings }
    - { from: detail, to: activite, on: follow }
    - { from: detail, to: lecteur, on: start }
    - { from: detail, to: liste, on: back }
    - { from: parametres, to: detail, on: dismiss }
