import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  ViewChild,
} from '@angular/core'
import * as echarts from 'echarts/core'
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { BarChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { EChartsOption, SeriesOption, TitleComponentOption, TooltipComponentOption } from 'echarts'
import { UserActivityResultsDistribution } from '@platon/feature/result/common'

@Component({
  standalone: true,
  selector: 'result-k-cile',
  templateUrl: './k-cile.component.html',
  template: `<div #chartContainer style="width: 100%; height: 100%"></div>`,
  styleUrls: ['./k-cile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KCileComponent implements AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef
  private chartInstance!: echarts.ECharts
  private selectedBucket = 10
  private distribution: UserActivityResultsDistribution[] = []
  private _splitDate!: Date
  private _lastDate!: Date
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  get bucket(): number {
    return this.selectedBucket
  }

  @Input()
  set bucket(bucket: number) {
    this.selectedBucket = bucket
    this.drawChart()
    this.changeDetectorRef.detectChanges()
  }

  @Input()
  set data(data: UserActivityResultsDistribution[]) {
    this.distribution = this.transformData(data)
    this.drawChart()
    this.changeDetectorRef.detectChanges()
  }

  get splitDate(): Date {
    return this._splitDate
  }

  @Input()
  set splitDate(splitDate: Date) {
    this._splitDate = splitDate
    this.drawChart()
    this.changeDetectorRef.detectChanges()
  }

  get lastDate(): Date {
    return this._lastDate
  }

  @Input()
  set lastDate(lastDate: Date) {
    this._lastDate = lastDate
    this.changeDetectorRef.detectChanges()
  }

  constructor() {
    echarts.use([GridComponent, BarChart, CanvasRenderer, TitleComponent, TooltipComponent])
  }

  ngAfterViewInit(): void {
    this.initChart()
    setTimeout(() => {
      this.chartInstance.resize()
    }, 0)
    this.changeDetectorRef.detectChanges()
  }

  private initChart(): void {
    const chartDom = this.chartContainer.nativeElement
    this.chartInstance = echarts.init(chartDom)
    const option: EChartsOption = this.buildChart()
    this.chartInstance.setOption(option)
  }

  private drawChart(): void {
    if (!this.chartInstance) {
      return
    }
    const option: EChartsOption = this.buildChart()
    this.chartInstance.setOption(option)
  }

  private sortPerDate(data: UserActivityResultsDistribution[]): void {
    data.forEach((d) => {
      d.nbSuccess = Object.fromEntries(
        Object.entries(d.nbSuccess).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      )
    })
  }

  private cumSum = (arr: number[]): number[] => {
    return arr.reduce((a, x, i) => [...a, x + (a[i - 1] || 0)], [] as number[])
  }

  private transformData = (data: UserActivityResultsDistribution[]): UserActivityResultsDistribution[] => {
    this.sortPerDate(data)
    return data.map((d) => {
      const cumSum = this.cumSum(Object.values(d.nbSuccess))
      return {
        ...d,
        nbSuccess: Object.fromEntries(Object.keys(d.nbSuccess).map((key, i) => [key, cumSum[i]])),
      }
    })
  }

  private constructBar(bucketSize: number, data: { date: string; value: number }[]) {
    const bars = []

    if (data.length > 0) {
      const totalGroups = Math.floor(data.length / bucketSize)

      for (let i = 0; i < totalGroups; i++) {
        const group = data.slice(i * bucketSize, (i + 1) * bucketSize)
        const sum = group.reduce((acc, d) => acc + d.value, 0)
        const avg = sum / group.length
        bars.push(avg)
      }
    }

    return bars
  }

  private readonly buildChart = (): EChartsOption => {
    if (!this.distribution.length) {
      return {}
    }
    const data = this.distribution
      .map((d) => {
        return Object.fromEntries(Object.entries(d.nbSuccess).map(([date, value]) => [date, value]))
      })
      .filter((d) => Object.keys(d).length > 0)

    const lastDatas = data
      .map((d) => {
        const lastDate = Object.keys(d).pop()
        if (!lastDate) {
          return undefined
        }
        const lastValue = d[lastDate]
        return { date: lastDate, value: lastValue }
      })
      .filter((d) => d !== undefined)

    lastDatas.sort((a, b) => a.value - b.value)

    let bars: number[] = []
    let additionalBars: number[] = []
    if (this.splitDate < this.lastDate) {
      const additionalData = lastDatas.filter((d) => new Date(d.date) < this.splitDate)
      while (additionalData.length < lastDatas.length) {
        additionalData.push({ date: '', value: 0 })
      }
      additionalData.sort((a, b) => a.value - b.value)
      const maxBar = Math.min(this.selectedBucket, additionalData.length)
      additionalBars = this.constructBar(maxBar, additionalData)
      bars = this.constructBar(maxBar, lastDatas)

      bars.forEach((_, i) => {
        bars[i] = bars[i] - additionalBars[i]
        if (bars[i] < 0) {
          bars[i] = 0
        }
      })
    } else {
      bars = this.constructBar(this.selectedBucket, lastDatas)
    }

    const style = getComputedStyle(document.body)
    const primCol = style.getPropertyValue('--brand-text-primary')
    const option: EChartsOption = {
      title: {
        text: "Histogramme des k-ciles d'avancement de l'activité",
        left: 'center',
        top: 'top',
        textStyle: {
          color: primCol,
          fontSize: 16,
          fontWeight: 'bold',
        },
      } as TitleComponentOption,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      } as TooltipComponentOption,
      xAxis: {
        type: 'category',
        data: bars.map((_, i) => i),
        axisLabel: {
          formatter: (value: any) => {
            return `${value * this.selectedBucket} - ${(parseInt(value) + 1) * this.selectedBucket}`
          },
          color: primCol,
        },
        name: bars.length + ' groupes de ' + this.selectedBucket + ' élèves',
        nameLocation: 'middle',
        nameTextStyle: {
          height: 29,
          padding: [20, 20, 20, 20],
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: primCol,
        },
        name: "Nombre d'exercices réussis",
      },
      series: [
        {
          data: additionalBars,
          type: 'bar',
          stack: 'total',
          name: 'Moyenne du début de la période à la date de séparation',
          itemStyle: {
            color: '#faa43a',
          },
          label: {
            show: true,
            position: 'inside',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => {
              const value = params.value.toFixed(1)
              return `+${value}`
            },
            color: '#ffffff',
          },
        } as SeriesOption,
        {
          data: bars,
          stack: 'total',
          type: 'bar',
          name: 'Moyenne à la fin de la période',
          itemStyle: {
            color: '#f15854',
          },
          label: {
            show: true,
            position: 'top',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => {
              const value = params.value.toFixed(1)
              return `+${value}`
            },
            color: primCol, // Couleur du texte du label
          },
        } as SeriesOption,
      ],
    }
    return option
  }

  @HostListener('window:resize')
  onResize() {
    if (this.chartInstance) {
      this.chartInstance.resize()
    }
  }
}
