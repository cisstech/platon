Ce composant vous permet de créer des interactions de type glisser-déposer dans vos exercices. C'est un outil particulièrement puissant pour concevoir des activités où les apprenants doivent associer, classer ou positionner des éléments.

### Fonctionnement

Le composant fonctionne avec deux types d'éléments:

- **Éléments déplaçables** (`draggable=true`): Ces éléments peuvent être saisis et déplacés.
- **Zones de dépôt** (`draggable=false`): Ces zones peuvent recevoir des éléments déplaçables.

Lorsqu'un élément déplaçable est déposé dans une zone de dépôt, le contenu (`content`) de l'élément déplaçable est automatiquement copié dans la zone de dépôt. Un même élément déplaçable peut être utilisé plusieurs fois dans différentes zones.

### Regroupement et restrictions

Pour limiter quels éléments peuvent être déposés dans quelles zones, utilisez la propriété `group`. Les éléments ne peuvent être déposés que dans les zones ayant le même identifiant de groupe.

### Réinitialisation des zones

Pour vider une zone de dépôt, deux méthodes sont possibles:

- Glissez son contenu vers l'élément déplaçable d'origine
- Cliquez sur le bouton de suppression qui apparaît dans la zone

### Applications pédagogiques

Ce composant est idéal pour créer des exercices comme:

- Associations de termes avec leurs définitions
- Classification d'éléments dans diverses catégories
- Placement d'étiquettes sur un schéma ou une image
- Reconstitution de séquences ou d'ordres logiques
