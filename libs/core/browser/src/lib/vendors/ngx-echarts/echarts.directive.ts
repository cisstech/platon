import { Directive, OnDestroy, OnInit, inject } from '@angular/core'
import { NgxEchartsDirective } from 'ngx-echarts'
import { Subscription } from 'rxjs'
import { ThemeService } from '../../services'

@Directive({
  standalone: true,
  selector: '[coreEcharts]',
  hostDirectives: [
    {
      directive: NgxEchartsDirective,
      inputs: ['theme', 'options', 'autoResize', 'merge', 'initOpts'],
      outputs: [
        'chartInit',
        'chartClick',
        'chartDblClick',
        'chartMouseDown',
        'chartMouseUp',
        'chartMouseOver',
        'chartMouseOut',
      ],
    },
  ],
})
export class CoreEchartsDirective implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  private readonly host = inject(NgxEchartsDirective)
  private readonly themeService = inject(ThemeService)

  ngOnInit(): void {
    this.host.theme = this.themeService.isDark ? 'dark' : 'default'
    this.subscriptions.push(
      this.themeService.themeChange.subscribe((theme) => {
        this.host.theme = theme === 'dark' ? 'dark' : 'default'
        this.host.refreshChart().catch(console.error)
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
