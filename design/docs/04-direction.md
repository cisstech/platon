# Direction : règles d'écran

`design.md` fixe les couleurs, la typographie et les formes. Ce document fixe le comportement.

## Principes

1. **L'action avant le chiffre.** Un écran dit d'abord ce qu'il y a à faire. Les chiffres viennent
   ensuite, seulement ceux qui aident à décider.
2. **Un bouton quand il y a quelque chose à faire.** Une ligne qui va bien se clique ; un bouton
   n'apparaît que pour une action attendue (« Programmer », « Corriger »).
3. **Un état honnête.** Vide, chargement, erreur : chacun a sa forme. Une erreur n'est jamais
   affichée comme un vide.
4. **La densité suit le travail.** Un énoncé a de l'air (72 caractères par ligne). Une liste de
   300 copies est dense (lignes de 44 px).
5. **Le même geste, la même forme.** Une action principale par surface, toujours au même endroit.

## Navigation

À gauche, la **couverture** : barre sombre de 240 px, prune du logo. À droite, la **page**, claire.
Pas de barre supérieure sur bureau.

De haut en bas : logo et établissement ; **Créer** (enseignant, admin) ; la navigation ; en bas
Documentation (enseignant), Notifications, profil. L'élément actif est un **intercalaire** : il
prend la couleur de la page et la rejoint, comme l'onglet d'un classeur.

| Élève | Enseignant | Admin |
| --- | --- | --- |
| Accueil | Accueil | Accueil |
| Annonces | Annonces | Annonces |
| Cours | Cours | Cours |
| Corrections, s'il corrige | Corrections, avec le nombre en attente | Corrections |
| | Ressources | Ressources |
| | Tests d'entrée | Tests d'entrée |
| | | Administration |

- « Espace de travail » s'appelle **Ressources**.
- **Créer** ouvre : Cours, Exercice (modèle ou PLE), Activité (PLA), et Cercle pour l'admin.
- **Profil** : Mon compte, Mon cercle (enseignant), thème, déconnexion.
- **Mobile** : barre de 56 px dans la couverture (menu, titre, notifications) ; la couverture
  glisse depuis la gauche.
- La couverture a son action (Créer), la page la sienne (à droite du titre). Jamais deux boutons
  primaires sur une même surface.

## Gabarit de page

1. Fil d'Ariane, à partir du deuxième niveau
2. Titre, action principale à droite sur la même ligne
3. Une ligne de description, puis les chiffres clés en petit (effectifs, date)
4. Onglets collés au bas de l'en-tête

Largeurs : 1200 px pour les listes, 760 px pour les formulaires. Marges : 32 px sur bureau, 16 px
sur mobile.

## États

| État | Règle |
| --- | --- |
| Chargement | Rien avant 300 ms, puis un squelette à la forme du contenu. Message à 10 s, erreur à 30 s. Un bouton qui travaille garde son libellé et affiche un indicateur. |
| Vide, rien encore | Dire pourquoi et quelle action le remplit, avec l'illustration « copie vierge ». |
| Vide, aucun résultat | Rappeler la recherche, nommer le filtre qui écarte des résultats, proposer de le retirer. |
| Erreur de zone | Message court, cause si connue, « Réessayer » ; le reste de la page marche. |
| Erreur de page | Titre humain, cause, deux sorties, code d'erreur en petit. |
| Erreur de champ | Sous le champ, à l'envoi puis à chaque correction. |

## Retours d'action

| Action | Retour |
| --- | --- |
| Enregistrer | Toast de 4 s en bas à gauche |
| Créer | On arrive sur l'objet créé |
| Supprimer | En place pour une ligne ; dialogue qui nomme l'objet pour un cours, un cercle, une activité notée ; « Annuler » 8 s si c'est réversible |
| Valider une réponse | Le résultat s'inscrit dans la marge de la copie, pas de toast |
| Copier | Le bouton dit « Copié » 2 s |

`DialogService` garde ses méthodes et produit ces retours.

## Mouvement

- Survol, focus : 120 ms. Menus : 180 ms depuis le déclencheur. Dialogues et panneaux : 260 ms.
- Courbe `cubic-bezier(0.2, 0, 0, 1)` en entrée.
- `prefers-reduced-motion` coupe tout.

## Moments de joie

Rares, donc précieux :

- **Activité terminée** : la barre se remplit, puis prend le dégradé du logo.
- **Cours terminé** : la mention « Cours terminé » en dégradé, une fois.
- **Classement** : un podium pour les trois premiers d'un challenge.
- **Première connexion** : une bienvenue au nom de la personne.

Une bonne réponse n'est pas une fête : c'est une information, verte, dans la marge.

## Accessibilité

- Contraste AA partout. Le texte secondaire le plus clair (`subtle`) est à 5 pour 1 sur le fond.
- Anneau de focus de 2 px sur tout élément interactif, lien d'évitement vers le contenu.
- Cibles de 36 px sur bureau, 44 px sur tactile.
- Un bouton à icône seule a un libellé accessible et une bulle.
- Une couleur d'état a toujours un mot ou une icône.
- Clavier : `/` pour chercher, `Échap` pour fermer, `J` et `K` entre les copies.

## Thème sombre

Mêmes rôles, valeurs inversées, mêmes seuils de contraste : fond `#141317`, surface `#1a191d`,
texte graphite 100, primaire encre 300 avec texte sombre. L'éditeur de code garde son thème.

## Ton

- Vouvoiement partout, lecteur compris (il tutoie aujourd'hui : « Demande le code à ton
  enseignant »).
- Boutons à verbe (« Ajouter une activité »). Dates relatives quand elles aident, absolues dans
  les tableaux. Virgule décimale. Pas d'excuse ni de point d'exclamation dans une erreur.
