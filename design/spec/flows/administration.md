# administration

Sophie administre la plateforme. Ses cinq onglets reprennent les six d'aujourd'hui : Utilisateurs,
Groupes, Connexions, Tags, Annonces. Connexions rassemble les LMS et les serveurs CAS, deux
listes courtes qui servent le même but (faire entrer les gens dans PLaTon), derrière un
sélecteur à deux choix. Rien n'est ajouté ; tout est remis en forme avec les composants du reste
de l'application (tableaux, tiroirs, dialogues).

Utilisateurs : recherche, filtres de rôle et de statut, tri par nom ou par date d'ajout, ajout
d'un compte hors CAS avec mot de passe généré, changement de rôle et désactivation depuis la
ligne ou pour une sélection, chacun confirmé par un dialogue qui nomme les personnes. Groupes :
les groupes de la plateforme, qu'un enseignant ajoute d'un coup à un cours, supprimés en lot
après confirmation. Connexions : les LMS reliés en LTI et les serveurs d'authentification CAS,
chacun devenant un bouton de connexion. Tags : topics et niveaux, avec le nombre de ressources de
chacun, le renommage et la suppression en place, et la détection des doublons proches.
Annonces : rédaction en brouillon, cible, durée du bandeau, publication. Le 28 septembre, Sophie
rédige « Inscriptions pédagogiques du second semestre », une annonce nouvelle pour les étudiants,
encore en brouillon ; la liste derrière elle montre les quatre annonces publiées.

La liste des utilisateurs a deux états. Sans sélection, elle montre la première page des comptes
actifs. Pour désactiver les comptes de démonstration de l'an dernier, Sophie filtre sur le rôle
Démo et coche les trois comptes de 2025 : la barre de sélection se pose sous la liste, sans en
couvrir une ligne.

## Rules

- chaque page d'administration porte un repère discret « Mode administration », neutre, sans
  couleur d'alerte ni cadre autour de l'écran
- l'administration a cinq onglets au plus ; LMS et CAS vivent sous Connexions, chacun avec son
  adresse et sa propre action principale (« Ajouter un LMS », « Ajouter un CAS »)
- la liste des utilisateurs montre ce que disent ses filtres : en « Actifs », aucun compte
  désactivé n'y figure ; un compte désactivé se retrouve sous « Désactivés », d'où il se réactive
- les colonnes Utilisateur et Ajouté le se trient ; l'ordre en cours est dit par l'en-tête
  (flèche et `aria-sort`), Utilisateur croissant par défaut
- chaque ligne se coche par une case libellée du nom de la personne ; la case d'en-tête
  sélectionne toute la page et passe à l'état mixte quand une partie seulement est cochée ; son
  propre compte ne se coche pas
- cocher des lignes fait apparaître la barre de sélection, qui dit combien de comptes sont
  choisis et porte « Changer le rôle » et « Désactiver » pour toute la sélection ; elle ne couvre
  jamais une ligne de la liste
- désactiver un compte se confirme par un dialogue qui nomme la personne (nom, rôle, e-mail), dit
  qu'elle ne pourra plus se connecter, ce qui reste (cours, ressources) et que le compte se
  réactive ; cela ne se fait pas sur son propre compte
- désactiver une sélection se confirme par un dialogue qui dit le nombre de comptes, nomme les
  trois premiers (puis « et N autres »), dit ce qui part et ce qui reste ; le bouton reprend le
  nombre (« Désactiver les 3 comptes »)
- changer un rôle se confirme par un dialogue qui nomme la personne, son rôle actuel et le nouveau,
  et ce que le nouveau rôle permet ; le bouton dit l'action (« Donner les droits
  d'administration »), jamais « Confirmer » ; pour une sélection, le même dialogue dit le nombre
  et nomme les trois premiers
- les libellés qui parlent d'une personne restent épicènes ou reprennent son nom : la plateforme ne
  connaît pas le genre des comptes
- supprimer des groupes se confirme par un dialogue qui nomme chaque groupe, son nombre de
  personnes et les cours où il est inscrit ; les personnes gardent leur compte, et perdent l'accès
  aux cours où elles n'étaient inscrites que par ce groupe
