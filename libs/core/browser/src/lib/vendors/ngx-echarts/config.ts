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
  DataZoomComponent,
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
  DataZoomComponentOption,
} from 'echarts/components'
import type { ComposeOption } from 'echarts/core'
import { darkTheme } from './themes'

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
  | DataZoomComponentOption
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
  DataZoomComponent,
  BarChart,
  LineChart,
  PieChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  RadarChart,
])

echarts.registerTheme('dark', darkTheme)

// TODO: register local https://xieziyu.github.io/ngx-echarts/api-doc/#custom-locale

export { echarts }
