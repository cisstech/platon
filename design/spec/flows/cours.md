# cours

Le cours est l'unité de travail commune à Inès et à Karim, mais ils n'y cherchent pas la même
chose. Inès veut ses activités, rangées par section, avec son avancement ; Karim veut les mêmes
sections, plus de quoi ajouter, régler, suivre et gérer ses membres.

La liste garde tout ce que la page actuelle permet : recherche sur le nom, Actuels et Archivés,
tri (nom, création, mise à jour) et période de mise à jour, Créer un cours pour l'enseignant, et
pour l'administrateur l'affichage de tous les cours de la plateforme. Chaque cours devient un
classeur : un intercalaire et une couverture à sa teinte, son sigle, son nom, sa description, le
lien vers ses challenges, ses effectifs en toutes lettres (6 enseignants, 302 étudiants, 9
activités) et sa date de mise à jour. L'étudiant ne voit pas les effectifs : sa carte dit son
avancement, compté en exercices (58 %, 34 exercices sur 59), avec en texte le nombre d'activités
terminées (4 sur 9), qui enseigne (« Karim Haddad
et 5 autres enseignants ») et sa prochaine échéance. Sur téléphone, sa liste garde la recherche,
Actuels et Archivés, et une carte par cours avec sa marque. Archiver range le cours pour soi
seulement, comme aujourd'hui (archivage de l'appartenance).

La page d'un cours garde ses onglets réels : Vue d'ensemble, Challenges (s'il y en a), Membres,
Groupes et, pour qui peut modifier, Paramètres. L'étudiant n'a que Vue d'ensemble et Challenges. L'en-tête porte la marque du cours (sa couverture
en petit, avec son sigle, à sa teinte), le nom et la description modifiables sur place, les
effectifs, la date de création et l'auteur, Partager (lien PLaTon ou lien LTI) et un menu qui
exporte les notes en CSV : rien d'autre, l'en-tête porte au plus Partager, l'action principale de
l'onglet et ce menu. L'action principale de l'en-tête appartient à l'onglet actif : Ajouter
une activité sur la vue d'ensemble, Ajouter des membres sur Membres, Ajouter un groupe sur
Groupes ; Challenges n'en a pas (un challenge s'ajoute comme une activité) et Paramètres non plus,
son formulaire s'enregistre en pied.

La vue d'ensemble garde la recherche, le filtre d'état (Toutes, Ouvertes, Planifiées, Fermées : le
mot des étiquettes, au pluriel), le choix Sections ou Tableau (deux mots
dans un sélecteur, pas deux icônes), l'ajout et les actions de section, réunies dans le menu de la
section : Ajouter une activité ici, Renommer, Réordonner (la section et ses activités, au clavier),
Supprimer la section. Les sections sont les intercalaires du classeur : un onglet à la teinte du
cours, posé sur un filet de la même teinte, avec le menu de la section au bout du filet. Chaque
activité dit son état avec son glyphe (planifiée, ouverte, fermée, en correction), ses dates, son
nombre d'exercices et « Notée » quand elle l'est ; une épreuve notée a la copie et la plume
(`history_edu`) pour icône. Pour l'étudiant, la ligne dit son avancement et porte Commencer,
Reprendre ou Voir mes résultats, qui ouvre sa copie corrigée ; pour l'enseignant, la ligne entière
ouvre le suivi, un bouton n'apparaît que s'il y a quelque chose à faire (Planifier) et le menu de
la ligne réunit Régler l'activité, Tester l'activité, Ouvrir la ressource et Exporter les notes
(CSV). « Paramètres » est le mot de l'onglet du cours, et de lui seul : ce qui ouvre le panneau de
réglage d'une activité s'appelle « Régler l'activité », dans le menu de la ligne comme en tête du
suivi.

