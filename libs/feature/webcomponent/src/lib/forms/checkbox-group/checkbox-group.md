Le composant CheckboxGroup permet de créer des sélections à choix multiples où l'apprenant peut cocher plusieurs réponses simultanément. Ce composant est particulièrement adapté aux questionnaires à choix multiples, listes de vérification, ou tout exercice où plusieurs éléments peuvent être sélectionnés en même temps.

### Propriétés principales

- **items**: Tableau définissant les options disponibles
- **horizontal**: Booléen déterminant si les options s'affichent horizontalement (`true`) ou verticalement (`false`, par défaut)
- **disabled**: Booléen permettant de désactiver l'interaction avec les cases à cocher (`true` = désactivé)

### Configuration des options

Les éléments du tableau `items` peuvent être définis de deux manières:

#### 1. Format simplifié

Une simple chaîne de caractères représentant le contenu de l'option:

```typescript
items: ['Mercure', 'Vénus', 'Terre', 'Mars']
```

#### 2. Format détaillé

Un objet permettant une personnalisation plus fine:

```typescript
{
    "content": string,  // Texte de l'option (supporte le format Markdown)
    "checked": boolean, // État initial (coché ou non) - Défaut: false
    "css": string       // Classes CSS pour personnaliser l'apparence
}
```

### Exemples d'utilisation

#### Configuration basique

```typescript
{
  items: ['Pomme', 'Banane', 'Orange', 'Fraise']
}
```

#### Options présélectionnées et personnalisées

```typescript
{
  horizontal: true,
  items: [
    { content: "**Important!** Option 1", checked: true },
    { content: "Option avec *italique*" },
    { content: "Option colorée", css: "color-accent" },
    "Option simple"
  ]
}
```

### Récupération des réponses

Le composant met à jour automatiquement la propriété `checked` de chaque élément lorsque l'utilisateur interagit avec les cases à cocher. Pour récupérer les sélections:

```typescript
// Les éléments cochés auront leur propriété "checked" à true
const selectedItems = items.filter((item) => typeof item === 'object' && item.checked)
```

### Applications pédagogiques

Ce composant est idéal pour:

- Les QCM à réponses multiples ("cochez toutes les réponses correctes")
- Les listes de vérification (checklists)
- Les exercices de classification ("cochez tous les éléments appartenant à une catégorie")
- Les sondages et questionnaires permettant plusieurs choix

La prise en charge du format Markdown dans le contenu des options permet d'inclure facilement des formules mathématiques, du code formaté, des liens ou des images pour enrichir vos questions.
