import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core'
import { DocsModule, WebComponentDefinition, WebComponentService } from '@platon/feature/webcomponent'
import { UiError404Component } from '@platon/shared/ui'

@Component({
  standalone: true,
  imports: [DocsModule, UiError404Component],
  selector: 'app-wc-plaground',
  templateUrl: 'wc-playground.page.html',
  styleUrl: 'wc-playground.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WcPlaygroundPage implements OnInit {
  private readonly api = inject(WebComponentService)
  protected definition?: WebComponentDefinition

  @Input()
  protected readonly selector!: string

  ngOnInit(): void {
    if (this.selector) {
      this.definition = this.api.findBySelector(this.selector)
    }
  }
}
