import { provideEchartsCore } from 'ngx-echarts'

export const NgxEChartsProviders = provideEchartsCore({
  echarts: () =>
    import(
      /* webpackChunkName: "echarts" */
      './config'
    ).then((m) => m.echarts),
})
