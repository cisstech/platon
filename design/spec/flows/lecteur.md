# lecteur

Le lecteur est l'endroit où Inès travaille. Il n'a pas la couverture : c'est un mode concentré,
plein écran, comme aujourd'hui. Rien de la navigation ne doit distraire pendant un examen : on
revient au cours avant de commencer ou après avoir rendu, jamais pendant une épreuve notée, qui n'a
ni flèche de retour ni croix. C'est la seule surface de l'interface qui porte la marge de la copie :
un filet rouge clair à gauche, où s'inscrivent le numéro de la question et son résultat, comme les
annotations d'un correcteur. En tête de chaque page, la marque du cours (AP1, lagon) dit à quel
cours appartient l'activité, et la progression de l'activité prend la teinte du cours.

Une épreuve s'ouvre sur sa page de garde, la première page de la copie, comme celle du candidat :
une feuille avec la marge, le nom de l'étudiant et son groupe dans le coin, et les consignes
numérotées dans la marge, une par ligne réglée (8 exercices entre lesquels on circule ; 1 h 30 dès
le premier clic, un temps qui court quoi qu'il arrive et une copie rendue telle quelle à la fin ;
une tentative par exercice ; le plein écran, ce qui arrête l'épreuve et le code de reprise que
donne l'enseignant présent dans la salle ; la fermeture à 9 h 30). À côté de la feuille, en tête
de sa zone, un seul bouton, qui dit que le chronomètre part au clic, et le retour au cours, permis
puisque rien n'a commencé. Rien ne se tape pour commencer. Sur un iPhone, Safari n'accorde pas le
plein écran à une page : la page le dit dès l'arrivée, en attention, demande de montrer l'écran à
l'enseignant de la salle et rappelle que quitter la page ou changer d'application arrête toujours
l'épreuve ; Commencer n'est pas bloqué. Le plein écran obligatoire est un réglage des maquettes :
le lecteur d'aujourd'hui n'en a pas, il arrête l'épreuve quand la page perd le focus ou devient
cachée.

L'exercice est une copie : l'énoncé en lecture (16 px, 72 caractères par ligne), la zone de
réponse, puis les actions. Dans la marge, le numéro de chaque question : « 3.1 », « 3.2 » quand
l'exercice en compte plusieurs (exercice, puis question), le numéro de l'exercice quand il n'en a
qu'une, partout de la même façon. Le code d'un énoncé ou d'une réponse a ses lignes numérotées ;
trop longue pour l'écran, une ligne se replie sous son propre début, un cran plus loin, et sans
numéro, si bien que l'indentation reste lisible sur téléphone et que rien ne défile de côté.
Valider est la seule action primaire. Sauvegarder, Aide, Solution et Recharger sont secondaires et
n'apparaissent que si l'activité les autorise. Sous les boutons, une ligne dit ce que chaque action
fait de la réponse : Valider est définitif (le rappel est attaché au bouton), Sauvegarder garde un
brouillon modifiable, Exercice suivant garde aussi ce qui est tapé, en brouillon, sans le valider.
À droite, la liste des exercices avec leur état et, pour une activité chronométrée, le temps
restant. Une question à réponse unique se présente en boutons radio, une question à réponses
multiples en cases à cocher.

Ce que Valider montre dépend du réglage Déroulement « Résultat après chaque validation ». Activé,
comme pour le quiz de la semaine 4, Valider inscrit le résultat dans la marge (juste, faux, partiel)
et affiche le retour sous la réponse : la réponse donnée, la bonne réponse, l'explication. Le quiz
a ses propres exercices, aucun en commun avec les examens ; les maquettes montrent Inès qui
revient sur le 3, Boucles imbriquées, le 28 septembre. Un bon résultat est une information verte,
pas une fête. Désactivé, comme pour une épreuve notée, Valider scelle la réponse sans rien
révéler : la marge, la liste et le message disent « enregistrée » avec le cadenas, la réponse
scellée se lit en lecture seule (champ et choix grisés, le choix fait reste marqué), le compteur
avance, et le résultat n'apparaît qu'à la conclusion. Une épreuve ne laisse jamais deviner la
bonne réponse à celui qui la passe, ni à celui qui regarde son écran.

Une épreuve se rend. « Rendre ma copie » est en permanence dans l'en-tête, en secondaire ; sur le
dernier exercice, une fois validé, il devient l'action primaire, une seule fois à l'écran : dans
l'en-tête sur bureau, avec dans la copie un lien vers le premier exercice non validé, et en bas,
sous le pouce, sur téléphone. La confirmation montre la copie, dit combien d'exercices sont
enregistrés, liste ceux qui ne sont pas validés, chacun un lien qui y ramène (le glyphe du
brouillon, l'heure du brouillon, « Y revenir » et sa flèche), rappelle qu'ils partiront tels quels
avec leur brouillon, et donne le temps restant. Rendre mène à la conclusion. C'est la seule façon de
terminer une épreuve.

Le temps d'une épreuve court depuis son début, quoi qu'il arrive. C'est ce que fait la plateforme
(`isTimeouted` et `getClosingTime`, dans `libs/feature/player/common/src/lib/player.model.ts`,
comptent depuis `startedAt + duration`, quels que soient les arrêts, les pannes ou les coupures), et
c'est ce que les écrans disent : « le temps continue de s'écouler ». Le temps restant passe en
attention à 10 minutes et en correction à la dernière minute, toujours avec un mot (« Plus que 10
minutes », « Moins d'une minute ») ; une région polie l'annonce aux lecteurs d'écran à ces seuils
seulement.

Proposition, changement de modèle à valider avec l'équipe : une panne de PLaTon détectée par le
serveur (le service des exercices ou l'API ne répond plus) met le chronomètre en pause et le
reprend avec le service ; une coupure de la connexion de l'étudiant ne le met jamais en pause, faute
de pouvoir la distinguer d'une sortie volontaire. Il faudrait que le serveur enregistre les
périodes de panne et que `isTimeouted` et `getClosingTime` les retranchent. Tant que ce n'est pas
décidé, aucun écran d'étudiant ou de candidat ne promet une pause.

Quand PLaTon ne répond plus, la copie laisse place à une page d'erreur qui nomme le problème et
depuis quand, rassure sur ce qui est enregistré, dit calmement que le temps continue de s'écouler
et quoi faire : le signaler à l'enseignant présent dans la salle, puis réessayer. Le chronomètre
garde sa vraie valeur. « Rendre ma copie » est inactif tant que PLaTon ne peut pas la recevoir, et
la raison est écrite à côté. Jamais une page blanche.

Quand c'est la connexion de l'étudiant qui tombe, la copie reste à l'écran, en lecture seule : la
réponse en cours ne se modifie plus (champ en pointillés, avec la raison dessous), et redevient
modifiable avec la connexion. Valider, Sauvegarder, changer d'exercice et « Rendre ma copie » ou
« Rendre mon test » sont inactifs, la raison écrite à côté, et un message neutre dit depuis quand la
connexion est perdue, que PLaTon se reconnecte et que le temps continue de s'écouler.

Quand le temps est écoulé, la copie est rendue telle quelle, comme la page de garde l'annonce, et
une page dit ce qui a été gardé (les réponses validées, les brouillons) puis où aller : le
résultat, ou le cours. L'épreuve est finie : cette page a sa propre sortie.

Quand l'activité est terminée, la conclusion dit d'abord que c'est fini (la chaleur sur la barre et
l'icône d'achèvement) et ce qui a été rendu (« Copie rendue à 9 h 04 : 6 exercices validés, 2
rendus en brouillon »), puis résume en langage humain : exercices réussis, note si elle existe,
durée, et ce que l'on peut faire ensuite. Chaque exercice y a son état, en toutes lettres et avec
son icône (réussi pour 100, réussi en partie de 1 à 99, à revoir pour 0), et dit s'il est parti en
brouillon ; chaque ligne mène à l'exercice dans la copie. Pour une épreuve notée, la note de
l'épreuve est écrite « provisoire » et les notes de chaque exercice attendent la relecture : un
« 0 / 100 » sur un brouillon que le correcteur peut encore relire serait dur, et peut-être faux. Pour
un entraînement, chaque exercice montre sa note. La note reste dans la couleur du texte : une note
basse et une note haute reçoivent le même accueil. Ce qui est proposé ensuite est vrai le jour
même (le 12 octobre, TP 5 est fermé : la copie corrigée de TP 3 et Challenge : tris, sans
échéance), et chaque proposition est un lien. Aucun identifiant technique.

Quand la correction est faite, Inès retrouve sa copie corrigée, depuis l'accueil (« Voir la
correction ») ou depuis le cours (« Voir mes résultats »). C'est la copie qu'elle a rendue, avec ce
que le correcteur y a écrit : dans la marge, le résultat et la note sur 100 de chaque exercice
(« 80 », puis « / 100 » dessous) ; sous chaque réponse, le résultat des tests automatiques, avec le
test qui échoue ; à l'encre rouge, les remarques du correcteur, à l'encre verte ses compliments, et
à la fin son appréciation, signée et courte : ce qui va bien à l'encre verte, la chose à travailler
à l'encre rouge. La note suit le calcul de la plateforme : chaque exercice est noté sur 100, une
étiquette du correcteur change la note de l'exercice où elle est posée, et la note de la copie est
la moyenne des exercices. À côté de la copie, la note détaille ce calcul : la note automatique,
chaque étiquette sur son exercice, puis la moyenne. Une note s'écrit « 82 / 100 », partout.

Quitter une épreuve notée, par n'importe quel chemin, l'arrête. Fermer la page, quitter le plein
écran, changer d'onglet ou d'application : la copie laisse place à un message calme, en attention et
non en erreur, car rien n'est cassé. Il dit pourquoi et à quelle heure (Inès a quitté le plein écran
à 8 h 52), ce qui est gardé (les réponses validées, scellées, et les brouillons), et que le temps
continue de s'écouler, jusqu'à la fin prévue (9 h 30). Dessous, le champ « Code de reprise », avec
la consigne « Votre enseignant vous le donne en salle », et Reprendre. C'est le code de l'activité
(K7Q2XM pour l'Examen partiel 2), que l'enseignant voit masqué, sous le même nom de « Code de
reprise », dans les paramètres et le suivi de l'épreuve ; il rouvre la copie là où elle s'était
arrêtée, il ne sert jamais à commencer. Un code faux le dit sous le champ, en erreur (« Ce code ne
permet pas de rouvrir votre copie. »), et se ressaisit ; après 9 h 30, la session a expiré et
l'écran devient celui du temps écoulé. Pendant l'arrêt, répondre, changer d'exercice et rendre la
copie attendent la reprise. Sans reprise, la copie reste telle qu'elle était au moment de l'arrêt.

Avant de partir, l'étudiant est prévenu quand c'est possible. Le retour du navigateur (ou le geste
retour du téléphone) ouvre l'avertissement : « Quitter l'épreuve l'arrête : vous pourrez la
reprendre avec le code que donne l'enseignant, tant que le temps n'est pas écoulé. », avec « Rester
dans l'épreuve » en action principale et « Quitter et arrêter l'épreuve » en action secondaire,
qui mène au cours. Fermer l'onglet ou recharger la page ne montre que la boîte du navigateur, dont
le texte ne se choisit pas (`onBeforeUnload`) ; changer d'onglet ou d'application ne laisse le temps
d'aucun avertissement (la page est déjà cachée), d'où la consigne de la page de garde.

Le lecteur sert aussi au candidat d'un test d'entrée. Pour Mariam, l'en-tête porte le nom du test,
sans marque de cours ni retour vers un cours, et l'action permanente est « Rendre mon test » ; la
confirmation mène à la page d'envoi du flow tests (`envoye`), jamais à la conclusion. Le 9 octobre,
elle commence à 14 h 30 ; sa connexion tombe de 15 h 12 à 15 h 16 : la copie reste à l'écran,
en lecture seule, le temps continue de s'écouler et un message neutre dit depuis quand la connexion
est perdue et que PLaTon se reconnecte ; sa réponse, Valider et « Rendre mon test » reviennent avec
la connexion. Elle rend à 15 h 42 : 1 h 12 comptées sur 1 h 30, il lui restait 18 minutes.

Sur téléphone, le lecteur garde tout : l'énoncé entier, identique à celui du bureau, la marge plus
étroite, la mention Notée. Pendant une épreuve, la barre du haut porte le chronomètre et « Rendre ma
copie », sans croix. Valider est en bas, sous le pouce, à côté de Sauvegarder, au-dessus d'une
barre Précédent, « Exercice 3 sur 8 », Suivant ; le bouton du milieu ouvre la liste des exercices
dans une feuille. Juste au-dessus de Valider, dans la barre du bas, une ligne dit ce que fait
l'action : « Valider est définitif », puis « Réponses scellées » une fois validé, ou pourquoi elle
attend. Les confirmations sont des feuilles en bas de l'écran. Le téléphone a tous les états de la
copie : la page de garde et l'iPhone sans plein écran, à faire, scellée, la liste, le retour
immédiat d'un entraînement, plus que 10 minutes, la panne de PLaTon, l'épreuve arrêtée, son code de
reprise et le code faux, le candidat et sa connexion perdue.

Les titres suivent trois pas de l'échelle : le nom de l'épreuve, titre de niveau 1, au pas title
(22) ; les questions au pas heading (17) ; le titre d'une confirmation au pas subheading (15),
comme toutes les confirmations de PLaTon.

## Rules

- la marge n'apparaît que sur la copie (à faire ou corrigée) et sur sa page de garde, les
  consignes d'une épreuve ; jamais dans la liste ni la conclusion
- dans la marge, le numéro de la question : « 3.1 », « 3.2 » dans un exercice qui en a plusieurs
  (exercice, puis question), le numéro de l'exercice quand il n'en a qu'une ; le même sur toutes les
  surfaces, bureau, téléphone, candidat ; les lecteurs d'écran l'entendent en tête de la question
- chaque écran du lecteur porte la marque du cours en tête, sauf pour un candidat ; la progression
  d'une activité prend la teinte de son cours
- chaque écran a un seul titre de niveau 1 et un lien d'évitement vers la copie ou le contenu ; le
  titre de niveau 1 (title), les questions (heading) et le titre d'une confirmation (subheading)
  sont trois pas distincts de l'échelle, sur téléphone comme sur bureau
- une épreuve s'ouvre sur sa page de garde : les consignes numérotées dans la marge, le nom et le
  groupe dans le coin, dont le temps qui court quoi qu'il arrive, ce qui arrête l'épreuve et le code
  de reprise ; un seul bouton, qui dit que le chronomètre part au clic, et le retour au cours
- le code de reprise rouvre une copie arrêtée ; il ne sert pas à commencer, et la page de garde n'a
  pas de champ de code
- un téléphone qui n'accorde pas le plein écran (Safari sur iPhone) le dit dès la page de garde, en
  attention avec son mot, dit ce que cela change et quoi faire, sans bloquer Commencer
- Valider est la seule action primaire de la copie ; les autres actions dépendent des réglages de
  l'activité
- sous les actions, une ligne dit ce que chacune fait de la réponse : Valider est définitif,
  Sauvegarder et Exercice suivant gardent un brouillon modifiable
- le résultat d'une question va dans la marge et le retour sous la réponse, en couleur d'état
  avec une icône et un mot, seulement si le réglage « Résultat après chaque validation » est activé
- sans ce réglage (épreuve notée), Valider scelle la question : le cadenas dans la marge, la liste
  et le message, la réponse en lecture seule (`.input.sealed`, `.options.sealed`), sans juste ni
  faux, sans bonne réponse ni explication, et le compteur avance
- les états ont chacun leur glyphe : réussi `check_circle`, réussi en partie `contrast`, à revoir
  `error`, enregistré et scellé `lock`, brouillon `save`, à faire un cercle vide, épreuve arrêtée
  `do_not_disturb_on`, PLaTon ne répond pas `cloud_off`, connexion perdue `wifi_off` ; ce qui
  rassure sur les réponses gardées (cadenas, `check`) est en graphite, jamais en vert
- une question à réponse unique est un groupe de boutons radio, une question à réponses multiples
  un groupe de cases à cocher
- chaque exercice de la liste est un bouton qui annonce son état ; l'exercice courant est marqué
  comme l'étape en cours
- une activité notée annonce ses règles avant le début, et le chronomètre est visible en permanence
- le temps d'une épreuve court depuis son début, quoi qu'il arrive (`isTimeouted`,
  `getClosingTime`) : ni une panne de PLaTon, ni une coupure, ni un arrêt ne l'arrêtent, et l'écran
  le dit ; aucun écran d'étudiant ou de candidat ne promet une pause tant que la proposition (pause
  sur panne détectée par le serveur, jamais sur coupure de l'étudiant) n'est pas décidée
- le temps restant passe en attention à 10 minutes et en correction à la dernière minute, avec un
  mot ; une région polie n'annonce que ces seuils
- quand PLaTon ne répond plus, la page d'erreur nomme le problème et depuis quand, dit ce qui est
  enregistré, que le temps continue de s'écouler et de le signaler à l'enseignant présent dans la
  salle ; Réessayer est l'action principale, « Rendre ma copie » est inactif avec sa raison
- hors connexion, la réponse en cours reste à l'écran en lecture seule, avec sa raison, et
  redevient modifiable avec la connexion ; Valider, Sauvegarder, le changement d'exercice et
  « Rendre ma copie » ou « Rendre mon test » sont inactifs, la raison écrite à côté
- une épreuve notée commencée n'a ni flèche de retour ni croix ; seul « Rendre ma copie » la
  termine ; le verbe pour une sortie est « arrêter », partout
- quitter une épreuve notée, par n'importe quel chemin, l'arrête ; le retour du navigateur ouvre
  l'avertissement (quitter), dont « Rester dans l'épreuve » est l'action principale ; fermer la page
  ne montre que la boîte du navigateur
- une épreuve arrêtée dit pourquoi et à quelle heure, ce qui est gardé (réponses validées, scellées,
  et brouillons) et que le temps continue de s'écouler ; le champ « Code de reprise » est libellé,
  avec sa consigne, Reprendre est l'action primaire ; un code faux passe le champ en erreur et le
  dit dessous (« Ce code ne permet pas de rouvrir votre copie. ») ; après la fin du temps, l'écran
  devient celui du temps écoulé
- le code d'un énoncé ou d'une réponse est lisible à 380 px : lignes numérotées, une ligne trop
  longue se replie en retrait sous son début, rien n'est coupé ni ne défile de côté
- « Rendre ma copie » est toujours à portée : dans l'en-tête en secondaire ; une fois le dernier
  exercice validé, il devient l'action primaire, une seule fois à l'écran ; sa confirmation dit
  combien d'exercices sont enregistrés, nomme chaque exercice non validé dans un lien vers lui
  (glyphe du brouillon, flèche, « Y revenir »), et donne le temps restant
- à la fin du temps, la copie est rendue telle quelle, brouillons compris, et l'écran dit ce qui a
  été gardé
- la conclusion ne montre aucun identifiant technique ; la chaleur y marque l'achèvement, jamais
  la note ; elle dit ce qui a été rendu (validés, brouillons) ; chaque exercice y a un état écrit en
  toutes lettres et mène à la copie ; pour une épreuve notée, la note est dite provisoire et les
  notes par exercice attendent la relecture
- ce que la conclusion propose ensuite est vrai à la date de l'épreuve, et chaque proposition est
  un lien
- la copie corrigée montre la note sur 100 de chaque exercice dans la marge, les tests
  automatiques et les remarques sous chaque réponse, l'appréciation à la fin ; la note de la copie
  est la moyenne des exercices, et une étiquette du correcteur change la note de son exercice ; une
  note s'écrit « 82 / 100 », avec ses espaces
- une remarque du correcteur est à l'encre rouge, un compliment à l'encre verte ; l'appréciation
  sépare ce qui va bien (vert) de la chose à travailler (rouge), en peu de mots
- pour un candidat, l'en-tête porte le nom du test, « Rendre mon test » mène à la confirmation
  d'envoi du flow tests, et rien ne renvoie vers un cours
- sur téléphone, l'action principale est en bas, à portée de pouce, et toute cible tactile fait
  au moins 44 px ; la ligne qui dit ce que fait l'action (« Valider est définitif ») est dans la
  barre du bas, juste au-dessus d'elle
- l'étudiant et le candidat ont tous les états de la copie sur téléphone : page de garde, iPhone
  sans plein écran, à faire, scellée, liste, entraînement, plus que 10 minutes, panne de PLaTon,
  épreuve arrêtée, code faux, avertissement de sortie, candidat et connexion perdue
- le lecteur vouvoie

spec:
  screens:
    - { id: intro, states: [default, ios] }
    - { id: exercice, states: [default, valide, entrainement, error, liste, bientot, candidat, reconnexion, interrompu, code-faux] }
    - { id: rendre, overlay: true, states: [default, candidat] }
    - { id: temps-ecoule, states: [default] }
    - { id: conclusion, states: [default] }
    - { id: quitter, overlay: true, states: [default] }
    - { id: copie-corrigee, states: [default] }
  edges:
    - { from: intro, to: exercice, on: start }
    - { from: intro, to: cours, on: back }
    - { from: exercice, to: exercice, on: next }
    - { from: exercice, to: exercice, on: list }
    - { from: exercice, to: exercice, on: retry }
    - { from: exercice, to: exercice, on: reconnect }
    - { from: exercice, to: exercice, on: resume }
    - { from: exercice, to: exercice, on: wrong-code }
    - { from: exercice, to: rendre, on: submit }
    - { from: exercice, to: temps-ecoule, on: timeout }
    - { from: exercice, to: temps-ecoule, on: code-expired }
    - { from: exercice, to: quitter, on: browser-back }
    - { from: exercice, to: cours, on: back }
    - { from: rendre, to: exercice, on: dismiss }
    - { from: rendre, to: conclusion, on: submit }
    - { from: temps-ecoule, to: conclusion, on: next }
    - { from: temps-ecoule, to: cours, on: back }
    - { from: quitter, to: exercice, on: stay }
    - { from: quitter, to: cours, on: leave }
    - { from: conclusion, to: cours, on: back }
    - { from: conclusion, to: accueil-etudiant, on: home }
    - { from: conclusion, to: copie-corrigee, on: open }
    - { from: conclusion, to: challenges, on: challenge }
    - { from: etudiant, to: copie-corrigee, on: open }
    - { from: detail, to: copie-corrigee, on: open }
    - { from: copie-corrigee, to: detail, on: back }
