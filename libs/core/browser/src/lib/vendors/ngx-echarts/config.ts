// https://echarts.apache.org/handbook/en/basics/import

import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  // Dataset
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  // Built-in transform (filter, sort)
  TransformComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
// The series option types are defined with the SeriesOption suffix
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts'
// The component option types are defined with the ComponentOption suffix
import type {
  DatasetComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TitleComponentOption,
  TooltipComponentOption,
} from 'echarts/components'
import type { ComposeOption } from 'echarts/core'

// Create an Option type with only the required components and charts via ComposeOption
export type EChartsOption = ComposeOption<
  | PieSeriesOption
  | BarSeriesOption
  | LineSeriesOption
  | DatasetComponentOption
  | GridComponentOption
  | TitleComponentOption
  | LegendComponentOption
  | TooltipComponentOption
>

// Register the required components
echarts.use([
  DatasetComponent,
  GridComponent,
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  TransformComponent,
  BarChart,
  LineChart,
  PieChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
])

export { echarts }
