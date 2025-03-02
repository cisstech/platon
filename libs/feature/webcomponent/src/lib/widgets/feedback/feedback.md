Le composant Feedback permet d'afficher des messages informatifs avec un style visuel adapté à leur nature. Simple mais essentiel, il permet de communiquer clairement avec l'apprenant dans diverses situations pédagogiques.

### Propriétés principales

- **content**: Le contenu du message à afficher. Supporte le format Markdown pour une mise en forme enrichie (gras, italique, listes, etc.)

- **type**: Le type de message qui détermine son apparence visuelle :
  - `success`: Messages positifs ou confirmations (vert)
  - `info`: Informations neutres ou conseils (bleu)
  - `warning`: Avertissements ou points d'attention (orange)
  - `error`: Erreurs ou problèmes à corriger (rouge)

### Exemples d'utilisation

#### Message de succès

```typescript
{
  type: "success",
  content: "**Félicitations !** Votre réponse est correcte."
}
```

#### Information contextuelle

```typescript
{
  type: "info",
  content: "N'oubliez pas que cette fonction retourne une valeur. Pensez à l'utiliser dans votre calcul."
}
```

#### Avertissement

```typescript
{
  type: "warning",
  content: "Votre solution fonctionne mais pourrait être optimisée. Essayez de réduire la complexité algorithmique."
}
```

#### Message d'erreur

```typescript
{
  type: "error",
  content: "La syntaxe est incorrecte. Vérifiez les parenthèses ligne 12."
}
```

### Cas d'utilisation pédagogiques

Ce composant est particulièrement utile pour :

- Fournir des indications sur les erreurs courantes
- Donner des conseils méthodologiques
- Féliciter l'apprenant pour ses réussites
- Attirer l'attention sur des points importants
- Offrir des explications supplémentaires sans surcharger l'interface principale

Le support du Markdown permet d'enrichir les messages avec des éléments comme des listes à puces, du code formaté, ou des liens vers des ressources externes.
