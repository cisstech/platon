# annonces

Les annonces de la plateforme : une liste avec recherche et le détail de l'annonce choisie, comme
aujourd'hui. Une annonce nouvelle apparaît en bandeau sur l'accueil, qu'on lit ou qu'on ferme ;
elle n'interrompt plus la connexion par une fenêtre.

## Rules

- un bandeau fermé ne revient pas pour la même annonce

spec:
  screens:
    - { id: annonces, states: [default] }
  edges:
    - { from: annonces, to: accueil-etudiant, on: home }
