# connexion

La plupart des étudiants n'ouvrent jamais cette page : ils arrivent de Moodle, par un lien LTI qui
les connecte. Elle sert aux enseignants, aux administrateurs, aux étudiants qui ont un accès direct
et aux collègues qui découvrent la plateforme. Elle doit donc faire deux choses : connecter vite
ceux qui savent, et dire en une phrase ce qu'est PLaTon à ceux qui ne savent pas.

L'écran est la couverture et la page. À gauche, la couverture : le logo, une phrase sur ce que fait
PLaTon, un lien vers la présentation en vidéo (qui quitte la page de connexion, où elle occupait la
moitié de l'écran et se chargeait à chaque visite). À droite, la page : d'abord le compte de
l'établissement (CAS), qui est le chemin de la majorité, puis le mot de passe pour les comptes
locaux. Un seul bouton primaire par colonne.

Le chemin heureux : Karim clique sur « Continuer avec le compte université », s'authentifie sur le
CAS et revient sur son accueil. Sophie, qui a un compte local, saisit son nom d'utilisateur et son
mot de passe.

Quand la connexion échoue, le message reste à côté des champs, dit ce qui est faux sans révéler
lequel des deux, et propose la marche à suivre. Il s'inscrit dans un emplacement réservé sous le mot
de passe, vide par défaut : la page ne bouge pas d'un pixel entre l'état normal, l'erreur et la
vérification, et l'aide pour les étudiants qui arrivent de Moodle reste en bas dans les trois.
Pendant la vérification, le bouton garde sa place, sa taille et sa couleur ; une roue remplace son
icône et il dit « Connexion en cours ». Les champs restent tels quels, le compte université est
atténué, et l'emplacement du message annonce l'attente aux lecteurs d'écran.

Sur téléphone, la couverture garde le logo, l'accroche, la phrase qui dit ce qu'est PLaTon et le
lien vers la présentation, avec les mêmes mots que sur ordinateur ; l'aide pour les étudiants qui
arrivent de Moodle aussi. Le bouton du compte université garde le même libellé. L'erreur s'y
comporte comme sur ordinateur : même emplacement réservé sous le mot de passe, même message, rien
ne bouge, et l'aide Moodle reste en bas. La maquette montre Inès, qui a tapé son identifiant
université dans les champs du compte PLaTon, le cas que le message oriente vers le bouton du haut.
Les champs et le bouton qui affiche le mot de passe font 44 px.

Ce qui reste hors de cet écran : l'invitation d'un candidat (lien reçu par courriel, flow `tests`),
l'accès de démonstration (lien d'un enseignant), et la connexion depuis une application externe
(`callbackUrl`), qui affiche en plus une étape « Continuer sur X en tant que ... ».

## Rules

- le compte de l'établissement vient avant le mot de passe ; s'il y a plusieurs CAS, un bouton
  par établissement, nommé par l'établissement
- le message d'erreur ne dit pas lequel du nom ou du mot de passe est faux
- le bouton de connexion reste actif : la validation se fait à l'envoi, pas en amont
- l'erreur s'écrit dans un emplacement réservé sous les champs, qui annonce aussi l'attente aux
  lecteurs d'écran : la mise en page est identique dans tous les états, et l'aide Moodle ne
  disparaît jamais
- un bouton qui travaille garde sa place, sa taille et sa couleur, montre une roue à la place de
  son icône et dit ce qu'il fait (« Connexion en cours »)
- l'accroche, la phrase qui dit ce qu'est PLaTon, le lien vers la présentation et l'aide Moodle
  sont présents sur ordinateur comme sur téléphone, avec les mêmes mots ; l'erreur aussi, au même
  endroit et dans les mêmes mots
- sur téléphone, les champs et le bouton qui affiche le mot de passe sont des cibles de 44 px
- l'accroche de la couverture est le titre de niveau 1 de la page
- la vidéo de présentation n'est pas sur la page, elle est un lien
- aucun texte en anglais

spec:
  screens:
    - { id: connexion, states: [default, error, loading] }
  edges:
    - { from: connexion, to: accueil-etudiant, on: signin }
    - { from: connexion, to: accueil-enseignant, on: signin }
