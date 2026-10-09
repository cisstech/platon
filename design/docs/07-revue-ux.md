# Revue UX

La première passe gardait toutes les fonctions telles quelles. Celle-ci réorganise, sans rien
inventer côté données. Chaque changement est marqué dans les annotations de l'écran.

## Ce qui a changé, et pourquoi

| Écran                | Avant                                       | Après                                          | Pourquoi                                                             |
| -------------------- | ------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| Navigation élève     | Corrections pour tout le monde              | Seulement pour qui corrige                     | La page ne liste que les corrections assignées : vide pour une élève |
| Annonces             | Fenêtre à la connexion                      | Bandeau sur l'accueil                          | On vient pour rendre un TP, pas pour lire une fenêtre                |
| Page d'un cours      | Quatre compteurs à droite                   | Compteurs dans l'en-tête, « À faire » à droite | La colonne doit dire quoi faire, pas répéter des chiffres            |
| Lignes d'activité    | Trois contrôles par ligne                   | Un bouton seulement si une action est attendue | Quinze « Suivre » identiques ne guident personne                     |
| Cours neuf           | Page vide                                   | Trois étapes : activité, élèves, partage       | C'est le moment où Karim décroche                                    |
| Ajouter une activité | Seulement des activités déjà écrites en PLA | Ou composer avec des exercices                 | Assembler trois exercices ne doit pas demander l'éditeur             |
| Page ressource       | Dix chiffres de même poids                  | Quatre en tête, six repliables                 | Une hiérarchie, même donnée                                          |
| Ressources           | Pas d'action principale                     | Créer un exercice                              | Toute page a une action principale                                   |
| Accueil enseignant   | Phrases de métadonnées sur deux lignes      | Une information par emplacement                | Lisible d'un coup d'œil                                              |
| Lecteur              | Titre et contenu d'exercice incohérents     | Alignés, largeurs de réponse alignées          | Détail, mais c'est la copie                                          |

## Accessibilité

- `subtle` passe de 3,9 à 5 pour 1 sur le fond (AA pour les petits textes).
- Anneau de focus sur tout élément interactif, lien « Aller au contenu ».
- `prefers-reduced-motion` respecté.
- Les graphiques ont un texte alternatif qui dit la tendance.

## Parcours vérifiés

| Qui    | Parcours                                              | Écrans                                                  |
| ------ | ----------------------------------------------------- | ------------------------------------------------------- |
| Inès   | Voir ce qui est à rendre, reprendre, finir            | etudiant, intro, exercice, conclusion                   |
| Karim  | Créer un exercice sans code et le donner à ses élèves | modeles, atelier, enregistrer, ajouter-au-cours, detail |
| Karim  | Monter un TP à partir d'exercices existants           | detail, ajouter, ajouter-composer, ajouter-fonction     |
| Karim  | Savoir où ses élèves bloquent                         | detail, suivi                                           |
| Karim  | Démarrer un cours                                     | nouveau, detail (vide), membres-ajouter, partager       |
| Hélène | Trouver, vérifier, réutiliser un exercice             | catalogue, filtres, ressource                           |
| Julien | Corriger une épreuve                                  | file, copie                                             |
| Sophie | Gérer comptes et connexions                           | utilisateurs, lms, cas                                  |

## Reste ouvert

1. Teinte des cours : un champ `colorHue` sur `Course`, ou la teinte dérivée de l'id.
2. Composer une activité et Ajouter à un cours créent des ressources dans le cercle personnel :
   faut-il les ranger dans un dossier dédié pour ne pas l'encombrer ?
3. Le mobile enseignant n'est pas dessiné. L'usage réel est-il assez fort pour le faire ?
