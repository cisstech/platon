# compte

Mon compte garde ses deux onglets. À propos montre l'identité (non modifiable ici, elle vient de
l'établissement ou de l'administration), les centres d'intérêt (topics et niveaux) et
l'identifiant Discord, verrouillé par défaut. Sécurité crée ou change le mot de passe local, avec
les règles vérifiées pendant la saisie.

Sur téléphone, Inès arrive à Mon compte par le menu du profil. Les deux onglets restent en tête ;
les cartes s'empilent, l'identité se lit de haut en bas (le libellé, puis la valeur, pour qu'une
adresse longue ne déborde pas), les champs et les boutons font 44 px et Enregistrer prend toute la
largeur.

## Rules

- ce qui ne se modifie pas n'a pas l'air d'un champ
- les règles du mot de passe se cochent pendant la saisie, pas à l'envoi
- l'identité dit le type de compte (« Compte étudiant », « Compte enseignant »), comme sous le nom
  dans la barre latérale, jamais un genre que la plateforme ne connaît pas, jamais « Élève »
- chaque champ a un libellé visible relié au champ, sur ordinateur comme sur téléphone (`for` et
  `aria-labelledby` sur les champs composés)
- sur téléphone, l'identité se lit de haut en bas, les champs et Enregistrer sont des cibles de
  44 px
- l'adresse affichée est la même partout (menu du profil, Mon compte)
- une puce qu'on peut retirer porte un vrai bouton, qui nomme ce qu'il retire (« Retirer le topic Python »)
- la connexion par l'établissement s'appelle « compte université », comme sur la page de connexion

spec:
  screens:
    - { id: a-propos, states: [default] }
    - { id: securite, states: [default] }
  edges:
    - { from: a-propos, to: securite, on: tab }
    - { from: securite, to: a-propos, on: tab }
