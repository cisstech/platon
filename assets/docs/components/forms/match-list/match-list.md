Le format des éléments du tableau `nodes` est le suivant:

```typescript
{
    "id": string, // Identifiant du noeud.
    "type": "source" | "target", // Type du noeud.
    "content": string, // Contenu en markdown.
}
```

Le format des éléments du tableau `links` est le suivant:

```typescript
{
    "source": string, // Identifiant du noeud source.
    "target": string, // identifiand du noeud cible.
    "css"?: string, // Voir API CSS.
}
```
