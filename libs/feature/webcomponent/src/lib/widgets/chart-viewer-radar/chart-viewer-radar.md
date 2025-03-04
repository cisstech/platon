Le composant ChartViewerRadar permet de visualiser des données multidimensionnelles sous forme d'un graphique en toile d'araignée. Cette représentation est particulièrement efficace pour comparer plusieurs entités selon différents critères ou indicateurs simultanément.

### Structure des données

La propriété principale `data` attend un tableau d'objets suivant cette structure:

```typescript
{
    "name": string,  // Nom de la série (ex: "Compétences équipe A")
    "value": number[] // Tableau de valeurs correspondant aux indicateurs
}
```

Chaque élément du tableau `value` correspond à un indicateur défini dans la propriété `indicators`.

### Configuration des indicateurs

La propriété `indicators` définit les axes de votre radar avec leurs valeurs maximales:

```typescript
{
    "indicators": [
        { "name": "Force", "max": 100 },
        { "name": "Vitesse", "max": 100 },
        { "name": "Défense", "max": 100 },
        // etc.
    ]
}
```

### Modes d'affichage

- **simple**: Affiche les lignes du radar sans remplissage
- **filled**: Affiche les zones colorées pour chaque série de données

### Formes disponibles

- **circle**: Radar circulaire pour une représentation équidistante
- **polygon**: Radar polygonal (par défaut)

### Exemple pratique

```typescript
{
  // Définition des axes du radar
  indicators: [
    { name: "Communication", max: 10 },
    { name: "Travail d'équipe", max: 10 },
    { name: "Technique", max: 10 },
    { name: "Créativité", max: 10 },
    { name: "Autonomie", max: 10 }
  ],
  // Données pour deux équipes différentes
  data: [
    {
      name: "Équipe Alpha",
      value: [8, 9, 7, 6, 8]
    },
    {
      name: "Équipe Beta",
      value: [7, 6, 9, 8, 5]
    }
  ]
}
```

> Pour une meilleure lisibilité, assurez-vous que chaque série possède exactement le même nombre de valeurs que d'indicateurs, et que les noms soient descriptifs.
