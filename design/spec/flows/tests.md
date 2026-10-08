# tests

Un test d'entrée est un cours particulier (`isTest`) dont les membres sont des candidats. Karim
prépare le test, importe ou ajoute les candidats, envoie les invitations et suit qui a terminé.
Mariam reçoit un courriel, ouvre le lien, lit les règles et les conditions, vérifie son navigateur
et commence.

La page du test liste les candidats avec leur état (invitation non envoyée, invitation envoyée, en
cours, terminé), la date qui va avec (« compte créé le 9 octobre », « invitation envoyée le 1er
octobre », « commencé à 15 h 20 »), et leur note. « Terminé » se lit au cadenas, en neutre : le test
est scellé, ce n'est pas une réussite. Les filtres portent exactement les mêmes mots
que les étiquettes des lignes, avec leur nombre, et le filtre actif correspond à la liste affichée.
L'en-tête porte une seule action principale, envoyer les invitations en attente ; ajouter ou
importer des candidats passe par le menu au-dessus de la liste, exporter les résultats par le pied
du tableau. Chaque ligne se coche : filtrer « Invitation envoyée » puis tout cocher fait apparaître
la barre de sélection, qui propose de relancer d'un coup les candidats qui n'ont pas commencé.

L'écran du candidat reprend la couverture de la connexion : Mariam ne connaît pas PLaTon, elle doit
comprendre en une page ce qui l'attend, avant de commencer. Sur la couverture est posée la page de
garde de sa copie, les consignes : une feuille claire avec la marge rouge, son nom dans le coin, et
quatre consignes numérotées dans la marge, une par ligne (6 exercices entre lesquels on peut
revenir, en 1 h 30 d'une traite, un temps qui court même si la connexion tombe ; le plein écran ;
une tentative par exercice ; la date limite). Elles disent la règle actuelle telle qu'elle est,
avec le verbe de tout PLaTon : quitter la page ou changer de fenêtre arrête le test, et la candidate
ne peut pas le reprendre par elle-même. Sur la page, une vérification du navigateur lui évite une surprise : la connexion est
vérifiée à son arrivée, et un bouton lui fait essayer le plein écran, que le navigateur n'accorde
qu'après un clic. Si le navigateur le refuse (état plein-ecran), la ligne passe en attention, dit
quoi faire (l'autoriser pour ce site, ou un autre navigateur sur ordinateur) et propose de
réessayer ; Commencer n'est pas bloqué. Sur téléphone, la carte devient « Préparer mon téléphone »
et ajoute un conseil : activer Ne pas déranger, puisqu'un appel qui fait changer d'application
arrête le test, et garder le Wi-Fi en mode avion. Sur un iPhone (état plein-ecran du téléphone),
Safari n'accorde pas le plein écran à une page : la ligne le dit dès l'arrivée, en attention, sans
bouton pour réessayer puisque rien n'y changerait ; elle dit que l'on peut commencer sans, que
quitter la page ou changer d'application arrête toujours le test, et conseille un ordinateur avec
le même lien. La case des conditions est décochée à l'arrivée
et Commencer reste inactif tant qu'elle ne l'est pas. Sur téléphone, la case et le bouton restent
en bas de l'écran, sous le pouce.

Questions ouvertes. Sur iPhone, Safari n'accorde pas le plein écran à une page : test permis
sans plein écran sur ces téléphones, ou ordinateur exigé et annoncé dans l'invitation, à trancher
avec l'équipe pédagogique ; les maquettes dessinent la première réponse, la même que pour un
étudiant en salle (lecteur, intro, état ios), et le disent. Le plein écran obligatoire est un
réglage des maquettes : le lecteur d'aujourd'hui arrête le test quand la page perd le focus ou
devient cachée (`terminateOnLoseFocus`, `terminateOnLeavePage`, activés par défaut pour un test), pas
quand on quitte le plein écran. Enfin, un candidat arrêté peut-il recevoir le code de reprise ? La
plateforme le permet (le test est une activité notée, avec son code, et `openSessionWithCode` ne
distingue pas un test), mais personne n'est dans la salle pour le donner : par la scolarité, sur
demande, ou jamais. En attendant, les consignes disent seulement qu'on ne le reprend pas par
soi-même.

Pendant le test, Mariam est dans le lecteur (`exercice`, état candidat) : le nom du test en tête,
son chronomètre, « Rendre mon test » toujours à portée. Le 9 octobre, elle commence à 14 h 30, sa
connexion tombe de 15 h 12 à 15 h 16 (le temps continue de s'écouler, sa réponse reste à l'écran
sans pouvoir être modifiée, et « Rendre mon test » attend la connexion), et elle rend à 15 h 42 :
1 h 12 comptées sur 1 h 30, il lui restait 18 minutes. Le temps d'un test court depuis son début,
quoi qu'il arrive : c'est la règle de la plateforme et du lecteur, et la proposition de pause sur
panne de PLaTon ne changerait rien à une coupure de son côté. La confirmation de rendu (`rendre`,
état candidat) mène ici, à la page d'envoi ; la fin du temps aussi, le test partant tel quel.

Quand Mariam termine, son test ne mène pas à la conclusion du lecteur : elle n'a ni cours ni
accueil. Elle arrive sur une page d'envoi, sur la même couverture, qui confirme que le test est
envoyé et quand, la durée comptée (1 h 12 sur 1 h 30, coupure comprise), dit ce qui se passe
ensuite (qui relit le test, quand et comment elle aura la décision), qu'elle peut fermer la page,
et lui donne une référence à conserver. Un accusé de
réception part en même temps par courriel. Cette page ne propose aucun retour vers un cours ou un
accueil.

## Rules

- les règles du test (nombre d'exercices et liberté d'aller de l'un à l'autre, durée et temps
  qui court même si la connexion tombe, plein écran et ce qui arrête le test, tentatives, date
  limite) sont énoncées avant le bouton, telles qu'elles s'appliquent aujourd'hui, comme les
  consignes numérotées de la page de garde de la copie, sur la couverture
- le verbe d'une sortie est « arrêter » ; les consignes ne promettent pas de reprise au candidat
  tant que personne n'est désigné pour lui donner le code
- avant de commencer, le candidat peut vérifier son navigateur : la connexion d'office, le plein
  écran par un bouton ; une vérification qui échoue dit quoi faire, en attention avec son mot, et
  propose de réessayer, sans bloquer le bouton ; une vérification réussie est neutre
- sur téléphone, un conseil dit d'activer Ne pas déranger avant de commencer ; un téléphone qui
  n'accorde pas le plein écran (Safari sur iPhone) le dit dès l'arrivée, en attention avec son mot,
  dit ce que cela change et conseille un ordinateur, sans bloquer Commencer
- commencer demande d'avoir accepté les conditions : la case est décochée par défaut et le bouton
  inactif tant qu'elle ne l'est pas
- le candidat sait qu'il peut revenir plus tard avec le même lien, jusqu'à la date limite
- l'état d'un candidat se lit sans ouvrir sa fiche ; « en cours » et « terminé » sont neutres, le
  bleu repère reste à ce qui est planifié ; la date qui l'accompagne ne prête aucun genre au
  candidat (« compte créé le 9 octobre »)
- les filtres et les étiquettes des lignes emploient les mêmes mots, et le filtre actif correspond
  à la liste affichée
- une action groupée nomme ce qu'elle fait et combien de candidats elle touche ; elle ne relance
  que ceux qui n'ont pas commencé
- rendre un test passe par la confirmation du lecteur, puis mène à la confirmation d'envoi : quand,
  la durée comptée depuis le début (une coupure y est comprise), ce qui suit, une référence, et
  aucun lien vers un cours ou un accueil

spec:
  screens:
    - { id: test, states: [default, selection] }
    - { id: candidat, states: [default, plein-ecran] }
    - { id: envoye, states: [default] }
  edges:
    - { from: test, to: candidat, on: preview }
    - { from: test, to: test, on: select }
    - { from: candidat, to: exercice, on: start }
    - { from: candidat, to: test, on: back }
    - { from: candidat, to: candidat, on: check }
    - { from: rendre, to: envoye, on: submit }
    - { from: exercice, to: envoye, on: timeout }
