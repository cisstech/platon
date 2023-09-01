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
  },
  legend: {
    type: 'object',
    default: {
      orient: 'vertical',
      left: 'left',
    },
    description: 'Légende du graphique',
  },
  tooltip: {
    type: 'object',
    default: {
      trigger: 'item',
    },
    description: 'Tooltip du graphique',
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
