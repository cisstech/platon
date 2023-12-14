import { Component, Input } from '@angular/core'
import { JSONSchema7 } from 'json-schema'

@Component({
  selector: 'wc-docs-api-display',
  templateUrl: './api-display.component.html',
  styleUrls: ['./api-display.component.scss'],
})
export class ApiDisplayComponent {
  @Input() properties!: Record<string, JSONSchema7>

  moreInfoToolTipIndex = -1

  setMoreInfoToolTipIndex(index: number) {
    if (index === this.moreInfoToolTipIndex) {
      this.moreInfoToolTipIndex = -1
      return
    }
    this.moreInfoToolTipIndex = index
  }
}
