import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  OnInit,
  AfterViewInit,
} from '@angular/core'
import * as echart from 'echarts'
import { PeerProvider } from '../../models/peer-provider'
import { firstValueFrom } from 'rxjs'
import { PeerComparisonTree, PeerComparisonTreeOutput } from '@platon/feature/peer/common'
import { EChartsOption, SeriesOption } from 'echarts'

@Component({
  standalone: true,
  selector: 'peer-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
})
export class PeerTreeComponent implements OnInit, AfterViewInit {
  constructor(private readonly peerProvider: PeerProvider) {}
  @Input() activityId!: string

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef
  chartInstance!: echart.ECharts

  async ngOnInit(): Promise<void> {
    this.chartInstance = echart.init(this.chartContainer.nativeElement)
    this.chartInstance.on('finished', () => {
      this.chartInstance.off('finished')
      this.onResize()
    })

    const tree = await firstValueFrom(this.peerProvider.getTree(this.activityId))
    this.chartContainer.nativeElement.style.height = `${70 * tree.nbLeaves}px`
    const option = this.buildChartOption(tree)
    this.chartInstance.setOption(option)
  }

  ngAfterViewInit() {
    this.onResize()
  }

  @HostListener('window:resize')
  onResize() {
    if (this.chartInstance) {
      this.chartInstance.resize()
    }
  }

  private buildChartOption(tree: PeerComparisonTreeOutput): EChartsOption {
    const width = 60 / (tree.maxLevel ?? 1)
    const height = 90 / tree.nbLeaves
    let top = 5
    const left = 15

    const series: SeriesOption[] = []
    const base: SeriesOption = {
      type: 'tree',
      name: 'tree',
      top: '5%',
      left: '7%',
      bottom: '40%',
      right: '60%',
      symbolSize: 7,
      edgeShape: 'polyline',
      edgeForkPosition: '50%',
      orient: 'RL',
      tooltip: {
        show: false,
      },
      label: {
        color: 'black',
        backgroundColor: 'white',
        position: 'right',
        verticalAlign: 'middle',
        align: 'left',
      },
      leaves: {
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
        },
      },
      expandAndCollapse: true,
      animationDuration: 550,
      animationDurationUpdate: 750,
    }

    tree.trees.forEach((t, _) => {
      series.push({
        ...base,
        data: [t],
        name: t.name,
        top: `${top}%`,
        bottom: `${100 - (top + Math.pow(2, t.level) * height)}%`,
        left: `${left}%`,
        right: `${100 - (left + t.level * width)}%`,
        tooltip: {
          show: t.level > 0,
        },
      })
      top += Math.pow(2, t.level) * height
    })

    return {
      title: {
        text: 'Leaderboard Comparaison par les pairs',
        left: 'center',
      },
      tooltip: {
        show: false,
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: (variables) => {
          const data = (variables as echart.DefaultLabelFormatterCallbackParams).data as PeerComparisonTree
          if (data.level === 0) {
            return ''
          }
          return `${data.nbWinsPlayer1} ${data.player1}</br>${data.nbWinsPlayer2} ${data.player2}`
        },
      },
      series: series,
    }
  }
}
