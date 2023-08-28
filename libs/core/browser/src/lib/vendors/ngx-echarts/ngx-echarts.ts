import { Provider } from '@angular/core'
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts'

export const NgxEChartsProviders: Provider = {
  provide: NGX_ECHARTS_CONFIG,
  useFactory: () => ({
    echarts: () =>
      import(
        /* webpackChunkName: "echarts" */
        './config'
      ).then((m) => m.echarts),
  }),
}
