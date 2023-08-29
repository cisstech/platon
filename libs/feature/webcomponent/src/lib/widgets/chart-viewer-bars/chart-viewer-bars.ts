import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'
import { ChartViewerBase, ChartViewerBaseProperties } from '../../shared/components/chart-viewer/base'
import { EChartsOption } from 'echarts'

export interface ChartViewerBarsState extends IWebComponent, ChartViewerBase {
  mode: 'horizontal' | 'vertical'
  xAxisLabel: string
  yAxisLabel: string
}

export const ChartViewerBarsComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'ChartViewer-Bars',
  icon: 'assets/images/components/forms/code-editor/code-editor.svg',
  selector: 'wc-chart-viewer-bars',
  description: "Permets d'afficher une charte de type `histogramme` en fournissant des données",
  fullDescriptionUrl: 'assets/docs/components/widgets/chart-viewer-bars/chart-viewer-bars.md',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'ChartViewer-Bars',
    required: ['data'],
    properties: {
      mode: {
        type: 'string',
        default: 'horizontal',
        description: "Mode d'affichage du graphe : horizontal ou vertical",
        enum: ['horizontal', 'vertical'],
      },
      xAxisLabel: {
        type: 'string',
        default: 'Axe X',
        description: "Label de l'axe horizontal",
      },
      yAxisLabel: {
        type: 'string',
        default: 'Axe Y',
        description: "Label de l'axe vertical",
      },
      ...ChartViewerBaseProperties,
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

export const simpleChartViewerBarsState: EChartsOption = {
  title: {
    text: 'Waterfall Chart',
    subtext: 'Living Expenses in Shenzhen',
    left: 'center',
  },
  grid: { containLabel: true },
  xAxis: {
    type: 'category',
    axisLabel: { interval: 0, rotate: 30 },
  },
  yAxis: {
    type: 'value',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  dataset: {
    source: [],
  },
  series: [
    {
      type: 'bar',
      encode: {
        // Map the "amount" column to X axis.
        x: 'key',
        // Map the "product" column to Y axis
        y: 'value',
      },
    },
  ],
}

export const horizontalChartViewerBarsState: EChartsOption = {
  title: {
    text: 'Waterfall Chart',
    subtext: 'Living Expenses in Shenzhen',
    left: 'center',
  },
  grid: { containLabel: true },
  xAxis: {
    type: 'category',
    axisLabel: { interval: 0, rotate: 30 },
  },
  yAxis: {
    type: 'value',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  dataset: {
    source: [],
  },
  series: [
    {
      type: 'bar',
      encode: {
        // Map the "amount" column to X axis.
        x: 'key',
        // Map the "product" column to Y axis
        y: 'value',
      },
    },
  ],
}
