# ressources

Hélène cherche avant d'écrire, Karim cherche avant de créer. Le catalogue garde tout ce que la
page actuelle permet : recherche avec suggestions, type (exercices, activités, cercles), tri
(pertinence, nom, création, mise à jour), et un panneau de filtres avec statut, modèles à
compléter, cercles, auteur, topics présents et absents, niveaux et période de mise à jour. La barre
n'a que quatre contrôles : la recherche, le type, Filtres (avec le nombre de filtres actifs) et le
tri. Les filtres actifs sont des pastilles sous la barre, retirables une par une, précédées du
nombre de résultats. L'arbre des cercles s'ouvre depuis l'en-tête et mène à la page d'un cercle.

Chaque ligne garde les informations qui aident à choisir. Le nom et la description sont à côté du
statut et des outils ; dessous, sur toute la largeur de la ligne, deux lignes de méta et pas plus :
d'abord ce qu'est la ressource (niveaux et topics, des boutons qui ajoutent le filtre, auteur,
version et date), puis ce qu'elle donne (« Moyenne 71 / 100 », le nombre de tentatives et le nombre
d'activités qui l'utilisent, qui ouvre le listing). S'y ajoutent le statut (icône et mot : Prêt
`verified`, À tester `science`, Brouillon `save`, Contient des bugs `bug_report`, Ne pas utiliser
`visibility_off`), le type et, pour un exercice paramétrable, le badge Modèle à compléter avec son
nombre de champs : un modèle est un exercice dont on remplit les champs, sans code. Une moyenne mise en
couleur porte aussi une icône et un mot : « parmi les plus réussis » en validation, « à surveiller »
en attention avec `priority_high`, jamais en rouge. Les outils de la ligne
(Prévisualiser, Éditer, ou Compléter pour un modèle, qui ouvre l'atelier, et le menu) sont de vrais boutons, nommés d'après la
ressource ; ils vivent dans la colonne de droite, sous le statut, et apparaissent au survol et au
focus clavier sans jamais recouvrir le texte. Le menu ne reprend pas ce que montrent les outils :
Ajouter à un cours, puis Dupliquer et Voir les activités. Chaque ligne a aussi sa case : on choisit
plusieurs exercices, et la barre de sélection, sur la couverture, propose de les ajouter d'un coup
(« Ajouter 3 exercices à un cours ») ; c'est le dialogue de l'atelier, qui en fait une activité dans
l'ordre du choix.

Mon espace (le cercle personnel) et Vu récemment restent en colonne de droite, comme aujourd'hui.
Vu récemment est la liste de l'accueil, la même partout : les dernières ressources ouvertes, avec
leur type, le moment et, pour un exercice, son statut.

La page d'une ressource garde ses quatre onglets : Vue d'ensemble, Explorer (fichiers, version,
historique, readme, import, téléchargement, nouvelle version ; importer et télécharger vivent dans
l'arbre des fichiers), Évènements (statut, membres, création, du plus récent au plus ancien) et
Paramètres (Informations, Modèle pour un exercice, Collaborateurs pour un cercle). Les noms de
fichiers (main.ple, readme.md) n'apparaissent que dans l'Explorer, où ce sont des fichiers ; son
historique et les Évènements écrivent leurs dates en entier (« 26 sept. 2026, 9 h 41 »).
L'en-tête garde le statut modifiable sur place et les étiquettes sous le titre ; à droite, deux
actions secondaires, Partager (visibilité, version, QR code) et Prévisualiser, une seule action
principale, et un menu pour le reste : Éditer ou Paramétrer, Suivre, Dupliquer, Supprimer. Pour
l'enseignant qui consulte la ressource d'un collègue (Karim), l'action principale est Ajouter à un
cours, le dialogue de l'atelier ; pour l'auteur, c'est Éditer, et Ajouter à un cours passe dans le
menu. L'action principale suit l'onglet : Publier une version dans l'Explorer, Enregistrer dans les
Paramètres ; l'en-tête garde alors ses boutons en secondaire. Les Évènements n'ont pas d'action
propre : Ajouter à un cours y reste principal. L'auteur, la version et le nombre d'abonnés (les
collègues qui la suivent) tiennent en une ligne dans l'en-tête, après les étiquettes, qui sont des boutons de filtre. Modifier une ressource est le droit
d'écriture de la plateforme : l'ont le propriétaire de son cercle, tout collaborateur accepté de ce
cercle ou d'un cercle parent, et l'administrateur hors cercle personnel. Karim, collaborateur du
cercle Algorithmique, peut donc éditer, publier une version et changer les paramètres de
l'exercice d'Hélène ; l'en-tête le lui dit en une ligne (« Vous pouvez la modifier : vous êtes
collaborateur du cercle Algorithmique »). Qui n'a pas ce droit garde Prévisualiser, Partager,
Dupliquer, Suivre et Ajouter à un cours ; l'éditeur et les paramètres s'ouvrent en lecture seule.
Déplacer n'apparaît que pour une ressource du cercle personnel ou pour l'administrateur ; certifier
un modèle et renvoyer la ressource dans le cercle de son auteur n'apparaissent qu'à
l'administrateur, dans une section Administration du menu. Supprimer n'existe que pour une
ressource du cercle personnel, et dit alors pourquoi c'est impossible quand des activités en
dépendent ; ailleurs, le menu dit qu'une ressource d'un cercle partagé ne se supprime pas et
propose le statut Ne pas utiliser.

La vue d'ensemble d'un exercice sert d'abord à décider de l'utiliser. Elle montre quatre chiffres
(note moyenne, juste du premier coup, durée moyenne, abandons), le nombre de tentatives à côté du
titre, et replie dessous les cinq autres indicateurs puis la courbe mensuelle, en graphites, le
mois en cours plus foncé et libellé de sa valeur ; les activités qui l'utilisent sont en colonne de
droite. Celle d'un cercle montre la répartition par statut (chaque
part ouvre le catalogue filtré), les compteurs (dont les sous-cercles et les abonnés) et ses topics et niveaux. L'anneau de la répartition garde les couleurs d'état : chaque part
est un statut, avec son icône et son mot dans la légende, dans la couleur de son étiquette du
catalogue. C'est la seule exception aux graphiques en graphites, et elle ne vaut que pour une
légende d'états. L'en-tête d'un cercle a un champ de
recherche dans le cercle, l'arbre des cercles et, pour qui peut y écrire, Nouvelle ressource (le
cercle est prérempli). Un cercle se rejoint sur demande : Demander à rejoindre n'apparaît qu'à qui
n'en est ni membre, ni propriétaire, ni administrateur ; un membre voit qu'il est collaborateur. Ses
collaborateurs, invitations et demandes se gèrent dans Paramètres, où Inviter est l'action
principale. Un cercle ne se supprime pas depuis l'interface : la plateforme ne supprime que les
ressources rangées dans un cercle personnel, et jamais un cercle.

