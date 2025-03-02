Le composant MathLive intègre un éditeur d'expressions mathématiques avancé qui permet aux apprenants de saisir des formules mathématiques complexes avec un rendu LaTeX en temps réel. Il est basé sur la bibliothèque [mathlive](https://cortexjs.io/mathfield), reconnue pour sa puissance et sa simplicité d'utilisation.

### Configuration avancée

La propriété `config` vous permet d'accéder à toutes les options de personnalisation offertes par la bibliothèque mathlive. Consultez la [documentation officielle](https://cortexjs.io/mathfield)) pour découvrir l'ensemble des paramètres disponibles.

### Personnalisation visuelle

#### Icônes interactives

Pour enrichir l'expérience utilisateur, vous pouvez ajouter des icônes à gauche et/ou à droite du champ de saisie grâce aux propriétés `prefix` et `suffix`. La syntaxe est la suivante:

`type nom [color=CODE_COULEUR]`

Où:

- `type` correspond à une bibliothèque d'icônes (ex: fontawesome, clarity, material)
- `nom` est l'identifiant de l'icône dans cette bibliothèque
- `color=CODE_COULEUR` est un paramètre optionnel pour définir la couleur (format hexadécimal sans #)

**Exemples**:

- `fontawesome address-book` affiche une icône d'annuaire
- `clarity happy-face color=FF0000` affiche un visage souriant en rouge

La plateforme [icongr.am](https://icongr.am) référence toutes les bibliothèques et icônes disponibles.

### Clavier mathématique virtuel

Le composant intègre un clavier virtuel spécialisé pour la saisie d'expressions mathématiques. Vous pouvez personnaliser ce clavier via la propriété `layouts` pour l'adapter aux besoins spécifiques de votre exercice (symboles de calcul, caractères grecs, opérateurs logiques, etc.).

### Conseils d'utilisation

Pour une expérience optimale, pensez à:

- Fournir une valeur par défaut dans les cas où vous attendez une réponse dans un format spécifique
- Utiliser les icônes pour donner des indices visuels sur le type d'expression attendue
- Adapter la configuration du clavier virtuel au niveau de complexité approprié pour votre exercice
