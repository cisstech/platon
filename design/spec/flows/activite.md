# activite

Ajouter une activité à un cours. Les écrans sont ceux du lundi 21 septembre à 14 h : Karim ajoute
Examen partiel 2 à AP1, dans la section Semaine 5, qui ne contient alors que Challenge : tris.
L'ajout garde les étapes réelles (section,
activités, fonction et dates) et leur contenu : on choisit une ou plusieurs ressources de type
activité dans une recherche filtrée, puis leur fonction, que l'écran nomme en clair : l'étape
s'appelle Usage et dates et pose la question « À quoi sert cette activité ? », chaque option disant
à quoi elle sert (s'exercer, évaluer, se mesurer) et montrant l'icône que portera l'activité dans
le cours : sa forme pour un entraînement (`quiz`, `code` ou `functions`), `history_edu` pour une
épreuve notée, `emoji_events` pour un challenge. L'étape nomme l'activité qu'elle règle, sous le titre.
Entraînement ne règle rien de plus ;
Notée rend les deux dates obligatoires (sans dates, l'épreuve serait ouverte dès son ajout), ajoute
la durée et les tentatives, et désigne les enseignants du cours comme correcteurs. L'étape garde en
vue l'usage, les dates et la durée ; la sécurité est repliée sous « Sécurité de l'épreuve », dont
une ligne dit les réglages actifs avec les mots de la page d'entrée de l'épreuve (« Plein écran
obligatoire, arrêt si l'étudiant quitte la page ou la fenêtre ; code de reprise créé ») et que
Régler déplie sur place. Dépliée, elle a un interrupteur par règle, chacun au verbe arrêter
(« Arrêter l'épreuve si l'étudiant quitte la page »), et le code de reprise, masqué, avec Afficher,
Copier et Nouveau code, comme dans le suivi du cours : il rouvre une épreuve arrêtée tant que son
temps n'est pas écoulé, et ne sert pas à commencer. Challenge marque l'activité comme challenge, un
choix qui ne se défait pas.
Si aucune activité ne convient, l'enseignant la compose avec des exercices du catalogue, dans
l'ordre voulu, à la souris ou au clavier ; PLaTon enregistre la ressource activité dans son cercle. Fonction et
configuration sont réunies sur une seule étape, parce que la configuration dépend de
la fonction.

Le suivi (écran suivi du flow cours) montre ce que calcule déjà le tableau de bord d'une activité : qui a
commencé, taux de réussite, note et durée moyennes, et par exercice le taux de réponse, la
réussite du premier coup et les abandons. C'est là que Karim voit où ses étudiants bloquent.

## Rules

- on ne peut ajouter que des ressources de type activité ; la page propose de créer un exercice à
  partir d'un modèle quand la recherche ne trouve rien
- le choix Challenge dit qu'il est définitif avant l'envoi
- la fonction se choisit par une question en clair, jamais par le mot « Fonction »
- l'ordre des exercices d'une activité composée se change à la souris et au clavier (poignées,
  indice clavier)
- la barre de sélection flotte sur la couleur de la couverture, avec son action principale
- chaque usage montre l'icône que portera l'activité dans le cours, à la teinte du cours
- l'étape Usage et dates nomme l'activité qu'elle règle
- chaque champ a un libellé lié ; la recherche a un libellé lu par les lecteurs d'écran
- une épreuve notée a une ouverture et une fermeture, obligatoires ; sans elles, la page dit
  pourquoi
- le code de reprise s'affiche masqué et dit à quoi il sert : rouvrir une épreuve arrêtée tant que
  son temps n'est pas écoulé ; Afficher le révèle, Copier et Nouveau code sont dessous
- ce que la page d'entrée d'une épreuve annonce (plein écran, arrêt si l'on quitte) se règle ici,
  par un interrupteur chacun, dans « Sécurité de l'épreuve », repliée par défaut ; repliée, une
  ligne dit les réglages actifs, et Régler la déplie
- un interrupteur qui arrête l'épreuve commence par « Arrêter l'épreuve si… », jamais par
  « Terminer »
- l'étape Usage et dates garde en vue l'usage, les dates et la durée ; le reste se déplie
- les écrans montrent le cours tel qu'il est le lundi 21 septembre à 14 h : Examen partiel 2 n'y
  est pas encore, Semaine 5 ne contient que Challenge : tris

spec:
  screens:
    - { id: ajouter, states: [default] }
    - { id: ajouter-composer, states: [default] }
    - { id: ajouter-fonction, states: [default, securite] }
  edges:
    - { from: ajouter, to: ajouter-fonction, on: next }
    - { from: ajouter, to: ajouter-composer, on: compose }
    - { from: ajouter-composer, to: ajouter, on: back }
    - { from: ajouter-composer, to: ajouter-fonction, on: next }
    - { from: ajouter, to: creation, on: template }
    - { from: ajouter-fonction, to: ajouter, on: back }
    - { from: ajouter-fonction, to: cours, on: add }
