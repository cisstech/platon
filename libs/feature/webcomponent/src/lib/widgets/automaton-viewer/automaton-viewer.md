Le composant AutomatonViewer permet de visualiser des automates finis (machines à états) de manière interactive et claire. Ce composant est particulièrement utile pour les cours d'informatique théorique, de théorie des langages ou de compilation, où la représentation visuelle des automates aide à comprendre les concepts fondamentaux.

### Propriété principale

- **automaton**: Définit l'automate à afficher. Cette propriété accepte deux formats différents pour plus de flexibilité.

### Formats acceptés

#### Format objet

Utilisez ce format pour une intégration programmatique plus structurée:

```typescript
{
    "alphabet": string[],          // Symboles reconnus par l'automate
    "initialStates": string[],     // États initiaux de l'automate
    "acceptingStates": string[],   // États terminaux/acceptants
    "states": string[],            // Liste complète des états
    "transitions": {               // Liste des transitions entre états
        fromState: string,         // État de départ
        toState: string,           // État d'arrivée
        symbols: string[]          // Symboles déclenchant la transition
    }[]
}
```

#### Format texte

Format plus compact et lisible pour une définition manuelle:

```plaintext
#states
s0
s1
s2
...
#initials
s0
s1
...
#accepting
s2
#alphabet
a
b
c
...
#transitions
s0:a>s1         // De s0 à s1 avec le symbole a
s1:a,c>s1       // De s1 à s1 avec les symboles a ou c
s1:b>s2         // De s1 à s2 avec le symbole b
```

### Rendu visuel

Le composant génère automatiquement une représentation graphique de l'automate avec:

- Les états représentés par des cercles
- Les états initiaux marqués par une flèche entrante
- Les états acceptants par un double cercle
- Les transitions par des flèches étiquetées avec les symboles correspondants

### Exemple d'utilisation

```typescript
// Définition d'un automate reconnaissant les mots se terminant par 'b'
{
  automaton: `
    #states
    s0
    s1
    #initials
    s0
    #accepting
    s1
    #alphabet
    a
    b
    #transitions
    s0:a>s0
    s0:b>s1
    s1:a>s0
    s1:b>s1
  `
}
```

> **Note**: Lors de la communication avec le grader, l'automate est toujours converti au format objet, quel que soit le format utilisé dans le composant.