## Rules

- les filtres actifs sont visibles et retirables un par un
- la barre du catalogue a au plus quatre contrôles : recherche, type, Filtres et tri
- les outils d'une ligne ne recouvrent jamais son texte : ils vivent dans sa colonne de droite
- un menu a au plus quatre entrées, groupées, et ne répète pas les outils visibles
- une moyenne s'écrit sur 100 (« 71 / 100 ») ; une moyenne basse est « à surveiller », en
  attention avec `priority_high`, jamais en rouge
- une recherche sans résultat dit quel filtre écarte des résultats et propose de le retirer
- le statut d'une ressource a toujours son icône et son mot
- les actions d'une ligne sont accessibles au clavier, pas seulement au survol
- un exercice paramétrable (modèle) s'ouvre dans l'atelier, les autres dans l'éditeur
- une moyenne mise en couleur porte une icône et un mot
- l'en-tête d'une ressource a une seule action principale, qui suit l'onglet ; le reste est en
  secondaire ou dans le menu
- une action réservée à l'administrateur n'est montrée qu'à l'administrateur
- les actions de modification suivent le droit d'écriture ; quand il vient de la collaboration à
  un cercle, l'en-tête de la ressource le dit en une ligne
- Supprimer n'apparaît que pour une ressource du cercle personnel ; ailleurs, le menu dit pourquoi
- Demander à rejoindre n'est montré qu'à qui peut rejoindre le cercle
- les évènements sont listés du plus récent au plus ancien
- les versions se disent en français (« la plus récente »), jamais « latest »
- plusieurs exercices du catalogue s'ajoutent à un cours d'un coup, par les cases des lignes et la
  barre de sélection
