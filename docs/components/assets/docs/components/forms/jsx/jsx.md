Ce composant est basé sur la librarie [JSXGraph](https://jsxgraph.uni-bayreuth.de/wp/index.html).

### La propriété `attributes`

Cette propriété correspond [aux options de configuration](https://jsxgraph.org/docs/symbols/JXG.JSXGraph.html#.initBoard) de JSX .

### La propriété `points`

Un dictionnaire dont les clés sont des noms de points
présents sur JSX et les valeurs aux coordonnées de ces points.

Exemple:

```typescript
{
   "O": {
      "x": 0,
      "y": 0
    },
    "A": {
      "x": 1,
      "y": 0
    },
    "M": {
      "x": 0.5371225299514013,
      "y": 0.8435042310614725
    }
}
```

### La propriété `script`

Une chaine de caractère correspondant au script javascript d'initialisation de JSX.
Le script est exécuté avec une variable `board` en paramètre. Cette variable correspondant à l'objet renvoyé par la
méthode [initBoard](https://jsxgraph.org/docs/symbols/JXG.JSXGraph.html#.initBoard) de JSX.

Exemple:

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
