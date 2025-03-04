Le composant SortList vous permet de créer des listes d'éléments que les apprenants peuvent réorganiser par glisser-déposer. C'est un outil idéal pour tester la capacité des étudiants à établir un ordre logique, chronologique ou hiérarchique.

### Définition des éléments de la liste

Vous pouvez définir les éléments de votre liste de deux façons :

1. **Format simplifié** : pour les éléments simples, utilisez directement des chaînes de caractères

   ```js
   items: ['Première étape', 'Deuxième étape', 'Troisième étape']
   ```

2. **Format détaillé** : pour personnaliser davantage chaque élément
   ```js
   items: [
     {
       content: 'Étape avec *mise en forme* markdown',
       css: 'highlight important-item',
     },
     {
       content: 'Étape avec une formule $E=mc^2$',
     },
   ]
   ```

Le contenu de chaque élément peut inclure du texte formaté en markdown, des formules mathématiques et même des images.

### Personnalisation de l'affichage

Par défaut, les éléments sont centrés dans la liste, mais vous pouvez les aligner à gauche en définissant `alignment: "left"`. Cette option est particulièrement utile pour les listes comportant des éléments de longueurs variables ou du texte structuré.

### Comportement interactif

Les étudiants peuvent facilement réorganiser les éléments en les faisant glisser dans un nouvel ordre. Une animation fluide accompagne le déplacement, rendant l'interaction intuitive. Si vous avez besoin d'afficher une liste statique (par exemple pour montrer la solution), utilisez l'option `disabled: true`.

### Applications pédagogiques

Le composant SortList est particulièrement efficace pour :

- Reconstruire une séquence d'événements historiques
- Ordonner les étapes d'un processus ou d'un algorithme
- Classer des éléments par ordre de priorité ou d'importance
- Reconstituer des phrases ou paragraphes dans le bon ordre
- Visualiser les étapes d'une démonstration mathématique

L'ordre final des éléments est automatiquement enregistré, ce qui facilite l'évaluation de la réponse dans votre script d'évaluation (grader).