- un mot de passe généré est affiché une seule fois, avec de quoi le copier
- un tag affiche le nombre de ressources qui l'utilisent ; il se renomme par un bouton visible,
  au clavier comme à la souris, et se supprime en place, avec une annulation qui dit combien de
  ressources le perdent
- un tag proche d'un tag existant propose d'abord l'existant
- une notification ne recouvre pas ce dont elle parle : la liste où l'objet a été supprimé reste
  lisible au-dessus d'elle
- une annonce nouvelle est un brouillon, et le dialogue le dit ; le bouton principal suit
  l'interrupteur de publication (« Enregistrer le brouillon », ou « Publier pour 4 431 personnes »
  avec le public réel de la cible choisie)
- une annonce publiée apparaît en bandeau sur l'accueil pendant la durée choisie, puis reste dans
  la page Annonces ; la liste de l'administration montre les mêmes annonces que la page Annonces
- supprimer une annonce se fait en place, avec une annulation possible
- les champs LTI et CAS sont libellés en français, le terme technique du LMS en aide

spec:
  screens:
    - { id: utilisateurs, states: [default, selection] }
    - { id: utilisateur-actions, overlay: true, states: [default] }
    - { id: utilisateur-nouveau, overlay: true, states: [default] }
    - { id: utilisateur-desactiver, overlay: true, states: [default] }
    - { id: utilisateur-role, overlay: true, states: [default] }
    - { id: utilisateurs-desactiver, overlay: true, states: [default] }
    - { id: groupes-plateforme, states: [default] }
    - { id: groupe-plateforme, overlay: true, states: [default] }
    - { id: groupes-supprimer, overlay: true, states: [default] }
    - { id: lms, states: [default] }
    - { id: lms-nouveau, overlay: true, states: [default] }
    - { id: cas, states: [default] }
    - { id: cas-nouveau, overlay: true, states: [default] }
    - { id: tags, states: [default] }
    - { id: tag-similaire, overlay: true, states: [default] }
    - { id: annonces-admin, states: [default] }
    - { id: annonce-edition, overlay: true, states: [default] }
  edges:
    - { from: utilisateurs, to: utilisateur-actions, on: more }
    - { from: utilisateurs, to: utilisateur-nouveau, on: create }
    - { from: utilisateurs, to: utilisateurs-desactiver, on: deactivate-selection }
    - { from: utilisateurs, to: groupes-plateforme, on: tab }
    - { from: utilisateurs, to: lms, on: tab }
    - { from: utilisateurs, to: tags, on: tab }
    - { from: utilisateurs, to: annonces-admin, on: tab }
    - { from: utilisateur-actions, to: utilisateur-role, on: role }
    - { from: utilisateur-actions, to: utilisateur-desactiver, on: deactivate }
    - { from: utilisateur-actions, to: utilisateurs, on: dismiss }
    - { from: utilisateur-nouveau, to: utilisateurs, on: dismiss }
    - { from: utilisateur-desactiver, to: utilisateurs, on: confirm }
    - { from: utilisateur-desactiver, to: utilisateurs, on: dismiss }
    - { from: utilisateur-role, to: utilisateurs, on: confirm }
    - { from: utilisateur-role, to: utilisateurs, on: dismiss }
    - { from: utilisateurs-desactiver, to: utilisateurs, on: confirm }
    - { from: utilisateurs-desactiver, to: utilisateurs, on: dismiss }
    - { from: groupes-plateforme, to: groupe-plateforme, on: open }
    - { from: groupes-plateforme, to: groupes-supprimer, on: delete }
    - { from: groupe-plateforme, to: groupes-plateforme, on: dismiss }
    - { from: groupes-supprimer, to: groupes-plateforme, on: confirm }
    - { from: groupes-supprimer, to: groupes-plateforme, on: dismiss }
    - { from: lms, to: cas, on: switch }
    - { from: lms, to: lms-nouveau, on: create }
    - { from: lms-nouveau, to: lms, on: dismiss }
    - { from: cas, to: lms, on: switch }
    - { from: cas, to: cas-nouveau, on: create }
    - { from: cas-nouveau, to: cas, on: dismiss }
    - { from: tags, to: tag-similaire, on: create }
    - { from: tag-similaire, to: tags, on: dismiss }
    - { from: annonces-admin, to: annonce-edition, on: create }
    - { from: annonce-edition, to: annonces-admin, on: dismiss }
