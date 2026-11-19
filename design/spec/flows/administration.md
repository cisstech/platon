# administration

Sophie administre la plateforme. Ses six onglets sont ceux d'aujourd'hui : Utilisateurs, Groupes,
LMS, CAS, Tags, Annonces. Rien n'est ajouté ; tout est remis en forme avec les composants du
reste de l'application (tableaux, tiroirs, dialogues).

Utilisateurs : recherche, filtres de rôle et de statut, ajout d'un compte hors CAS avec mot de
passe généré, changement de rôle et désactivation depuis la ligne. Groupes : les groupes de la
plateforme, qu'un enseignant ajoute d'un coup à un cours. LMS et CAS : les connexions LTI et les
serveurs d'authentification, chacun devenant un bouton de connexion. Tags : topics et niveaux,
avec la détection des doublons proches. Annonces : rédaction, cible, durée, publication.

## Rules

- désactiver un compte dit ce qui reste (cours, ressources) et ne se fait pas sur son propre compte
- un mot de passe généré est affiché une seule fois, avec de quoi le copier
- un tag proche d'un tag existant propose d'abord l'existant

spec:
  screens:
    - { id: utilisateurs, states: [default] }
    - { id: utilisateur-actions, overlay: true, states: [default] }
    - { id: utilisateur-nouveau, overlay: true, states: [default] }
    - { id: groupes-plateforme, states: [default] }
    - { id: groupe-plateforme, overlay: true, states: [default] }
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
    - { from: utilisateurs, to: groupes-plateforme, on: tab }
    - { from: utilisateurs, to: lms, on: tab }
    - { from: utilisateurs, to: cas, on: tab }
    - { from: utilisateurs, to: tags, on: tab }
    - { from: utilisateurs, to: annonces-admin, on: tab }
    - { from: utilisateur-actions, to: utilisateurs, on: dismiss }
    - { from: utilisateur-nouveau, to: utilisateurs, on: dismiss }
    - { from: groupes-plateforme, to: groupe-plateforme, on: open }
    - { from: groupe-plateforme, to: groupes-plateforme, on: dismiss }
    - { from: lms, to: lms-nouveau, on: create }
    - { from: lms-nouveau, to: lms, on: dismiss }
    - { from: cas, to: cas-nouveau, on: create }
    - { from: cas-nouveau, to: cas, on: dismiss }
    - { from: tags, to: tag-similaire, on: create }
    - { from: tag-similaire, to: tags, on: dismiss }
    - { from: annonces-admin, to: annonce-edition, on: create }
    - { from: annonce-edition, to: annonces-admin, on: dismiss }
