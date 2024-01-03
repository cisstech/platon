### Comportement

Le comportement de ce composant dépend de la valeur de sa propriété `type`.

- `number`:
  Dans ce mode, le composant garanti que la valeur saisie est du type numérique,
  toute autre valeur est converti en 0 y compris la chaine vide.
  Dans un grader le type de `value` est donc soit un `int` soit un `float` (pas besoin de faire un cast).

  **Important**:
  Si la valeur saisie est `0.0` alors elle sera convertie en entier `0` ([comportement du JavaScript](https://stackoverflow.com/a/41304142)).

- `text`:
  Dans ce mode, le logique de la validation de saisie est déléguer au grader de l'exercice.
  Le grader reçoit donc la chaine de caractère saisi en entier (chaine vide par défaut).
  Vous devez donc gérer vous-même le cas de la chaine vide et faire un cast si besoin.

- `textarea`: Le même comportement que pour le type `text` sauf que la chaine peut être saisi sur plusieurs lignes.

### Les propriétés `prefix` et `suffix`

Les propriétés `prefix` et `suffix` vous permettent d'afficher une icône à gauche et/ou à droite
du champ de saisi en utilisant la syntaxe suivante:

`type nom`

Dans cette syntaxe, `type` fait référence à une librairie d'icône (ex: fontawesome) et `name` au nom d'une icône dans cette librairie.

Exemple:

`fontawesome address-book`.

@fontawesome address-book@

Vous pouvez spécifier une couleur pour votre icône en ajoutant `color=C` où `C` est une couleur en héxadécimal sans le `#`.

Exemple:

`fontawesome address-book color=FF0000`.

@fontawesome address-book color=FF0000@

La liste complète des types et noms supportés sont spécifiés sur le site [https://icongr.am](https://icongr.am).
