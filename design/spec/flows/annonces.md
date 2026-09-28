# annonces

Les annonces de la plateforme : une liste avec recherche et le détail de l'annonce choisie, comme
aujourd'hui. Une annonce nouvelle et ciblée s'ouvre dans une fenêtre après la connexion.

## Rules

- la fenêtre d'annonce se ferme en un geste et ne revient pas pour la même annonce

spec:
  screens:
    - { id: annonces, states: [default] }
    - { id: annonce-nouvelle, overlay: true, states: [default] }
  edges:
    - { from: annonces, to: annonce-nouvelle, on: new }
    - { from: annonce-nouvelle, to: annonces, on: open }
    - { from: annonce-nouvelle, to: accueil-etudiant, on: dismiss }
