Le composant Markdown permet d'afficher du contenu formaté avec une syntaxe simple et lisible. Basé sur la bibliothèque nge-markdown, il offre des fonctionnalités étendues au-delà du Markdown standard, rendant vos contenus pédagogiques plus riches et structurés.

### Propriétés principales

- **data**: Contenu Markdown à afficher directement dans le composant
- **file**: URL vers un fichier Markdown externe à charger et afficher

> Si les deux propriétés sont définies, `data` est prioritaire sur `file`.

### Fonctionnalités avancées

#### Admonitions (notes contextuelles)

Créez des encadrés colorés pour mettre en évidence différents types d'informations:

```markdown
:::+ note Titre de la note
Contenu de la note avec informations importantes.
:::

:::+ warning Attention
Contenu d'avertissement à ne pas négliger.
:::

:::+ tip Astuce
Conseil utile pour les apprenants.
:::

:::+ danger Important
Information critique ou mise en garde.
:::
```

#### Système d'onglets

Organisez votre contenu en onglets pour économiser de l'espace et structurer l'information:

```markdown
=== Premier onglet
Contenu du premier onglet

=== Deuxième onglet
Contenu du deuxième onglet

=== Troisième onglet
Contenu du troisième onglet
===
```

#### Tableaux avancés

Créez des tableaux avec fusion de cellules et mise en forme:

```markdown
| En-tête 1                  | En-tête 2  | En-tête 3 |
| :------------------------- | :--------: | --------: |
| Gauche                     |   Centré   |    Droite |
| Cellule avec **formatage** | _Italique_ |    `Code` |
```

### Applications pédagogiques

Le composant Markdown est particulièrement utile pour:

- Rédiger des énoncés d'exercices structurés
- Présenter des explications théoriques
- Fournir de la documentation
- Créer des guides étape par étape
- Organiser des ressources pédagogiques

### Ressources complémentaires

Pour explorer toutes les possibilités offertes par ce composant:

- [Guide complet de nge-markdown](https://cisstech.github.io/nge/docs/nge-markdown/cheatsheet)
- [Syntaxe Markdown standard](https://www.markdownguide.org/basic-syntax/)
