Le composant Matrix vous permet d'afficher et de manipuler des tableaux de données sous forme matricielle. Idéal pour les exercices de mathématiques, d'algèbre linéaire ou tout autre contexte nécessitant une disposition tabulaire interactive.

### Structure des données

Une matrice est représentée par un tableau unidimensionnel `cells` qui stocke toutes les cellules ligne par ligne. Pour une matrice de dimensions `rows × cols`, la cellule à la position (i, j) se trouve à l'index `i * cols + j` dans ce tableau.

Chaque cellule peut être définie de deux façons:

1. **Format simple**: une chaîne représentant directement la valeur

   ```js
   '42' // Une cellule contenant la valeur 42
   ```

2. **Format complet**: un objet avec des propriétés configurables
   ```js
   {
     "value": "42",         // Valeur affichée dans la cellule (obligatoire)
     "css": "highlight",    // Classes CSS pour le style (optionnel)
     "disabled": true       // Pour rendre la cellule non-éditable (optionnel)
   }
   ```

### Adaptation automatique

Si votre tableau `cells` ne contient pas suffisamment d'éléments pour remplir toute la matrice (moins que `rows × cols`), le composant complétera automatiquement les cellules manquantes avec la valeur `"0"`.

### Redimensionnement

La propriété `resizable` permet aux utilisateurs de modifier les dimensions de la matrice en ajoutant ou supprimant des lignes et des colonnes. Cette fonctionnalité est particulièrement utile pour les exercices où la taille de la solution n'est pas fixe à l'avance.

### Applications pédagogiques

Ce composant est parfaitement adapté pour:

- Des calculs matriciels (addition, multiplication, déterminant)
- La résolution de systèmes d'équations
- L'implémentation d'algorithmes sur des tableaux 2D
- La saisie de données dans des tableaux structurés
