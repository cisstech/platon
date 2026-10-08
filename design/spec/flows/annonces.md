# annonces

Les annonces de la plateforme : une liste avec recherche et le détail de l'annonce choisie, comme
aujourd'hui. Une annonce nouvelle apparaît en bandeau sur l'accueil, qu'on lit ou qu'on ferme ;
elle n'interrompt plus la connexion par une fenêtre.

Le 28 septembre, Inès voit les quatre annonces de la plateforme, de la plus récente à la plus
ancienne : « Les corrections détaillées arrivent » (27 septembre, pour les étudiants, non lue),
« Maintenance le 4 octobre » (25 septembre, pour tout le monde : PLaTon sera indisponible le
dimanche 4 octobre de 7 h à 9 h), « Nouveau : le lecteur d'exercices » (12 septembre, pour les
étudiants) et « Rentrée 2026 » (28 août, pour tout le monde). Le détail dit qui l'a publiée, quand,
et pour qui.

Chaque annonce dit sa nature par une icône neutre, en graphite : la maintenance porte
`construction`, parce qu'elle parle de la disponibilité du service ; c'est une information, pas
une alerte. Une annonce de disponibilité du service passe avant toute autre dans le bandeau de
l'accueil, chez Inès comme chez Karim : le 28 septembre, c'est elle qu'Inès ouvre par « Lire
l'annonce ». La liste, elle, reste dans l'ordre des
dates, et « Les corrections détaillées arrivent » y reste non lue, comme dans les notifications.

Sur téléphone, la liste et le détail ne tiennent pas côte à côte : chaque annonce s'ouvre en place,
sous son titre. Arrivée par « Lire l'annonce », la page s'ouvre sur l'annonce du bandeau.

## Rules

- un bandeau fermé ne revient pas pour la même annonce
- la recherche porte un libellé, au moins pour les lecteurs d'écran
- le titre de l'annonce ouverte suit l'échelle de la page (title, 22 px sur ordinateur)
- une annonce non lue se signale par un point et, pour les lecteurs d'écran, par « Non lue »
- la liste est triée de la plus récente à la plus ancienne ; chaque annonce porte l'icône neutre
  de sa nature, `construction` pour une annonce sur la disponibilité du service
- le bandeau de l'accueil montre une seule annonce non lue, et une annonce sur la disponibilité du
  service passe avant toute autre
- le détail dit la date, l'auteur et le public de l'annonce
- sur téléphone, une annonce s'ouvre en place ; son titre est un bouton de 44 px qui dit s'il est
  ouvert ou fermé

spec:
  screens:
    - { id: annonces, states: [default] }
  edges:
    - { from: annonces, to: accueil-etudiant, on: home }
