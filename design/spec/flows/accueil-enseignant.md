# accueil-enseignant

L'accueil de Karim sert à piloter, en quatre zones. En tête, « En cours » : les activités ouvertes
de ses cours qui suivent leurs dates, avec l'échéance, la part des étudiants qui ont commencé et la
moyenne provisoire ; chaque ligne mène au suivi de l'activité, sans bouton, parce qu'il n'y a rien
à y faire. Puis « À faire » : ce qui attend un geste de sa part, chaque ligne avec le bouton qui le
nomme. Les copies qui lui sont confiées (« 2 copies à corriger sur 2 », Corriger), une activité
ouverte sans dates (Planifier), une épreuve planifiée à relire (Relire les réglages). Une ligne
discrète au pied de la liste dit où en sont les copies du cours qu'il ne corrige pas lui-même
(« les 14 copies de l'Examen partiel 1 sont confiées à Julien Lefèvre »).

Au-dessus des zones, sous le titre, le même bandeau que chez Inès : une seule annonce non lue, et
une annonce sur la disponibilité du service passe avant les autres. Le 28 septembre, c'est la
maintenance du dimanche 4 octobre, de 7 h à 9 h, adressée à tout le monde, avec l'icône
`construction` en graphite. Le bandeau fait partie de l'en-tête de la page : il ne compte pas comme
une cinquième zone, et il se ferme. L'état vide le montre aussi.

À droite, ses cours et « Vu récemment », la même liste que dans Ressources, dont l'accueil montre
les trois premiers : Recherche dichotomique (exercice, ce matin, Prêt), Parcours en largeur d'un
graphe (exercice, hier, Brouillon) et TP 4 : boucles et tableaux (activité, vendredi). Chaque
ressource dit ce qu'elle est, quand Karim l'a vue et, pour un exercice, son statut. Le sélecteur de modèles, qui
occupe tout l'accueil actuel, quitte l'accueil : le menu Créer y mène par Exercice, et l'état vide
le propose dans ses étapes.

Le 28 septembre, Karim lit : « Deux activités ferment cette semaine, 2 copies à corriger. » Le quiz
de complexité ferme ce soir, TP 4 jeudi ; Challenge : tris reste ouvert sans fermeture ; TP 5 est
ouvert sans dates, ce que la plateforme permet (une activité sans dates est ouverte). Pour un
entraînement comme TP 5, c'est une information neutre, avec Planifier à côté ; pour une épreuve
notée, ce serait une attention. Le 28 septembre à 10 h, Karim planifie TP 5 du lundi 5 octobre à
8 h au dimanche 11 octobre à 23 h 59 ; l'accueil montre TP 5 avant cet enregistrement.

Le bouton Créer, dans la barre latérale, ouvre un menu qui pose une seule question : quel objet
créer. Chaque entrée porte le glyphe PLaTon de l'objet (40 px) et le décrit en une ligne, en mots
simples, dans l'ordre où les objets s'emboîtent : le cours, l'activité, l'exercice. Un enseignant
qui découvre PLaTon apprend la différence sans quitter l'écran, et sans le jargon des fichiers
(PLE, PLA). L'entrée Exercice nomme les modèles (QCM, programme avec tests, texte à trous) et mène
à leur galerie.

Sans cours, l'accueil souhaite la bienvenue à Karim par son prénom, un des moments de joie de la
plateforme : la chaleur sur l'icône, une seule animation. La copie vierge dit que rien n'est encore
là, puis l'écran déroule les trois gestes qui rendent la plateforme utile : créer un cours, trouver
ou écrire un exercice, l'ajouter comme activité. Le premier est l'action principale.

## Rules

- l'accueil a au plus quatre zones : En cours, À faire, Mes cours, Vu récemment ; le bandeau
  d'annonce appartient à l'en-tête de la page et n'en est pas une
- le bandeau montre une seule annonce non lue ; une annonce sur la disponibilité du service passe
  avant toute autre, avec une icône neutre (`construction`), comme sur l'accueil étudiant
- « En cours » est trié par échéance, la plus proche en premier ; une ligne ouvre le suivi de
  l'activité et ne porte pas de bouton
- un bouton n'apparaît sur une ligne que s'il y a un geste à faire, et il le nomme (Corriger,
  Planifier, Relire les réglages)
- la participation s'écrit en clair (« 187 sur 302 ont commencé ») en plus de la barre, à la teinte
  du cours ; la moyenne d'une activité ouverte est dite provisoire
- « À faire » ne liste que les copies confiées à l'enseignant, avec le nombre à corriger sur le
  total (« 2 copies à corriger sur 2 ») ; les copies du cours confiées à un autre correcteur tiennent
  en une ligne discrète, sans action
- une activité ouverte sans dates est signalée « Ouverte, sans dates », avec Planifier : en
  information neutre pour un entraînement, en attention pour une épreuve notée ; une activité
  planifiée dit quand elle ouvre (« Ouvre le lundi 12 octobre à 8 h »)
- l'icône d'une activité dit sa forme (`quiz`, `code`) ; une épreuve notée prend `history_edu`, un
  challenge `emoji_events`
- « Vu récemment » est la liste de Ressources, dans le même ordre ; l'accueil en montre les trois
  premiers, chacun avec son type, le moment de la visite et, pour un exercice, son statut (Prêt
  `verified`, Brouillon `save`)
- le sous-titre ne dit que ce qui est vrai à la date du jour
- le menu Créer décrit chaque objet en mots simples, avec son glyphe ; aucun terme de format de
  fichier (PLE, PLA)
- le menu Créer ne propose Cercle qu'aux administrateurs
- l'état vide salue l'enseignant par son prénom, sans aucun chiffre

spec:
  screens:
    - { id: enseignant, states: [default, empty] }
    - { id: creer, overlay: true, states: [default] }
  edges:
    - { from: enseignant, to: creer, on: create }
    - { from: enseignant, to: activite, on: follow }
    - { from: enseignant, to: corrections, on: correct }
    - { from: enseignant, to: cours, on: open }
    - { from: enseignant, to: ressources, on: open }
    - { from: creer, to: enseignant, on: dismiss }
    - { from: creer, to: cours, on: create }
    - { from: creer, to: activite, on: create }
    - { from: creer, to: creation, on: create }
    - { from: enseignant, to: creation, on: template }
    - { from: enseignant, to: annonces, on: open }
