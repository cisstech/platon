# accueil-etudiant

L'accueil d'Inès répond à une question : qu'est-ce que je dois faire, et pour quand. En tête, la
dernière annonce si elle n'a pas été lue. Puis « À faire » : les activités ouvertes de tous ses
cours, triées par échéance, avec l'avancement et un bouton qui dit ce qu'il fait (Commencer,
Reprendre). Puis « Bientôt » : ce qui ouvre dans les jours qui viennent, pour qu'un contrôle noté ne
la prenne pas par surprise. Puis « Résultats récents », avec l'accès aux corrections disponibles.

À droite, ses cours avec leur avancement, et trois chiffres sur tous ses cours (moyenne, réussite,
temps passé), ceux que calcule déjà le tableau de bord utilisateur.

Le chemin heureux : Inès ouvre PLaTon, voit que le quiz de complexité ferme ce soir, clique sur
Reprendre et arrive dans le lecteur, sur l'exercice où elle s'était arrêtée.

Sans cours, l'accueil explique comment un cours apparaît (inscription depuis Moodle ou lien de
l'enseignant) plutôt que d'afficher des zéros. Pendant le chargement, le squelette a la forme des
listes qu'il annonce.

Les surcouches du cadre sont décrites ici parce que l'étudiant y accède depuis son accueil :
notifications, menu du profil et, sur mobile, le panneau de navigation. L'enseignant retrouve les
mêmes.

## Rules

- « À faire » est trié par échéance ; une activité sans échéance passe après celles qui en ont une
- une échéance à moins de 24 h est marquée « attention » ; une échéance dépassée pour une activité
  encore ouverte est marquée « correction » avec le mot « En retard »
- une activité notée porte la mention « Notée », sa durée et son nombre de tentatives avant même
  d'être ouverte
- le bouton d'une ligne dit l'action : Commencer (rien fait), Reprendre (commencée), Voir mes
  résultats (terminée)
- « Résultats récents » montre la note et, s'il y en a une, le lien vers la correction
- l'état vide ne montre aucun chiffre

spec:
  screens:
    - { id: etudiant, states: [default, empty, loading] }
    - { id: notifications, overlay: true, states: [default] }
    - { id: profil, overlay: true, states: [default] }
    - { id: navigation, overlay: true, states: [default] }
  edges:
    - { from: etudiant, to: lecteur, on: start }
    - { from: etudiant, to: cours, on: open }
    - { from: etudiant, to: notifications, on: open }
    - { from: etudiant, to: profil, on: open }
    - { from: etudiant, to: navigation, on: menu }
    - { from: notifications, to: etudiant, on: dismiss }
    - { from: notifications, to: lecteur, on: open }
    - { from: profil, to: etudiant, on: dismiss }
    - { from: profil, to: compte, on: open }
    - { from: profil, to: connexion, on: logout }
    - { from: navigation, to: etudiant, on: dismiss }
    - { from: navigation, to: cours, on: nav }
