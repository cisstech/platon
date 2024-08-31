Pour créer des feedbacks pliables, vous devez remplir le tableau `content` avec des
**feedbacks** et des **catégories** de feedbacks :

_Les deux types d'éléments peuvent coexister dans le même tableau_

<br>

- Pour créer des **feedbacks**, le format des éléments du tableau `content` est le suivant :

```typescript
content = [
  {
    name: string,        // Nom du test effectué
    description: string, // Description du test effectué, default: ''
    expected: string,    // Valeur attendue par le professeur, default: ''
    obtained: string,    // Valeur obtenue par l'étudiant, default: ''
    arguments: string,   // Arguments passés à l'execution, default: ''
    display: boolean,    // Affichage (le feedback est-il déplié ?), default: false
    type: 'success' | 'info' | 'warning' | 'error', // Type de feedback, default: info
  },

  ...

]
```

_Si les champs `description`, `expected`, `obtained` ou `arguments` ne sont pas définis (ou égaux à `''`),
ils ne s'afficheront pas dans le feedback_

<br>

- Pour créer des **catégories** de feedbacks, le format des éléments du tableau `content` est le suivant :

```typescript
content = [
  {
    name: string,        // Nom de la catégorie
    description: string, // Description de la catégorie, default: ''
    display: boolean,    // Affichage (la catégorie est-elle dépliée ?), default: false
    type: 'success' | 'info' | 'warning' | 'error', // Type de catégorie, default: info
    feedbacks: [
      // Feedbacks enfants de la catégorie. Tableau d'objets du même format que ceux de content
    ]
  },

  ...

]
```

_Si le champs `description` n'est pas défini (ou égal à `''`), il ne s'affichera pas dans le feedback_

<br>
