// https://echarts.apache.org/handbook/en/basics/import

import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts'
import {
  // Dataset
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
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
  RadarComponentOption,
  TitleComponentOption,
  TooltipComponentOption,
  ToolboxComponentOption,
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
  | ToolboxComponentOption
  | TooltipComponentOption
  | RadarComponentOption
>

// Register the required components
echarts.use([
  DatasetComponent,
  GridComponent,
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  ToolboxComponent,
  TransformComponent,
  BarChart,
  LineChart,
  PieChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  RadarChart,
])

export { echarts }