Une activité sans dates est ouverte, comme le calcule la plateforme (`calculateActivityOpenState`).
L'enseignant le lit « Ouverte, sans dates » : pour un entraînement comme TP 5, c'est une
information neutre (l'état Ouverte, puis « Sans dates »), pour une épreuve notée une alerte en
attention ; dans les deux cas Planifier est à côté. L'étudiant voit l'activité, sans échéance, et
peut la commencer. Le 28 septembre à 10 h, Karim planifie TP 5 du lundi 5 octobre à 8 h au
dimanche 11 octobre à 23 h 59 : les écrans de la page du cours montrent TP 5 avant cet
enregistrement, le panneau de réglage le montre pendant la saisie. Les mots des échéances sont
fixés : côté étudiant « Sans échéance » ; côté enseignant « Sans fermeture » quand l'ouverture est
fixée et « Ouverte, sans dates » quand rien ne l'est. On fixe des dates avec « Planifier ». Les
heures s'écrivent sans zéro initial (8 h, 9 h 30).

La colonne de droite devient « À faire » : les copies à corriger du cours entier, avec l'épreuve,
les groupes et le correcteur (« Examen partiel 1, TD 2 et TD 4, confiées à Julien Lefèvre »), les
activités à planifier, ce qui ferme bientôt. Un cours neuf affiche les trois prochaines étapes au
lieu d'une page vide. Si les activités ne se chargent pas, la page le dit et propose Réessayer, au
lieu d'afficher un cours vide.

L'étudiant ne voit pas les effectifs du cours : l'en-tête lui dit qui enseigne et sa prochaine
échéance, la colonne de droite son avancement (en exercices), son temps passé et l'activité qui
ferme le plus tôt, avec Reprendre. Sur téléphone, la même page commence par son avancement et À
faire, garde l'action principale (Reprendre l'activité qui ferme le plus tôt) sous le pouce,
annonce ce qui vient (Bientôt) et range ensuite les sections en intercalaires qui se replient,
chacun disant ce qu'il contient. Le téléphone a aussi la liste des cours, l'onglet Challenges et
l'état d'erreur de la page.

Le suivi d'une activité réunit les deux pages actuelles, Statistiques et Suivi de l'activité, en
trois onglets, sous un fil d'Ariane qui part de Cours : Statistiques (tant que l'activité est
ouverte, ses cinq chiffres sont provisoires, et la page le dit une fois, au-dessus d'eux ;
l'exercice où la réussite du premier coup est la plus basse est signalé, le titre du tableau y
mène et la ligne mène aux étudiants concernés), Étudiants (un état par exercice, colonnes nommées,
tri, filtre par groupe et par état, pagination), Accès individuels (ouverture et fermeture pour
des étudiants choisis dans une liste qui se cherche ; le code de reprise, masqué, qu'on affiche,
copie ou renouvelle, quand l'activité s'arrête si l'on la quitte, comme Examen partiel 2 ; sinon
une ligne discrète dit qu'elle n'en a pas, comme pour le quiz). Les indicateurs ont leurs icônes, jamais celle d'un état : le taux de
réussite `percent`, les abandons `trending_down`.

