# compte

Mon compte garde ses deux onglets. À propos montre l'identité (non modifiable ici, elle vient de
l'établissement ou de l'administration), les centres d'intérêt (topics et niveaux) et
l'identifiant Discord, verrouillé par défaut. Sécurité crée ou change le mot de passe local, avec
les règles vérifiées pendant la saisie.

## Rules

- ce qui ne se modifie pas n'a pas l'air d'un champ
- les règles du mot de passe se cochent pendant la saisie, pas à l'envoi

spec:
  screens:
    - { id: a-propos, states: [default] }
    - { id: securite, states: [default] }
  edges:
    - { from: a-propos, to: securite, on: tab }
    - { from: securite, to: a-propos, on: tab }
