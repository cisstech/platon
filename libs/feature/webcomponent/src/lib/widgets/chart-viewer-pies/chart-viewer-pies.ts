import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'
import { ChartViewerBase1, ChartViewerBaseProperties1 } from '../../shared/components/chart-viewer/base'
import { EChartsOption } from 'echarts'

export interface ChartViewerPiesState extends IWebComponent, ChartViewerBase1 {
  mode: 'simple' | 'donut' | 'half-donut' | 'nightingale'
}

export const ChartViewerPiesComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'ChartViewer-Pies',
  selector: 'wc-chart-viewer-pies',
  description: "Permets d'afficher une charte de type `camembert` en fournissant des données",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'ChartViewer-Pies',
    required: ['data'],
    properties: {
      mode: {
        type: 'string',
        default: 'simple',
        description: "Mode d'affichage du graphe : simple, donuts ou half-donuts",
        enum: ['simple', 'donut', 'half-donut', 'nightingale'],
      },
      ...ChartViewerBaseProperties1,
    },
  },
  showcase: {
    data: [
      {
        name: 'Germany',
        value: 8940000,
      },
      {
        name: 'USA',
        value: 5000000,
      },
      {
        name: 'France',
        value: 7200000,
      },
      {
        name: 'UK',
        value: 6200000,
      },
      {
        name: 'Italy',
        value: 4200000,
      },
      {
        name: 'Japan',
        value: 1285420,
      },
      {
        name: 'Spain',
        value: 8200000,
      },
    ],
  },
})

export const simpleChartViewerPiesState: EChartsOption = {
  title: {
    text: 'PLaTon Chart',
    subtext: 'Graph viewer pies',
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: '50%',
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
}

export const donutChartViewerPiesState: EChartsOption = {
  title: {
    text: 'PLaTon Chart',
    subtext: 'Graph viewer pies',
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: [],
    },
  ],
}

export const halfdonutChartViewerPiesState: EChartsOption = {
  title: {
    text: 'PLaTon Chart',
    subtext: 'Graph viewer pies',
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
  },
  legend: {
    top: '5%',
    left: 'center',
    // doesn't perfectly work with our tricks, disable it
    selectedMode: false,
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '70%'],
      // adjust the start angle
      startAngle: 180,
      label: {
        show: true,
        formatter(param) {
          // correct the percentage
          return param.name + ' (' + (param.percent ?? 0 * 2) + '%)'
        },
      },
      data: [],
    },
  ],
}

export const nightingaleChartViewerPiesState: EChartsOption = {
  title: {
    text: 'PLaTon Chart',
    subtext: 'Graph viewer pies',
    left: 'center',
  },
  legend: {
    top: 'bottom',
  },
  toolbox: {
    show: true,
    feature: {
      mark: { show: true },
      dataView: { show: true, readOnly: false },
      restore: { show: true },
      saveAsImage: { show: true },
    },
  },
  series: [
    {
      name: 'Nightingale Chart',
      type: 'pie',
      radius: [50, 150],
      center: ['50%', '50%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 8,
      },
      data: [],
    },
  ],
}
