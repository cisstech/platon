Ce composant représente une matrice par un tableau `cells`.
Ce tableau contient les cellules de la matrice dont le format est le suivant:

```typescript
{
    "css"?: string, // Voir API CSS.
    "value": string, // La valeur d'une cellule de la matrice.
    "disabled"?: boolean, // Une valeur indiquant si la cellule est désactivée.
}
```

> Si vous voulez définir uniquement la propriété `value` d'un des éléments du tableau,
> vous pouvez utiliser une chaine de caractère au lieu d'un objet et les autres propriétés
> prendront leur valeur par défaut.

Les dimensions de la matrice sont représentées par les propriétés `cols` et `rows`.
Si la propriété `cells` n'est pas définie ou ne contient pas `cols` \* `rows` cellules,
alors le composant ajoutera automatiquement les cellules manquantes avec `0` comme valeur
par défaut.
