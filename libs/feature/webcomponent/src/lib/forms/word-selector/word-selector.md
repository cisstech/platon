Le composant WordSelector permet de sélectionner des mots depuis une liste initiale et de les organiser
dans un ordre précis pour former une phrase. Les mots sélectionnés sont mis à jour dans la propriété
`selectedWords`, tandis que la liste des mots restants est conservée dans `words`.

- **words** :
La liste initiale de mots disponibles pour la sélection.

- **selectedWords** :
Une liste de mots que l'utilisateur a sélectionnés. Les mots sont ajoutés dans l'ordre de sélection.

## Exemple d'utilisation

Voici un exemple d'utilisation du composant :

### Propriété `words`

La propriété `words` représente la liste initiale des mots disponibles que l'utilisateur peut sélectionner.
Vous pouvez définir n'importe quel tableau de mots sous forme de chaînes de caractères.

### Propriété `selectedWords`

La propriété `selectedWords` contient les mots que l'utilisateur a sélectionnés pour former une phrase.
Ces mots sont mis à jour dynamiquement lorsque l'utilisateur interagit avec le composant.

## Comment ça marche ?

```text
┌─────────── Zone des mots choisis ──────────┐
│                                            │
│    [Le] [chat] [dort] [tranquillement]     │
│                                            │
├─────────── Mots disponibles  ──────────────┤
│                                            │
│       [sur] [tapis] [doucement]            │
│                                            │
└────────────────────────────────────────────┘
```

## Exemple rapide

```typescript
// État initial
{
  words: ["chat", "dort", "Le", "tapis", "sur", "tranquillement", "doucement"], // Mots disponibles
  selectedWords: [],                       // Mots choisis
}

// Après avoir joué
{
  words: ["tapis", "sur", "doucement"],                       // Il reste "tapis"
  selectedWords: ["le", "chat", "dort", "tranquillement"],  // La phrase en construction
  isFilled: true                          // Oui, on a fait une sélection !
}
```
