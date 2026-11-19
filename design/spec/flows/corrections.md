# corrections

Julien Lefèvre, doctorant et chargé de TD d'AP1, corrige par lots, souvent le soir. Il veut savoir
ce qui l'attend, reprendre là où il s'était arrêté, et corriger sans quitter le clavier.

La file des corrections range les copies qui lui sont confiées par lot : une épreuve et un groupe,
avec ce qui reste. Le 28 septembre, deux lots de l'Examen partiel 1 : le groupe TD 2 (12 copies à
corriger, 14 corrigées sur 26) et les copies en retard du groupe TD 4 (2 à corriger sur 2), soit
les 14 du compteur. Chaque lot est une pile de copies dont l'épaisseur suit ce qui reste : trois
feuilles à partir de dix copies, deux de trois à neuf, une pour deux copies ou moins. La ligne d'un
lot dit d'abord ce qui reste (« 12 copies à corriger ») ; sa barre montre ce qui est fait, et son
libellé le dit (« 14 copies corrigées sur 26 »). La file se filtre par groupe et se trie (plus
anciennes d'abord, plus de copies restantes, par cours), avec un libellé visible sur chaque choix.

L'onglet Terminées range les lots que Julien a finis, du plus récent au plus ancien : TP 3 :
conditions pour le groupe TD 2 (37 copies, terminé le 28 septembre), l'Examen partiel 1 du groupe
TD 4 (39 copies rendues à l'heure, le 26 septembre) et TP 3 pour le groupe TD 4 (41 copies, le 24
septembre). Un lot terminé est posé à plat, sans feuilles derrière lui ; « Revoir les copies »
rouvre la copie de correction sur ce lot.

La copie de correction montre à gauche les copies du lot (corrigées, en cours, à corriger), triées
par prénom, avec une recherche « Aller à un étudiant » et un repère qui dit combien de copies
corrigées sont au-dessus ; au centre la copie de l'étudiant avec sa marge (le résultat des tests
automatiques s'y inscrit comme pour l'étudiant) ; à droite la note : note automatique, étiquettes
de correction qui l'ajustent (chaque étiquette a un nom, une couleur et une variation de note dans
le modèle), commentaire, puis la note de la copie.

