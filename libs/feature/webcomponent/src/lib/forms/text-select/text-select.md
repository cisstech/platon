Le composant TextSelect vous permet de créer des exercices interactifs où les apprenants doivent identifier et sélectionner des segments spécifiques dans un texte. Cette fonctionnalité est particulièrement utile pour l'analyse textuelle, l'identification d'éléments grammaticaux ou syntaxiques, ou toute activité nécessitant une interaction précise avec le contenu textuel.

### Trois modes de fonctionnement

Le composant propose trois modes de sélection différents, adaptables à divers besoins pédagogiques:

#### 1. Mode libre (`free`)

Ce mode transforme l'intégralité du texte en zone sélectionnable. L'apprenant peut sélectionner n'importe quelle partie du texte, caractère par caractère, comme dans un éditeur de texte standard.

- **Comportement**: Sélection par glisser-déposer, comme une sélection de texte classique
- **Format des sélections**:
  ```js
  {
    "content": "texte sélectionné",              // Le contenu exact sélectionné
    "position": [5, 12],                         // Positions [début, fin] dans le texte original
    "css": "highlight important" // optionnel    // Classes CSS pour styliser la sélection
  }
  ```

#### 2. Mode unités (`units`)

Ce mode permet de délimiter des unités prédéfinies sélectionnables dans le texte, en les encadrant par des accolades `{ }`. Seules ces unités peuvent être sélectionnées, et elles le sont toujours intégralement.

- **Comportement**: Un simple clic sélectionne l'unité entière
- **Format du texte**: `Voici un {mot sélectionnable} dans une {phrase}`
- **Format des sélections**:
  ```js
  {
    "content": "mot sélectionnable",             // Le contenu de l'unité
    "position": 0,                               // Position ordinale de l'unité (0 = première unité)
    "css": "correct-answer" // optionnel         // Classes CSS pour styliser la sélection
  }
  ```

#### 3. Mode expression régulière (`regex`)

Ce mode utilise une expression régulière pour identifier dynamiquement les parties sélectionnables du texte. Ce mode est particulièrement puissant pour les exercices d'identification de motifs spécifiques.

- **Comportement**: Un simple clic sélectionne l'élément entier correspondant au motif
- **Configuration**: Définissez le motif via la propriété `regex` (ex: `"\\b[A-Z][a-z]+\\b"` pour les mots commençant par une majuscule)
- **Format des sélections**: Identique au mode `units`, avec une position ordinale

### Combinaison avec HTML

Dans les modes `free` et `units`, vous pouvez enrichir votre texte avec du HTML pour créer des mises en forme spécifiques:
