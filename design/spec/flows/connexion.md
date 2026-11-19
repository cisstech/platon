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
lequel des deux, et propose la marche à suivre. Pendant la vérification, le bouton garde son libellé
et montre un indicateur ; les champs restent tels quels.

Ce qui reste hors de cet écran : l'invitation d'un candidat (lien reçu par courriel, flow `tests`),
l'accès de démonstration (lien d'un enseignant), et la connexion depuis une application externe
(`callbackUrl`), qui affiche en plus une étape « Continuer sur X en tant que ... ».

## Rules

- le compte de l'établissement vient avant le mot de passe ; s'il y a plusieurs CAS, un bouton
  par établissement, nommé par l'établissement
- le message d'erreur ne dit pas lequel du nom ou du mot de passe est faux
- le bouton de connexion reste actif : la validation se fait à l'envoi, pas en amont
- la vidéo de présentation n'est pas sur la page, elle est un lien
- aucun texte en anglais

spec:
  screens:
    - { id: connexion, states: [default, error, loading] }
  edges:
    - { from: connexion, to: accueil-etudiant, on: signin }
    - { from: connexion, to: accueil-enseignant, on: signin }
