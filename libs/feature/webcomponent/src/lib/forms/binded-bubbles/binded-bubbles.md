Le format des éléments du tableau `items` est le suivant:

```typescript
{
    "content"?: string, // Contenu en markdown.
    "checked": string, // La proposition est sélectionnée?
}
```

> Si vous voulez vous pouvez définir uniquement la propriété `content` d'un des éléments du tableau,
> `checked` prendra sa valeur par défaut.