- la vue d'ensemble d'une ressource montre quatre chiffres ; les autres indicateurs et la courbe
  se replient dessous
- Vu récemment est une seule liste, la même que dans l'accueil
- les heures s'écrivent sans zéro initial (« 9 h 41 ») ; les dates des journaux (évènements,
  historique des fichiers) s'écrivent en entier (« 26 sept. 2026, 9 h 41 »)
- une ligne du catalogue a deux lignes de méta et pas plus : ce qu'est la ressource, puis ce qu'elle
  donne ; ses outils et ses étiquettes de filtre sont des boutons, accessibles au clavier
- un brouillon porte `save`, partout
- un graphique est en graphites, sauf une légende d'états : chaque part y garde la couleur de son
  état, avec son icône et son mot
- un mot technique a un mot simple ou une définition d'une ligne (modèle à compléter, topics,
  sous-cercles, abonnés) ; un nom de fichier n'apparaît que dans l'Explorer

spec:
  screens:
    - { id: catalogue, states: [default, empty, selection] }
    - { id: catalogue-actions, overlay: true, states: [default] }
    - { id: filtres, overlay: true, states: [default] }
    - { id: cercles, overlay: true, states: [default] }
    - { id: ressource, states: [default] }
    - { id: ressource-actions, overlay: true, states: [default] }
    - { id: ressource-partager, overlay: true, states: [default] }
    - { id: explorer, states: [default] }
    - { id: evenements, states: [default] }
    - { id: ressource-parametres, states: [default] }
    - { id: cercle, states: [default] }
    - { id: cercle-collaborateurs, states: [default] }
  edges:
    - { from: catalogue, to: ressource, on: open }
    - { from: catalogue, to: filtres, on: filter }
    - { from: catalogue, to: cercles, on: browse }
    - { from: catalogue, to: catalogue-actions, on: more }
    - { from: catalogue, to: creation, on: template }
    - { from: filtres, to: catalogue, on: apply }
    - { from: cercles, to: catalogue, on: dismiss }
    - { from: cercles, to: cercle, on: open }
    - { from: catalogue-actions, to: catalogue, on: dismiss }
    - { from: ressource, to: explorer, on: tab }
    - { from: ressource, to: evenements, on: tab }
    - { from: ressource, to: ressource-parametres, on: tab }
    - { from: ressource, to: ressource-actions, on: more }
    - { from: ressource, to: ressource-partager, on: share }
    - { from: ressource, to: cercle, on: open }
    - { from: ressource-actions, to: ressource, on: dismiss }
    - { from: ressource-partager, to: ressource, on: dismiss }
    - { from: cercle, to: cercle-collaborateurs, on: tab }
    - { from: cercle, to: catalogue, on: filter }
    - { from: cercle, to: nouvelle, on: create }
    - { from: ressource, to: catalogue, on: back }
    - { from: catalogue, to: ajouter-au-cours, on: add }
    - { from: catalogue-actions, to: ajouter-au-cours, on: add }
    - { from: ressource, to: ajouter-au-cours, on: add }
    - { from: catalogue, to: atelier, on: complete }
    - { from: ressource, to: catalogue, on: filter }
