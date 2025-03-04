Le composant Presenter permet de créer des diaporamas interactifs et riches directement dans vos exercices. Basé sur la puissante bibliothèque Reveal.js, il offre des fonctionnalités avancées de présentation qui facilitent l'explication de concepts complexes à travers une progression visuelle structurée.

### Propriété principale

- **template**: Le contenu de la présentation au format HTML/Markdown compatible avec Reveal.js

### Fonctionnalités principales

#### Structure des diapositives

Les diapositives sont organisées horizontalement (sections principales) et verticalement (sous-sections):

```html
<section data-markdown>
  <textarea data-template>
    ## Première diapositive
    Contenu principal

    ---
    ## Seconde diapositive
    Nouveau contenu après transition horizontale

    --
    ## Sous-diapositive
    Contenu accessible par transition verticale
  </textarea>
</section>
```

#### Markdown enrichi

Le contenu peut être écrit en Markdown pour plus de simplicité:

```markdown
## Titre de la diapositive

- Point 1
- Point 2

> Citation importante
```

#### Code avec surlignage syntaxique

Présentez du code avec coloration syntaxique et mise en évidence progressive:

````markdown
```javascript [1-2|3|4]
function exemple() {
  const a = 1
  const b = a + 1
  return b * 2
}
```
````

````

La syntaxe `[1-2|3|4]` permet de révéler progressivement les lignes de code lors de la présentation.

### Formules mathématiques

Intégrez des formules mathématiques avec la syntaxe LaTeX:

```markdown
$$
f(x) = \int_{-\infty}^{\infty} \hat{f}(\xi) e^{2 \pi i \xi x} d\xi
$$
````

### Exemples d'utilisation pédagogique

- Présentation progressive d'un algorithme
- Explication étape par étape d'une démonstration mathématique
- Tutoriel visuel avec code et exemples
- Comparaison de différentes approches méthodologiques

### Ressources complémentaires

Pour explorer toutes les fonctionnalités disponibles:

- [Documentation officielle de Reveal.js](https://revealjs.com/)
- [Guide Markdown pour Reveal.js](https://revealjs.com/markdown/)
- [Documentation sur le code](https://revealjs.com/code/)
- [Formules mathématiques](https://revealjs.com/math/)

Ce composant est particulièrement adapté aux explications qui nécessitent une progression logique et visuelle, permettant aux apprenants de suivre un raisonnement étape par étape.
