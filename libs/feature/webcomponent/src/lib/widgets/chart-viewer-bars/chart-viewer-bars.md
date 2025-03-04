Le composant ChartViewerBars permet de créer des graphiques à barres horizontales ou verticales pour comparer visuellement des séries de données. Particulièrement utile pour illustrer des évolutions, des comparaisons entre catégories ou des distributions statistiques.

### Structure des données

La propriété principale `data` attend un tableau d'objets suivant cette structure:

```typescript
{
    "name": string,    // Nom de la série (ex: "Ventes 2022")
    "value": number[]  // Valeurs pour chaque catégorie définie dans "labels"
}
```

Chaque élément du tableau `value` correspond à une catégorie définie dans la propriété `labels`.

### Configuration des axes

- **labels**: Tableau de chaînes définissant les catégories (axe des abscisses en mode vertical, ordonnées en mode horizontal)
- **xAxisLabel**: Titre de l'axe horizontal
- **yAxisLabel**: Titre de l'axe vertical

### Modes d'affichage

- **vertical**: Barres verticales (classique)
- **horizontal**: Barres horizontales (utile pour les étiquettes longues ou nombreuses)

### Exemple pratique

```typescript
{
  mode: "vertical",
  xAxisLabel: "Trimestres",
  yAxisLabel: "Ventes (k€)",
  labels: ["T1", "T2", "T3", "T4"],
  data: [
    {
      name: "2021",
      value: [45, 52, 38, 65]
    },
    {
      name: "2022",
      value: [51, 59, 42, 79]
    }
  ]
}
```

### Applications pédagogiques

Ce composant est particulièrement adapté pour:

- Comparaisons temporelles (évolution par périodes)
- Analyses comparatives entre groupes
- Représentation de distributions statistiques
- Visualisation de résultats d'enquêtes ou d'expériences

> Pour une lisibilité optimale, assurez-vous que chaque série contient exactement le même nombre de valeurs que d'étiquettes dans la propriété `labels`.
