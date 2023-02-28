/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';


@Component({
  standalone: true,
  selector: 'ui-filter-indicators',
  templateUrl: './filter-indicators.component.html',
  styleUrls: ['./filter-indicators.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class UiFilterIndicatorComponent<T> {
  @Input() indicators?: FilterIndicator<T>[];
  @Input() filters?: T;

  protected trackByLabel(_: number, item: FilterIndicator<T>): string {
    return item.label;
  }
}

export interface FilterIndicator<T> {
  label: string,
  remove: (filters: T) => T
}

export type FilterMatcher<T> = (filters: T) => FilterIndicator<T> | undefined

export const matchIndicators = <T>(
  filters: T,
  matchers: FilterMatcher<T>[],
  onChange: (filters: T) => void
) => {
  const indicators: FilterIndicator<T>[] = [];
  matchers.forEach(matcher => {
    const indicator = matcher(filters);
    if (indicator) {
      indicators.push({
        ...indicator,
        remove: (filters) => {
          const data = indicator.remove(filters)
          onChange(data)
        },
      } as FilterIndicator<T>);
    }
  });
  return indicators;
}


export const PeriodFilterMatcher = (filters: any) => filters.period !== 0
  ? {
    label: `Modifié il y a au moins ${filters.period}`,
    remove: (filters: any) => ({
      ...filters,
      period: 0
    })
  } as FilterIndicator<any>
  : undefined
