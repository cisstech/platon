Le composant JSX intègre la puissance de la bibliothèque [JSXGraph](https://jsxgraph.uni-bayreuth.de) pour créer des constructions géométriques interactives. Cette intégration offre de nombreuses possibilités pour l'enseignement des mathématiques, de la géométrie, et des sciences physiques.

### Construction de figures dynamiques

Le cœur du composant est la propriété `script`, qui contient le code JavaScript nécessaire pour construire votre figure géométrique. Ce script est automatiquement exécuté avec une variable `board` préconfigurée, représentant la zone de dessin interactive.

**Exemple de construction basique:**

```typescript
const grid = board.create('grid', [], { gridX: 0.25, gridY: 0.25 })
const Ox = board.create(
  'axis',
  [
    [0, 0],
    [1, 0],
  ],
  { ticks: { visible: false } }
)
const Oy = board.create(
  'axis',
  [
    [0, 0],
    [0, 1],
  ],
  { ticks: { visible: false } }
)
const circle = board.create(
  'circle',
  [
    [0, 0],
    [0, 1],
  ],
  { strokeColor: 'blue', fixed: true }
)
const O = board.create('point', [0, 0], {
  size: 1,
  name: 'O',
  color: 'black',
  fixed: true,
})
const A = board.create('point', [1, 0], {
  size: 1,
  name: 'A',
  color: 'black',
  fixed: true,
})
const M = board.create('glider', [1, 1, circle], {
  size: 2,
  name: 'M',
  color: 'red',
})
const secOAM = board.create('sector', [O, A, M], { color: 'orange' })
```

La [documentation officielle de JSXGraph](https://jsxgraph.org/docs/) détaille toutes les possibilités de création (points, lignes, courbes, polygones, etc.) et leurs options associées.

### Personnalisation de l'environnement

La propriété `attributes` vous permet de configurer l'environnement JSXGraph selon vos besoins. Ces options correspondent aux paramètres de la méthode `initBoard` et incluent notamment:

La définition des limites du repère (`boundingbox`)
L'activation/désactivation des fonctionnalités de navigation (zoom, panoramique)
Les options d'affichage des axes et de la grille

### Suivi des interactions apprenant

Une fonctionnalité essentielle pour l'évaluation est la propriété `points`, qui capture automatiquement les coordonnées des objets de type "point" présents dans la figure. Ce dictionnaire est actualisé en temps réel lorsque l'apprenant manipule les éléments interactifs:

```typescript
// Structure de la propriété 'points'
{
   "A": {x: 1.2, y: 0.8},    // Point A déplacé par l'apprenant
   "B": {x: -0.5, y: 1.4},   // Point B déplacé par l'apprenant
   "O": {x: 0, y: 0}         // Point O non modifié
}
```

Cette propriété est particulièrement utile dans votre script d'évaluation (grader) pour vérifier si l'apprenant a correctement positionné les éléments de la figure.

Cette propriété est particulièrement utile dans votre script d'évaluation (grader) pour vérifier si l'apprenant a correctement positionné les éléments de la figure.

### Applications pédagogiques

Le composant JSX est parfaitement adapté pour:

- L'étude des propriétés géométriques
- La visualisation de concepts mathématiques
- La création de simulations physiques interactives
- L'exploration de lieux géométriques et transformations