Régler l'activité ouvre le panneau latéral à trois onglets (Accès, Déroulement, Gestion). Les
interrupteurs de sécurité de Déroulement disent le verbe arrêter, comme la page d'entrée d'une
épreuve : « Arrêter l'activité si l'étudiant quitte la page », « … quitte la fenêtre » ; dès que
l'un d'eux est actif, l'activité a un code de reprise, dans Accès individuels.
Gestion sépare les actions immédiates (Fermer ou Rouvrir selon l'état, Mettre à jour, Supprimer)
du formulaire enregistré par Enregistrer. La couleur d'une activité est celle de son cours : le
panneau ne la propose plus. L'ordre des périodes d'accès compte : une personne présente dans
plusieurs périodes suit la première, « Tous les autres membres » vaut pour qui n'est dans aucune
autre. Le panneau l'écrit au-dessus des périodes et la première carte porte « S'applique en
premier ». La fonction (entraînement, notée, challenge) se choisit à l'ajout (flow activite) ;
`isChallenge` ne se modifie pas ensuite.

Chaque période d'accès porte sa durée. Pour l'Examen partiel 2, la période 1 (Amélie Roux et Hugo
Marchand, tiers-temps) dure 2 h, fin au plus tard à 10 h, calculée à partir de ses dates ; les
périodes sans durée propre reprennent celle de l'activité (« 1 h 30, comme l'activité »). C'est une
proposition qui change le modèle. Aujourd'hui une période (`RestrictionConfig`, dans
`libs/feature/course/common/src/lib/activity-restriction.model.ts`) ne porte que DateRange,
Members, Groups, Correctors et Others ; la durée est un réglage de l'activité entière
(`settings.duration`), et le lecteur arrête la copie au plus tôt de `startedAt + duration` et de
la fin de la période (`getClosingTime` et `isTimeouted`, dans
`libs/feature/player/common/src/lib/player.model.ts`). Une période plus large ne donne donc pas
plus de temps : Amélie et Hugo, s'ils commencent à 8 h, sont arrêtés à 9 h 30 comme les autres. Il
faut ajouter une durée à la période, la renvoyer avec ses dates (`ActivityDatesService`) et la
faire passer avant `settings.duration` dans le lecteur.

Le classement des challenges est celui de la plateforme (`LeaderboardService`) : n'y entrent que
ceux qui ont réussi tous les exercices d'un challenge, dans l'ordre de réussite, et chaque
challenge réussi rapporte 100 points par exercice plus un bonus de rang. L'étudiant qui n'est pas
encore classé voit ce qui lui manque et Reprendre.

Supprimer le cours se fait dans la zone de danger des paramètres, par un dialogue qui nomme le
cours, dit ce qui part (activités, résultats, copies à corriger) et ce qui reste (les exercices,
dans les ressources), et demande d'en saisir le nom. Supprimer une section se confirme par un
dialogue qui nomme ses activités, qui partent avec elle. Retirer un membre, retirer un étudiant
d'un groupe ou supprimer un groupe qui ne sert à rien d'autre se fait en place, avec Annuler dans
la notification, qui ne suppose pas de genre (« Gaëlle Picard ne fait plus partie du cours »).
AP1 avait cinq groupes ; Karim supprime « Soutien du jeudi » (12 étudiants, aucune période
d'accès, aucune copie confiée), il en reste quatre, TD 1 à TD 4. Un groupe qui sert à une période
d'accès ou porte des copies confiées se supprime par un dialogue qui le dit. La notification ne
cache jamais ce dont parle l'écran : la liste finit au-dessus d'elle, et elle flotte sur un espace
vide.

## Rules

- la marque du cours ouvre chaque page du cours ; la teinte du cours suit le cours partout (classeur, marque, icônes de ses activités, progression, podium) et une activité n'a pas de couleur à elle
- l'action principale de l'en-tête appartient à l'onglet actif ; l'en-tête porte au plus Partager, en secondaire sur tous les onglets, cette action principale et le menu du cours
- une ligne d'activité s'ouvre en entier sur le suivi ; elle n'a un bouton que s'il y a quelque chose à faire (Planifier), et son menu (Régler l'activité, Tester l'activité, Ouvrir la ressource, Exporter les notes) le reste
- ce qui ouvre le panneau de réglage d'une activité s'appelle « Régler l'activité », partout ; « Paramètres » est l'onglet du cours et rien d'autre
- chaque état d'activité a son glyphe, sur les lignes, dans le tableau et sur les étiquettes : planifiée `event` en repère, ouverte `event_available` en validation, fermée `event_busy` en graphite, en correction `pending` ; une épreuve notée a `history_edu` pour icône, jamais un calendrier
- la colonne À faire ne liste que des actions, chacune cliquable ; un élément qui dit un état prend la couleur et l'icône de cet état
- la barre de la vue d'ensemble garde trois réglages (recherche, filtre d'état, choix de vue) ; le choix de vue s'écrit Sections et Tableau ; l'export des notes est dans le menu de l'en-tête
- le filtre d'état dit le mot des étiquettes, au pluriel : Toutes, Ouvertes, Planifiées, Fermées
- l'étudiant ne voit ni les actions d'édition, ni les onglets Membres, Groupes et Paramètres, ni l'export des notes, ni les effectifs du cours : ses onglets sont Vue d'ensemble et Challenges
- les sections d'un cours sont des intercalaires (onglet et filet à la teinte du cours) sur toutes les pages qui les montrent, pour l'enseignant comme pour l'étudiant ; sur téléphone, ils se replient
- une activité sans dates est ouverte : l'enseignant lit « Ouverte, sans dates », en information neutre pour un entraînement, en attention pour une épreuve notée, avec Planifier ; l'étudiant la voit, sans échéance, et peut la commencer
- on fixe des dates avec « Planifier », jamais « Programmer »
- les mots des échéances : « Sans échéance » côté étudiant ; côté enseignant, « Sans fermeture » quand l'ouverture est fixée, « Ouverte, sans dates » quand rien ne l'est ; les heures s'écrivent sans zéro initial
- la progression d'un étudiant dans un cours se compte en exercices, barre et pourcentage ; le nombre d'activités terminées l'accompagne en texte, jamais à sa place
- « N copies à corriger » dans la page du cours compte le cours entier et dit l'épreuve, les groupes et le correcteur
- les chiffres d'une activité encore ouverte sont dits provisoires, une fois, au-dessus des cinq indicateurs
- un menu montre quatre actions au plus, groupées ; la section se réordonne avec ses activités par Réordonner, au clavier
- l'onglet Challenges n'apparaît que si le cours a au moins un challenge
- aucun chiffre de cours n'est une moyenne de classe : il n'existe pas de résultats au niveau du
  cours, seulement les effectifs, l'avancement et le temps de la personne connectée
