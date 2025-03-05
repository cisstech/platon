import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface MathListLink {
  source: string
  target: string
  css?: string
}

export interface MatchListItem {
  id: string
  type: 'source' | 'target'
  content: string
}
export interface MatchListState extends IWebComponent {
  disabled: boolean
  links: MathListLink[]
  nodes: MatchListItem[]
}

export const MatchListComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'MatchList',
  selector: 'wc-match-list',
  description: `Composant interactif permettant d'associer des éléments entre deux colonnes en traçant des lignes. Parfait pour les exercices d'appariement comme associer des termes à leurs définitions, des mots à leurs traductions, des formules à leurs applications, ou encore des images à leurs descriptions.`,
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'MatchList',
    properties: {
      disabled: {
        type: 'boolean',
        default: false,
        description: "Désactiver l'interaction avec le composant?",
      },
      links: {
        type: 'array',
        default: [],
        description: 'La liste des associations.',
        additionalProperties: false,
        required: ['source', 'target'],
        items: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              description: 'Identifiant du noeud source.',
            },
            target: {
              type: 'string',
              description: 'Identifiant du noeud cible.',
            },
            css: {
              type: 'string',
              description: 'Voir la page API CSS.',
            },
          },
        },
      },
      nodes: {
        type: 'array',
        default: [],
        description: 'La liste des noeuds.',
        minItems: 2,
        additionalProperties: false,
        required: ['id', 'content', 'type'],
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Identifiant unique du noeud.',
            },
            content: {
              type: 'string',
              description: 'Contenu du noeud en markdown.',
            },
            type: {
              type: 'string',
              enum: ['source', 'target'],
              description: 'Type du noeud.',
            },
          },
        },
      },
    },
  },
  showcase: {
    nodes: [
      {
        id: 'Node1',
        type: 'source',
        content: 'trois champs nom(char*), prénom(char*) et age(int)',
      },
      {
        id: 'Node2',
        type: 'source',
        content: 'Une matrice rectangulaire `m` par `n` (deux entiers)',
      },
      {
        id: 'Node3',
        type: 'source',
        content: "Un noeud d'arbre de personnes (char* nom et char* prénom)",
      },
      {
        id: 'Node4',
        type: 'source',
        content: 'Une chaine (char[64]) de moins de 63 caractère',
      },
      {
        id: 'Node5',
        type: 'source',
        content: 'Une cellule de liste chaînée de floatant',
      },

      { id: 'Node6', type: 'target', content: 'trois mallocs' },
      {
        id: 'Node7',
        type: 'target',
        content: 'un malloc puis malloc dans un for',
      },
      { id: 'Node8', type: 'target', content: 'deux mallocs' },
      { id: 'Node9', type: 'target', content: 'aucun malloc' },
      { id: 'Node10', type: 'target', content: 'un malloc' },
    ],
  },

  playgrounds: {
    'Biologie animal': 'biology.ple',
  },
})
