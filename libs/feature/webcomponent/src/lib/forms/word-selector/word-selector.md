Le composant WordSelector est un outil interactif permettant aux apprenants de sélectionner et d'organiser des mots pour construire des phrases ou expressions. Idéal pour les exercices linguistiques comme l'apprentissage de langues étrangères, la syntaxe ou les exercices de logique séquentielle.

### Propriétés principales

- **words**: Tableau contenant les mots disponibles pour la sélection. Ces mots sont affichés dans la zone inférieure du composant et peuvent être cliqués pour être ajoutés à la phrase en construction.

- **selectedWords**: Tableau contenant les mots déjà sélectionnés par l'utilisateur, dans leur ordre de sélection. Ces mots apparaissent dans la zone supérieure du composant.

### Fonctionnement

Lorsqu'un apprenant utilise ce composant:

1. Il visualise deux zones distinctes:

   - En haut: les mots déjà sélectionnés formant la phrase en construction
   - En bas: les mots encore disponibles pour la sélection

2. En cliquant sur un mot de la zone inférieure, celui-ci:

   - Est retiré de la liste des mots disponibles
   - Est ajouté à la fin de la liste des mots sélectionnés

3. En cliquant sur un mot de la zone supérieure, celui-ci:
   - Est retiré de la liste des mots sélectionnés
   - Est replacé dans la liste des mots disponibles

```text
┌─────────── Phrase en construction ─────────┐
│                                            │
│    [Le] [chat] [dort] [tranquillement]     │
│                                            │
├─────────── Mots disponibles  ──────────────┤
│                                            │
│       [sur] [le] [tapis] [doucement]       │
│                                            │
└────────────────────────────────────────────┘
```

### Exemple d'utilisation

Voici comment évolue l'état du composant lors d'une interaction typique:

```typescript
// État initial
{
  words: ["chat", "dort", "Le", "tapis", "sur", "tranquillement", "doucement", "le"],
  selectedWords: []
}

// Après sélection de quelques mots
{
  words: ["tapis", "sur", "doucement"],
  selectedWords: ["Le", "chat", "dort", "le", "tranquillement"]
}
```

Ce composant permet de créer des exercices variés comme la construction de phrases grammaticalement correctes, la mise en ordre de séquences logiques, ou l'apprentissage du vocabulaire dans un contexte syntaxique.
