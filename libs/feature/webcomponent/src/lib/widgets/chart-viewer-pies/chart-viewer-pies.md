Le composant ChartViewerPies permet de créer des graphiques circulaires pour visualiser des proportions et distributions. Idéal pour représenter des parts d'un ensemble, des pourcentages ou des répartitions relatives entre différentes catégories.

### Structure des données

La propriété `data` attend un tableau d'objets avec la structure suivante:

```typescript
{
    "name": string, // Nom de la catégorie (ex: "France")
    "value": number // Valeur numérique associée (ex: 7200000)
}
```

Chaque objet représente une portion du graphique, dont la taille sera proportionnelle à sa valeur par rapport à la somme totale.

### Modes d'affichage

Le composant offre quatre variantes visuelles pour s'adapter à différents contextes pédagogiques:

- **simple**: Graphique circulaire classique
- **donut**: Graphique en anneau avec un espace vide au centre
- **half-donut**: Graphique en demi-cercle
- **nightingale**: Diagramme en rose (de Florence Nightingale), où les segments ont tous le même angle mais des rayons différents

### Exemple pratique

```typescript
{
  mode: "donut",
  data: [
    { name: "Protéines", value: 25 },
    { name: "Lipides", value: 30 },
    { name: "Glucides", value: 45 }
  ]
}
```

### Recommandations

Pour une visualisation optimale:

- Limitez le nombre d'éléments à moins de 8 pour éviter la surcharge visuelle
- Utilisez des noms courts mais descriptifs
- Organisez vos données par ordre de grandeur pour faciliter la lecture
- Envisagez d'utiliser le mode "nightingale" pour mettre en évidence les contrastes entre valeurs

> Les différents modes offrent des perspectives visuelles complémentaires sur les mêmes données, permettant d'explorer différentes façons de communiquer l'information.
