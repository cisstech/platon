Le composant GraphViewer permet de visualiser des graphes et diagrammes à partir d'une description textuelle utilisant la syntaxe DOT de Graphviz. Cette approche facilite la représentation visuelle de structures relationnelles complexes sans avoir à manipuler directement des éléments graphiques.

### Propriété principale

- **graph**: Description du graphe au format DOT (langage de description de Graphviz)

### Syntaxe de base

Le format DOT permet de définir facilement différents types de graphes:

#### Graphe non orienté

```dot
graph G {
    A -- B;
    B -- C;
    C -- D;
    D -- A;
}
```

#### Graphe orienté (digraph)

```dot
digraph G {
    A -> B;
    B -> C;
    C -> D;
    D -> A;
}
```

### Personnalisation visuelle

Vous pouvez personnaliser l'apparence des nœuds et des arêtes:

```dot
digraph G {
    // Styles globaux
    node [shape=box, style=filled, color=lightblue];
    edge [color=gray];

    // Nœuds spécifiques
    racine [shape=ellipse, color=gold, label="Racine"];

    // Relations
    racine -> A [label="lien", style=dashed];
    A -> B [color=red];
    A -> C [color=blue];
}
```

### Structures avancées

#### Sous-graphes

```dot
digraph G {
    subgraph cluster_0 {
        label = "Groupe 1";
        A; B; C;
    }

    subgraph cluster_1 {
        label = "Groupe 2";
        D; E;
    }

    A -> D;
    B -> E;
}
```

#### Arbre binaire

```dot
digraph arbre {
    racine -> gauche;
    racine -> droite;
    gauche -> gauche_gauche;
    gauche -> gauche_droite;
    droite -> droite_gauche;
    droite -> droite_droite;
}
```

### Applications pédagogiques

Le composant GraphViewer est idéal pour:

- Illustrer des structures de données (arbres, graphes, réseaux)
- Représenter des algorithmes de parcours
- Visualiser des relations conceptuelles
- Montrer des organigrammes ou workflows
- Présenter des automates à états finis
- Illustrer des hiérarchies ou des dépendances

### Ressources pour approfondir

- [Guide complet de la syntaxe DOT](https://graphviz.org/doc/info/lang.html)
- [Tutoriel Graphviz en français](https://cyberzoide.developpez.com/graphviz/)
- [Galerie d'exemples Graphviz](https://graphviz.org/gallery/)

La puissance du langage DOT permet de créer rapidement des visualisations complexes à partir d'une description textuelle simple, facilitant ainsi l'intégration de schémas dynamiques dans vos ressources pédagogiques.
