Le format des éléments du tableau `content` est le suivant :

```typescript
content = [
  {
    name: string,        // Nom du test effectué
    description: string, // Description du test effectué (optionel)
    expected: string,    // Valeur attendue par le professeur
    obtained: string,    // Valeur obtenue par l'étudiant
    arguments: string,   // Arguments passés à l'execution (optionel)
    display: boolean,    // Affichage (le feedback est-il déplié ?), default: false
    type: 'success' | 'info' | 'warning' | 'error', // Type de feedback, default: info
  },

  ...

]
```
