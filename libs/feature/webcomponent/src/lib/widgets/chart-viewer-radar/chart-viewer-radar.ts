import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'
import { ChartViewerBase2, ChartViewerBaseProperties2 } from '../../shared/components/chart-viewer/base'
import { EChartsOption } from 'echarts'

export interface ChartViewerRadarState extends IWebComponent, ChartViewerBase2 {
  mode: 'simple' | 'filled'
  shape: 'circle' | 'polygon'
  indicators: Array<{ name: string; max: number }>
}

export const ChartViewerRadarComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'ChartViewer-Radar',
  selector: 'wc-chart-viewer-radar',
  description: "Permets d'afficher une charte de type `radar` en fournissant des données",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'ChartViewer-Radar',
    required: ['data', 'indicators'],
    properties: {
      mode: {
        type: 'string',
        default: 'simple',
        description: "Mode d'affichage du graphe : simple, ou filled",
        enum: ['simple', 'filled'],
      },
      shape: {
        type: 'string',
        default: 'polygon',
        description: 'Forme du graphe : circle, ou polygon',
        enum: ['circle', 'polygon'],
      },
      indicators: {
        type: 'array',
        default: [],
        description: 'Liste des indicateurs du radar',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              default: '',
              description: "Nom de l'indicateur",
            },
            max: {
              type: 'number',
              default: 100,
              description: "Valeur maximale de l'indicateur",
            },
          },
        },
      },
      ...ChartViewerBaseProperties2,
    },
  },
  showcase: {
    data: [
      {
        value: [4200, 3000, 20000, 35000, 50000, 18000],
        name: 'Allocated Budget',
      },
      {
        value: [5000, 14000, 28000, 26000, 42000, 21000],
        name: 'Actual Spending',
      },
    ],
    indicators: [
      { name: 'Sales', max: 6500 },
      { name: 'Administration', max: 16000 },
      { name: 'Information Technology', max: 30000 },
      { name: 'Customer Support', max: 38000 },
      { name: 'Development', max: 52000 },
      { name: 'Marketing', max: 25000 },
    ],
  },
})

export const simpleChartViewerRadarState: EChartsOption = {
  title: {
    text: 'Referer of a Website',
    subtext: 'Fake Data',
    left: 'center',
  },
  legend: {
    orient: 'vertical',
    data: [],
    left: 'left',
  },
  tooltip: {
    trigger: 'item',
  },
  radar: {
    shape: 'polygon',
    indicator: [],
  },
  series: [
    {
      name: 'Budget vs spending',
      type: 'radar',
      tooltip: {
        trigger: 'item',
      },
      data: [],
    },
  ],
}

export const filledChartViewerRadarState: EChartsOption = {
  title: {
    text: 'Basic Radar Chart',
    left: 'center',
  },
  legend: {
    orient: 'vertical',
    data: [],
    left: 'left',
  },
  tooltip: {
    trigger: 'item',
  },
  radar: {
    shape: 'circle',
    indicator: [],
  },
  series: [
    {
      name: 'Budget vs spending',
      type: 'radar',
      tooltip: {
        trigger: 'item',
      },
      areaStyle: {},
      data: [],
    },
  ],
}
