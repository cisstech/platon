Le composant Picker vous offre un menu déroulant élégant et facile à utiliser pour les situations où l'apprenant doit sélectionner une option parmi une liste prédéfinie. C'est la solution idéale quand l'espace est limité ou quand vous souhaitez restreindre les choix à un ensemble précis de valeurs.

### Fonctionnement de base

La valeur actuellement sélectionnée est définie par la propriété `selection`, qui doit correspondre à l'une des valeurs présentes dans le tableau `items`. Si aucune sélection n'est spécifiée, le menu affichera par défaut le texte indicatif défini dans `placeholder`.

### Amélioration de l'expérience utilisateur

#### Ajouter des icônes indicatives

Pour améliorer la compréhension ou guider visuellement l'apprenant, vous pouvez ajouter des icônes à votre composant:

- **Icône de début** (`prefix`): apparaît à gauche du sélecteur
- **Icône de fin** (`suffix`): apparaît à droite du sélecteur

Ces icônes sont définies avec la syntaxe: `bibliothèque nom-icône [color=CODE_COULEUR]`

Par exemple:

- `fontawesome check` affiche une icône de validation
- `clarity filter color=3366FF` affiche une icône de filtre en bleu

Vous trouverez la bibliothèque complète des icônes disponibles sur [icongr.am](https://icongr.am).

#### Contexte supplémentaire

Utilisez la propriété `hint` pour fournir une indication complémentaire qui apparaîtra sous le sélecteur. Cette indication peut être utile pour clarifier ce que l'apprenant doit sélectionner ou pour donner un indice sur la réponse attendue.

### Applications pédagogiques

Le Picker est particulièrement utile pour:

- Sélection de catégories ou classifications
- Choix d'unités de mesure
- Sélection d'éléments dans une nomenclature
- Navigation entre différentes parties d'un exercice
- Exercices où l'ordre des options présentées est important
