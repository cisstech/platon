Le composant MatchList permet de créer des exercices interactifs d'appariement où les apprenants doivent établir des correspondances entre des éléments disposés dans deux colonnes distinctes. Il s'utilise typiquement en créant un ensemble d'éléments sources (colonne de gauche) et cibles (colonne de droite) que l'apprenant relie par des traits.

### Organisation des éléments

Le composant s'articule autour de deux collections principales:

#### Éléments à relier (`nodes`)

Chaque élément est défini par un objet avec trois propriétés essentielles:

```typescript
{
    "id": string, // Identifiant du noeud.
    "type": "source" | "target", // Type du noeud.
    "content": string, // Contenu en markdown.
}
```

#### Connexions entre éléments (`links`)

```typescript
{
    "source": string, // Identifiant du noeud source.
    "target": string, // identifiand du noeud cible.
    "css"?: string, // Voir API CSS.
}
```

Les éléments de type source apparaissent dans la colonne gauche, tandis que les éléments de type target sont placés dans la colonne droite.

### Fonctionnalités interactives

Par défaut, l'apprenant peut:

- Créer des liens en cliquant successivement sur un élément source puis un élément cible
- Supprimer un lien existant en cliquant dessus
- Établir plusieurs connexions pour un même élément source ou cible

Pour désactiver cette interactivité (par exemple pour afficher une solution), utilisez la propriété disabled: true.

### Conseils de conception

Pour créer des exercices d'association efficaces:

Assurez-vous que les identifiants (id) sont uniques
Équilibrez le nombre d'éléments entre les colonnes source et cible
Utilisez le markdown dans la propriété content pour intégrer des formules, images ou mise en forme
