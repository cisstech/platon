Le composant RadioGroup permet de créer des questions à choix unique où l'apprenant doit sélectionner une seule option parmi plusieurs propositions. C'est l'équivalent numérique des questionnaires à choix multiples traditionnels avec boutons radio.

### Structure des données

Les options de votre groupe de boutons radio sont définies dans le tableau `items`. Chaque élément peut être spécifié de deux manières:

1. **Format simplifié**: Une simple chaîne de caractères représentant le contenu de l'option

   ```js
   'Réponse possible'
   ```

2. **Format détaillé**: Un objet avec des propriétés configurables
   ```js
   {
     "content": "Réponse possible avec **mise en forme** ou $formules$",  // Supporte le markdown
     "css": "highlight bold"                                            // Classes CSS optionnelles
   }
   ```

### Gestion de la sélection

La propriété `selection` spécifie l'option actuellement sélectionnée. Sa valeur correspond au contenu textuel de l'élément dans le tableau `items`. Si les éléments du tableau sont des chaînes de caractères, la valeur sera cette chaîne. Si les éléments sont des objets, la valeur sera celle de la clé `content`.

### Disposition des options

Par défaut, les options sont disposées verticalement, les unes sous les autres. Pour une présentation horizontale (utile pour les options courtes ou quand l'espace est limité), activez la propriété `horizontal: true`.

### Validation automatique

Activez la validation automatique avec `autoValidation: true` pour que l'exercice soit automatiquement soumis dès qu'une option est sélectionnée. Cette fonctionnalité est particulièrement utile pour:

- Les exercices rapides d'auto-évaluation
- Les sondages instantanés
- Les questions simples ne nécessitant pas de réflexion prolongée

### Conseils d'utilisation

- Limitez le nombre d'options à 5-7 maximum pour une meilleure lisibilité
- Pour les options longues ou contenant des médias, privilégiez l'affichage vertical
- Utilisez le markdown pour enrichir vos options avec des images, des formules ou du texte formaté
- Si vous avez besoin de sélections multiples, utilisez plutôt le composant CheckboxGroup