- un échec de chargement des activités s'affiche comme une erreur avec Réessayer, jamais comme un cours vide
- la fonction d'une activité ne se modifie pas dans le panneau de réglage
- dans le panneau de réglage, les actions immédiates sont séparées du formulaire et seules celles qui s'appliquent à l'état de l'activité sont proposées ; une action ne porte jamais le glyphe d'un état
- le suivi met en évidence, par `priority_high` et les mots « le plus bas », en attention et jamais en rouge, l'exercice où la réussite du premier coup est la plus basse ; le titre du tableau mène à sa ligne, et la ligne mène aux étudiants qui ne l'ont pas réussi du premier coup
- les indicateurs du suivi ont leur icône, jamais celle d'un état : taux de réussite `percent`, abandons `trending_down`
- les onglets du suivi disent ce qu'ils font : Statistiques, Étudiants, Accès individuels ; son fil d'Ariane part de Cours
- le code de reprise s'affiche masqué, avec Afficher, Copier et Nouveau code, partout où il apparaît ; il n'apparaît que pour une activité qui s'arrête quand on la quitte, et une ligne discrète dit qu'une activité qui ne s'arrête pas n'en a pas
- les interrupteurs de sécurité disent le verbe arrêter : « Arrêter l'activité si l'étudiant quitte la page », « Arrêter l'épreuve si… » pour une épreuve notée ; jamais « Terminer »
- la participation s'écrit « 251 sur 302 ont commencé »
- l'ordre des périodes d'accès est écrit dans le panneau : la première carte porte « S'applique en premier »
- chaque période d'accès porte sa durée ; sans durée propre, elle reprend celle de l'activité et le dit (« 1 h 30, comme l'activité ») ; c'est un changement de modèle, la période ne porte aujourd'hui que des dates et des personnes
- supprimer une section qui contient des activités se confirme en nommant ce qui part avec elle
- supprimer le cours se confirme dans un dialogue qui le nomme, en saisissant son nom
- une notification de retrait ne suppose pas de genre : « Gaëlle Picard ne fait plus partie du cours »
- une notification ne cache jamais ce dont parle l'écran : la liste qu'elle suit finit au-dessus d'elle
- un groupe du cours qui ne sert à aucune période d'accès et n'a aucune copie confiée se supprime en place, avec Annuler ; sinon par un dialogue qui dit ce qu'il porte

spec:
  screens:
    - { id: mes-cours, states: [default, etudiant, empty] }
    - { id: mes-cours-actions, overlay: true, states: [default] }
    - { id: nouveau, overlay: true, states: [default] }
    - { id: detail, states: [default, etudiant, tableau, vide, error] }
    - { id: section-actions, overlay: true, states: [default] }
    - { id: supprimer-section, overlay: true, states: [default] }
    - { id: activite-actions, overlay: true, states: [default] }
    - { id: partager, overlay: true, states: [default] }
    - { id: challenges, states: [default, etudiant] }
    - { id: membres, states: [default] }
    - { id: membres-ajouter, overlay: true, states: [default] }
    - { id: groupes, states: [default] }
    - { id: reglages, states: [default] }
    - { id: supprimer-cours, overlay: true, states: [default] }
    - { id: parametres, overlay: true, states: [default, periodes, deroulement, gestion] }
    - { id: suivi, states: [default, apprenants, moderation] }
  edges:
    - { from: mes-cours, to: detail, on: open }
    - { from: mes-cours, to: nouveau, on: create }
    - { from: mes-cours, to: mes-cours-actions, on: more }
    - { from: mes-cours-actions, to: mes-cours, on: dismiss }
    - { from: mes-cours-actions, to: challenges, on: open }
    - { from: nouveau, to: mes-cours, on: dismiss }
    - { from: nouveau, to: detail, on: create }
    - { from: detail, to: challenges, on: tab }
    - { from: detail, to: membres, on: tab }
    - { from: detail, to: groupes, on: tab }
    - { from: detail, to: reglages, on: tab }
    - { from: detail, to: partager, on: share }
    - { from: detail, to: section-actions, on: more }
    - { from: detail, to: activite-actions, on: more }
    - { from: detail, to: parametres, on: settings }
    - { from: detail, to: suivi, on: follow }
    - { from: detail, to: activite, on: add }
    - { from: detail, to: lecteur, on: start }
    - { from: detail, to: copie-corrigee, on: results }
    - { from: detail, to: corrections, on: correct }
    - { from: detail, to: mes-cours, on: back }
    - { from: partager, to: detail, on: dismiss }
    - { from: section-actions, to: detail, on: dismiss }
    - { from: section-actions, to: supprimer-section, on: delete }
    - { from: section-actions, to: activite, on: add }
    - { from: supprimer-section, to: detail, on: dismiss }
    - { from: supprimer-section, to: detail, on: confirm }
    - { from: activite-actions, to: parametres, on: settings }
    - { from: activite-actions, to: lecteur, on: test }
    - { from: activite-actions, to: ressources, on: open }
    - { from: challenges, to: detail, on: tab }
    - { from: challenges, to: lecteur, on: start }
    - { from: membres, to: membres-ajouter, on: add }
    - { from: membres-ajouter, to: membres, on: dismiss }
    - { from: reglages, to: supprimer-cours, on: delete }
    - { from: supprimer-cours, to: reglages, on: dismiss }
    - { from: supprimer-cours, to: mes-cours, on: confirm }
    - { from: parametres, to: detail, on: dismiss }
    - { from: suivi, to: parametres, on: settings }
    - { from: suivi, to: corrections, on: correct }
    - { from: suivi, to: detail, on: back }
