import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  inject,
} from '@angular/core'

import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { FilterIndicator } from './filter-indicators'

interface IndicatorMatch<T> {
  label: string
  indicator: FilterIndicator<T>
}

@Component({
  standalone: true,
  selector: 'ui-filter-indicators',
  templateUrl: './filter-indicators.component.html',
  styleUrls: ['./filter-indicators.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, MatChipsModule],
})
export class UiFilterIndicatorComponent<T> implements OnChanges {
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected empty = false
  protected matches: IndicatorMatch<T>[] = []

  @Input() filters?: T
  @Output() filtersChange = new EventEmitter<T>()

  @Input() indicators: FilterIndicator<T>[] = []

  async ngOnChanges(): Promise<void> {
    const { filters } = this
    this.matches = []
    this.empty = true
    if (!filters) {
      return
    }

    this.matches = await Promise.all(
      this.indicators
        .filter((indicator) => indicator.match(filters))
        .map(async (indicator): Promise<IndicatorMatch<T>> => ({ label: await indicator.describe(filters), indicator }))
    )

    this.empty = !this.matches.length
    this.changeDetectorRef.detectChanges()
  }

  protected onRemoveIndicator(indicator: FilterIndicator<T>): void {
    if (this.filters) {
      this.filtersChange.emit((this.filters = indicator.remove(this.filters)))
    }
  }
}
