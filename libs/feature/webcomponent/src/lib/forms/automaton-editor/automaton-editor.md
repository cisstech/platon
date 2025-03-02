L'éditeur d'automates est un outil spécialisé qui permet aux apprenants de créer, manipuler et explorer des automates finis directement dans PLaTon. Il fournit une interface graphique intuitive où les états et transitions peuvent être ajoutés, déplacés et configurés visuellement.

### Formats de données acceptés

L'éditeur peut travailler avec deux formats de données différents:

#### 1. Format objet (structuré)

Ce format est particulièrement adapté lorsque vous manipulez programmatiquement l'automate:

```typescript
{
    "alphabet": string[],
    "initialStates": string[],
    "acceptingStates": string[],
    "states": string[],
    "transitions": { fromState: string, toState: string, symbols: string[] }[]
}
```

#### 2. Format chaîne (texte brut)

Ce format est plus lisible et peut être utilisé pour des spécifications manuelles:

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
s0:a>s1
s1:a,c>s1
s1:b>s2
```

> Le format envoyé au grader est toujours le format objet.
