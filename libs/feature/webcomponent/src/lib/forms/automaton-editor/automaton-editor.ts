import { Automaton } from './automaton'
import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface AutomatonEditorState extends IWebComponent {
  height: number
  automaton: Automaton
}

export const AutomatonEditorComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'AutomatonEditor',
  selector: 'wc-automaton-editor',
  description:
    "Éditeur graphique interactif pour créer et manipuler des automates finis. Essentiel pour les exercices de théorie des langages formels, conception d'expressions régulières, modélisation de machines à états, vérification de propriétés de langages, ou pour l'apprentissage des concepts fondamentaux d'informatique théorique.",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    properties: {
      height: {
        type: 'number',
        default: 500,
        description: "La hauteur de l'éditeur en px.",
      },
      automaton: {
        type: 'object',
        default: {},
        description: 'Automate dessiner.',
        properties: {
          states: {
            type: 'array',
            description: "Les états de l'automate.",
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: "L'identifiant de l'état.",
                  default: '',
                },
                label: {
                  type: 'string',
                  description: "Le label de l'état.",
                  default: '',
                },
                initial: {
                  type: 'boolean',
                  description: "L'état est-il initial ?",
                  default: false,
                },
                accepting: {
                  type: 'boolean',
                  description: "L'état est-il acceptant ?",
                  default: false,
                },
                position: {
                  type: 'object',
                  description: "La position de l'état.",
                  properties: {
                    x: {
                      type: 'number',
                      description: "La position x de l'état.",
                      default: 0,
                    },
                    y: {
                      type: 'number',
                      description: "La position y de l'état.",
                      default: 0,
                    },
                  },
                },
              },
            },
          },
          transitions: {
            type: 'array',
            description: "Les transitions de l'automate.",
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: "L'identifiant de la transition.",
                  default: '',
                },
                from: {
                  type: 'string',
                  description: "L'identifiant de l'état de départ.",
                  default: '',
                },
                to: {
                  type: 'string',
                  description: "L'identifiant de l'état d'arrivée.",
                  default: '',
                },
                label: {
                  type: 'string',
                  description: 'Le label de la transition.',
                  default: '',
                },
              },
            },
          },
          acceptingStates: {
            type: 'array',
            description: "Les états acceptants de l'automate.",
            items: {
              type: 'string',
              description: "L'identifiant de l'état acceptant.",
              default: '',
            },
          },
          position: {
            type: 'object',
            description: "La position des états de l'automate.",
            properties: {
              x: {
                type: 'number',
                description: "La position x de l'état.",
                default: 0,
              },
              y: {
                type: 'number',
                description: "La position y de l'état.",
                default: 0,
              },
            },
          },
        },
      },
    },
  },
  showcase: {},
})
