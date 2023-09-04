import { EChartsOption } from 'echarts'
import { JSONSchema7 } from 'json-schema'

export interface ChartViewerBase {
  title: EChartsOption['title']
  legend: EChartsOption['legend']
  tooltip: EChartsOption['tooltip']
  dataTitle: string
}

export interface ChartViewerBase1 extends ChartViewerBase {
  data: { name: string; value: number }[]
}

export interface ChartViewerBase2 extends ChartViewerBase {
  data: { name: string; value: number[] }[]
}

export const ChartViewerBaseProperties: Record<string, JSONSchema7> = {
  title: {
    type: 'object',
    default: {
      text: 'Title',
      subtext: 'SubTitle',
      left: 'center',
    },
    description: 'Titre du graphique',
    properties: {
      text: {
        type: 'string',
        default: 'Title',
        description: 'Titre du graphique',
      },
      subtext: {
        type: 'string',
        default: 'SubTitle',
        description: 'Sous-titre du graphique',
      },
      left: {
        type: 'string',
        default: 'center',
        description: "Position du titre sur l'axe horizontal, ne peut pas être combiné avec top",
        enum: ['left', 'center', 'right'],
      },
      top: {
        type: 'string',
        default: 'top',
        description: "Position du titre sur l'axe vertical, ne peut pas être combiné avec left",
        enum: ['top', 'center', 'bottom'],
      },
    },
  },
  legend: {
    type: 'object',
    default: {
      orient: 'vertical',
      left: 'left',
    },
    description: 'Légende du graphique',
    properties: {
      orient: {
        type: 'string',
        default: 'vertical',
        description: 'Orientation de la légende',
        enum: ['horizontal', 'vertical'],
      },
      left: {
        type: 'string',
        default: 'left',
        description: "Position de la légende sur l'axe horizontal, ne peut pas être combiné avec top",
        enum: ['left', 'center', 'right'],
      },
      top: {
        type: 'string',
        default: 'top',
        description: "Position de la légende sur l'axe vertical, ne peut pas être combiné avec left",
        enum: ['top', 'center', 'bottom'],
      },
    },
  },
  tooltip: {
    type: 'object',
    default: {
      trigger: 'item',
    },
    description: 'Tooltip du graphique',
    properties: {
      trigger: {
        type: 'string',
        default: 'item',
        description: 'Type de tooltip',
        enum: ['item', 'axis'],
      },
    },
  },
  dataTitle: {
    type: 'string',
    default: 'Valeur de la donnée',
    description: 'Titre à afficher sur chaque donnée',
  },
}

export const ChartViewerBaseProperties1: Record<string, JSONSchema7> = {
  ...ChartViewerBaseProperties,
  data: {
    type: 'array',
    default: [],
    description: 'Liste des données du graphique',
    items: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          default: '',
          description: "Nom de l'indicateur",
        },
        value: {
          type: 'number',
          default: 0,
          description: "Valeur de l'indicateur",
        },
      },
    },
  },
}

export const ChartViewerBaseProperties2: Record<string, JSONSchema7> = {
  ...ChartViewerBaseProperties,
  data: {
    type: 'array',
    default: [],
    description: 'Liste des données du graphique',
    items: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          default: '',
          description: "Nom de l'indicateur",
        },
        value: {
          type: 'array',
          default: [],
          description: "Valeur de l'indicateur",
          items: {
            type: 'number',
          },
        },
      },
    },
  },
}
