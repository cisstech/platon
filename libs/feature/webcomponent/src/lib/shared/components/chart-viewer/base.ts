import { EChartsOption } from 'echarts'
import { JSONSchema7 } from 'json-schema'

export interface ChartViewerBase {
  data: { name: string; value: number }[]
  title: EChartsOption['title']
  legend: EChartsOption['legend']
  tooltip: EChartsOption['tooltip']
  dataTitle: string
}

export const ChartViewerBaseProperties: Record<string, JSONSchema7> = {
  data: {
    type: 'array',
    default: [],
    description: 'Jeu de donnée à afficher, le format est décrit plus bas',
  },
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
