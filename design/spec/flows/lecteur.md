# lecteur

Le lecteur est l'endroit où Inès travaille. Il n'a pas la couverture : c'est un mode concentré,
plein écran, comme aujourd'hui, avec un seul retour vers le cours. Rien de la navigation ne
doit distraire pendant un examen. C'est la seule surface de l'interface qui porte la
marge de la copie : un filet rouge clair à gauche, où s'inscrivent le numéro de la question et son
résultat, comme les annotations d'un correcteur.

Une activité s'ouvre sur une page d'introduction : le titre, le cours, ce qu'il faut savoir avant
de commencer (nombre d'exercices, échéance, et pour une activité notée, durée, tentatives et règles
de sécurité), puis un seul bouton. Pour une activité notée, ce bouton dit que le chronomètre part
au clic.

L'exercice est une copie : l'énoncé en lecture (16 px, 72 caractères par ligne), la zone de
réponse, puis les actions. Valider est la seule action primaire. Sauvegarder, Aide, Solution et
Recharger sont secondaires et n'apparaissent que si l'activité les autorise. À droite, la liste des
exercices avec leur état et, pour une activité chronométrée, le temps restant.

Valider inscrit le résultat dans la marge (juste, faux, partiel) et affiche le retour sous la
réponse. Un bon résultat est une information verte, pas une fête. Quand l'activité est terminée,
la conclusion résume en langage humain : exercices réussis, note si elle existe, durée, et ce que
l'on peut faire ensuite. Aucun identifiant technique.

Quitter une activité notée en cours demande confirmation et dit ce qui se passe (la tentative
continue de compter, ou se termine). Une erreur du lecteur est une page d'erreur qui nomme le
problème et propose de réessayer ou de revenir au cours, jamais une page blanche.

## Rules

- la marge n'apparaît que sur la copie ; jamais dans la liste, la conclusion ou l'introduction
- Valider est la seule action primaire de la copie ; les autres actions dépendent des réglages de
  l'activité
- le résultat d'une question va dans la marge et le retour sous la réponse, en couleur d'état
  avec une icône et un mot
- une activité notée annonce ses règles avant le début, et le chronomètre est visible en
  permanence
- la conclusion ne montre aucun identifiant technique
- le lecteur vouvoie

spec:
  screens:
    - { id: intro, states: [default] }
    - { id: exercice, states: [default, valide, error] }
    - { id: conclusion, states: [default] }
    - { id: quitter, overlay: true, states: [default] }
  edges:
    - { from: intro, to: exercice, on: start }
    - { from: intro, to: cours, on: back }
    - { from: exercice, to: exercice, on: next }
    - { from: exercice, to: conclusion, on: finish }
    - { from: exercice, to: quitter, on: leave }
    - { from: quitter, to: exercice, on: dismiss }
    - { from: quitter, to: cours, on: leave }
    - { from: conclusion, to: cours, on: back }
    - { from: conclusion, to: accueil-etudiant, on: home }
