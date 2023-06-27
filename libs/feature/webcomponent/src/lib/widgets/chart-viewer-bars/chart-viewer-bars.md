Le format des éléments du tableau `data` est le suivant:

```typescript
{
    "name"?: string, // Nom de la colonne
    "series": [
        {
            "name": string, // Nom de la série
            "value": number // Valeur de la série
        },
        ... // Prochains objets...
    ]
}
```

> Les noms devraient être uniques et permettant facilement de représenter les données sur la charte
