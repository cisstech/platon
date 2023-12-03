import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnChanges, TemplateRef } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

export const positiveGreenColor = (value: number) => {
  if (value >= 80) return '#52C41A'
  if (value > 40 && value < 90) return '#090A39D9'
  return '#FAAD14'
}

export const positiveRedColor = (value: number) => {
  if (value >= 80) return '#FAAD14'
  if (value > 40 && value < 90) return '#090A39D9'
  return '#52C41A'
}

@Component({
  standalone: true,
  selector: 'ui-statistic-card',
  templateUrl: 'statistic-card.component.html',
  styleUrls: ['./statistic-card.component.scss'],
  imports: [CommonModule, MatIconModule, NzToolTipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiStatisticCardComponent implements OnChanges {
  @Input()
  icon: TemplateRef<unknown> | undefined

  @Input()
  matIcon?: string

  @Input()
  value!: number | string

  valueSuffix = ''

  @Input()
  valueColor = 'var(--brand-text-primary, #000)'

  @Input()
  tooltip?: string

  @Input()
  description!: string

  @Input()
  ribbonColor = '#3498db'

  @Input()
  shouldBePositive?: boolean

  @Input()
  shouldBeZero?: boolean

  ngOnChanges() {
    if (this.shouldBePositive) {
      this.valueColor = positiveGreenColor(Number(this.value))
    }

    if (this.shouldBeZero) {
      this.valueColor = positiveRedColor(Number(this.value))
    }
  }
}
