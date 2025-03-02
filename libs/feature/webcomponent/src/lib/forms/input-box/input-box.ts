import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface InputBoxState extends IWebComponent {
  type: 'number' | 'text' | 'textarea'
  hint: string
  value: string | number
  width: string
  prefix: string
  appearance: 'fill' | 'outline' | 'inline'
  css?: string
  placeholder: string
  autoValidation: boolean
  disabled: boolean
  completion: string[]
  specialCharacters: string[][][] | string[][] | string[]
}

export const InputBoxComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'InputBox',
  selector: 'wc-input-box',
  description:
    "Champ de saisie polyvalent supportant texte, nombres et zones de texte avec fonctionnalités avancées comme l'autocomplétion et les caractères spéciaux. Utilisable pour de nombreux types d'exercices comme les réponses courtes, calculs numériques, entrée de mots ou phrases, saisie de code, réponses à format spécifique (dates, formules simples).",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'InputBox',
    properties: {
      hint: {
        type: 'string',
        default: '',
        description: 'Une indication à afficher en bas du champ de saisi.',
      },
      type: {
        type: 'string',
        default: 'text',
        enum: ['text', 'number', 'textarea'],
        description: 'Le type du champ de saisi.',
      },
      value: {
        type: ['string', 'number'],
        default: '',
        description: 'La valeur du champ de saisi.',
      },
      width: {
        type: ['string', 'number'],
        default: '',
        description: 'Le largeur du champ de saisi en valeur CSS (%, px, em, etc.).',
      },
      prefix: {
        type: 'string',
        default: '',
        description: 'Une icône à afficher à gauche du champ de saisi.',
      },
      appearance: {
        type: 'string',
        default: 'outline',
        description: "L'apparence du champ de saisi.",
        enum: ['fill', 'outline', 'inline'],
      },
      placeholder: {
        type: 'string',
        default: '',
        description: 'Le texte indicatif du champ de saisi.',
      },
      disabled: {
        type: 'boolean',
        default: false,
        description: 'Désactiver le champ de saisi?',
      },
      completion: {
        type: 'array',
        default: [],
        items: {
          type: 'string',
        },
        description: 'Une liste de suggestions à proposer automatiquement lors de la saisi.',
      },
      autoValidation: {
        type: 'boolean',
        default: false,
        description: `Activer la validation automatique du champ de saisi lors d'un appuie sur la touche "Entrée"?`,
      },
      specialCharacters: {
        type: 'array',
        default: [],
        items: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        description:
          'Une liste de caractères spéciaux à proposer dans un clavier virtuel. Chaque sous-tableau représente une ligne de caractères.',
      },
      css: {
        type: 'string',
        default: '',
        description: 'Les classes CSS à appliquer au composant.',
      },
    },
  },
  showcase: {
    appearance: 'fill',
    placeholder: 'Entrez votre texte...',
    completion: ['France', 'Espagne', 'Italie'],
    prefix: 'clarity happy-face color=FF0000',
    autoValidation: true,
    specialCharacters: [
      [
        ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ', 'ん'],
        ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', '', 'り'],
        ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'ゆ', 'る'],
        ['え', 'け', 'せ', 'て', 'ね', 'へ', 'め', '', 'れ'],
        ['お', 'こ', 'そ', 'と', 'の', 'ほ', 'も', 'よ', 'ろ', 'を'],
      ],
      [
        ['ア', 'カ', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', 'ラ', 'ワ', 'ン'],
        ['イ', 'キ', 'シ', 'チ', 'ニ', 'ヒ', 'ミ', '', 'リ'],
        ['ウ', 'ク', 'ス', 'ツ', 'ヌ', 'フ', 'ム', 'ユ', 'ル'],
        ['エ', 'ケ', 'セ', 'テ', 'ネ', 'ヘ', 'メ', '', 'レ'],
        ['オ', 'コ', 'ソ', 'ト', 'ノ', 'ホ', 'モ', 'ヨ', 'ロ', 'ヲ'],
      ],
      [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
        ['-', '+', '=', '/', '?', ',', '.', ';', ':'],
        ['_', '<', '>', '[', ']', '{', '}', '|', '\\'],
        ['~', '`', "'", '"', '§', '°', '²', '³', '£', '¤'],
      ],
    ],
  },
})
