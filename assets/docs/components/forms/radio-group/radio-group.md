Le format des éléments du tableau `items` est le suivant:

```typescript
{
    "css"?: string, // Voir API CSS.
    "content": string, // Contenu en markdown.
}
```

> Si vous voulez définir uniquement la propriété `content` d'un des éléments du tableau,
> vous pouvez utiliser une chaine de caractère au lieu d'un objet, dans ce cas la propriété
> `css` prendra sa valeur par défaut.
