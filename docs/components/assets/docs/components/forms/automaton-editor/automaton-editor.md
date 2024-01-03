La propriété `automaton` accepte 2 formats:

### Format objet

```typescript
{
    "alphabet": string[],
    "initialStates": string[],
    "acceptingStates": string[],
    "states": string[],
    "transitions": { fromState: string, toState: string, symbols: string[] }[]
}
```

### Format chaîne

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

:::+ warning Grader
Le format envoyé au grader est toujours le format objet.
:::