Une copie contient tous les exercices de l'épreuve. Au-dessus de la copie, « Exercice 4 sur 6 »
avec précédent, suivant et une pastille par exercice qui dit son état (corrigé, en cours, à
corriger) et, une fois l'exercice corrigé, sa note. La copie s'ouvre sur le titre de l'exercice,
puis son énoncé. La marge se lit comme celle de la copie corrigée que recevra l'étudiant : le
numéro, l'état des tests et la note finale de l'exercice, étiquettes comprises (55) ; sous la
réponse, la ligne de note dit son calcul (« 67 aux tests, -10 pour l'étiquette Boucle infinie, -2
pour l'étiquette Nommage peu clair, soit 55 / 100 »). La note du panneau de droite est celle de
l'exercice affiché et détaille le même calcul ; la note de la copie, provisoire tant qu'un exercice
n'est pas corrigé, est la moyenne des notes des exercices, ceux qui restent à corriger comptant
leur note automatique.

L'écran tient quatre niveaux de titre, chacun à son pas : le titre de la page (title, 22 px), le
titre de l'exercice (heading, 17 px), le titre des panneaux Copies et Note (subheading, 15 px), et
leurs rubriques Étiquettes et Commentaire (caption, 12 px).

Deux façons de corriger, au choix, conservées d'une visite à l'autre : **Par copie** (tous les
exercices d'une copie, puis la suivante) et **Par exercice** (le même exercice sur toutes les
copies, puis l'exercice suivant). Le choix décide de ce que font `J`, `K` et Valider :

| Geste                   | Par copie                                           | Par exercice                                |
| ----------------------- | --------------------------------------------------- | ------------------------------------------- |
| Valider                 | exercice suivant non corrigé de la copie, puis copie suivante | même exercice de la copie suivante non corrigée |
| `J`, `K`                | copie suivante, précédente, sur son premier exercice non corrigé | copie suivante, précédente, sur le même exercice |
| `←`, `→`                | exercice précédent, suivant de la copie             | exercice précédent, suivant de la copie     |

La progression suit le mode. Par copie, la liste des copies dit l'état de chaque copie et son
compteur compte les copies corrigées. Par exercice, elle dit l'état de l'exercice affiché sur
chaque copie, son compteur compte les copies où cet exercice est corrigé, et une ligne rappelle les
exercices déjà corrigés sur tout le lot. Le 28 septembre, Julien a déjà corrigé les 14 premières
copies du groupe TD 2 une par une, puis il est passé à Par exercice pour les 12 qui restaient : les
exercices 1 à 3 sont corrigés sur les 26 copies, l'exercice 4 l'est jusqu'à David Lemaire (copie
15), sur qui Julien travaille ; les pastilles de la copie de David disent la même chose (1 à 3
corrigés, 4 en cours, 5 et 6 à corriger). Une copie compte comme corrigée quand tous ses exercices
le sont : la file dit toujours « 12 copies à corriger ».

Les touches suivent les conventions de Gmail et de vim. Les étiquettes ont un raccourci chiffré (1 à
9), `A` accepte la note automatique, `C` place le curseur dans le commentaire, `Ctrl` + `Entrée`
valide. Une légende compacte rappelle en tête d'écran les touches de navigation, du commentaire et
de la validation ; `A` et 1 à 9 sont inscrits sur leurs boutons.

Quand tous les tests d'un exercice passent, « Accepter la note automatique » valide l'exercice à
sa note automatique, sans étiquette, et passe à la suite. Sur un gros lot, c'est le geste qui fait
gagner le plus de temps. Quand un test échoue, le bouton reste visible, inactif, et dit pourquoi.

Le commentaire s'inscrit sous la réponse, à l'encre rouge, au fil de la frappe : le correcteur lit
ce que lira l'étudiant. Un compliment s'écrit à l'encre verte.

Quand Julien valide le dernier exercice de la dernière copie d'un lot, la file l'accueille sur un
court moment de fin : le lot corrigé, ce que voient les étudiants, et le lot suivant s'il y en a
un. Aujourd'hui, la plateforme prévient chaque étudiant dès que tous les exercices de sa copie ont
une correction : sa note est recalculée et une notification lui annonce sa copie corrigée. Il n'y
a pas d'action de publication, ni pour le correcteur, ni pour le responsable d'UE.

## Rules

- la note affichée dit toujours d'où elle vient : note automatique, puis chaque étiquette avec sa
  variation ; la note de la copie dit qu'elle est la moyenne des exercices et qu'elle est
  provisoire tant qu'un exercice reste à corriger
- une étiquette se pose et se retire au clavier (1 à 9)
- le mode de correction (Par copie, Par exercice) se choisit en tête de la copie et se conserve
  d'une visite à l'autre ; `J`, `K` et Valider le suivent, `←` et `→` changent d'exercice dans
  les deux modes ; aucun de ces raccourcis ne s'active pendant la saisie du commentaire, sauf
  `Ctrl` + `Entrée` et `Échap`
- le bouton Valider nomme sa destination (« Valider et passer à l'exercice 5 » par copie,
  « Valider et passer à la copie suivante » par exercice)
- « Accepter la note automatique » (`A`) n'agit que si tous les tests de l'exercice passent ;
  sinon il est inactif et dit pourquoi
- une pastille d'exercice montre son numéro, son état et, une fois l'exercice corrigé, sa note ;
  son nom accessible est complet : numéro, titre, état et note
- un même état a la même icône et la même couleur partout : corrigé `done_all` en graphite (le
  vert dit « réussi » à l'étudiant, il ne dit pas « corrigé »), en cours `pending`, à corriger un
  cercle vide ; un résultat partiel est `contrast` en attention, dans la marge comme dans le retour
  des tests, avec le mot « Partiel »
- la marge porte le numéro de l'exercice, l'état de ses tests et sa note finale, étiquettes
  comprises, comme la copie corrigée de l'étudiant ; la ligne de note sous la réponse détaille la
  note des tests et chaque étiquette
- le titre de la page, le titre de l'exercice, les titres des panneaux et leurs rubriques ont
  chacun leur pas dans l'échelle (22, 17, 15 et 12 px)
- un compliment (étiquette positive, mot du correcteur) s'écrit à l'encre verte, une remarque à
  l'encre rouge
- la liste des copies se cherche par nom (« Aller à un étudiant ») et dit combien de copies sont
  au-dessus et en dessous, avec leur état
- la progression suit le mode : Par copie, la liste et son compteur disent l'état des copies ; Par
  exercice, l'état de l'exercice affiché sur chaque copie (« exercice 4 : 14 sur 26 »), avec les
  exercices déjà corrigés sur tout le lot ; les pastilles de la copie ouverte disent la même chose
- une copie est corrigée quand tous ses exercices le sont ; la file compte les copies
- un lot de copies est une pile dont l'épaisseur suit les copies qui restent : trois feuilles à
  partir de dix, deux de trois à neuf, une pour deux ou moins ; un lot terminé est posé à plat
- la ligne d'un lot commence par ce qui reste à corriger ; sa barre montre la part corrigée et son
  libellé dit la même chose (« 14 copies corrigées sur 26 »)
- l'onglet Terminées liste les lots finis, du plus récent au plus ancien, avec la date de fin, le
  nombre de copies corrigées (`done_all`) et un lien « Revoir les copies »
- la file se filtre par groupe et se trie ; chaque choix a un libellé visible ; le filtre et le
  tri sont conservés d'une visite à l'autre
- la file ne montre que les lots confiés à la personne connectée ; le compteur de la navigation
  reprend le nombre de copies à corriger et disparaît à zéro
- sans copie assignée, l'écran dit comment des copies arrivent, sans zone blanche
- la fin d'un lot dit combien de copies sont corrigées, ce que voient les étudiants, et propose le
  lot suivant comme seule action principale

spec:
  screens:
    - { id: file, states: [default, empty, termine, terminees] }
    - { id: copie, states: [default] }
  edges:
    - { from: file, to: copie, on: open }
    - { from: file, to: file, on: tab }
    - { from: copie, to: copie, on: next }
    - { from: copie, to: file, on: back }
    - { from: copie, to: file, on: finish }
