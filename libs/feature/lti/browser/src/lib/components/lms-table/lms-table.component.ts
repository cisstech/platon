/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { NzTableColumn } from '@platon/core/browser'
import { Lms, LmsFilters } from '@platon/feature/lti/common'

import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table'

type Value = string[] | undefined

@Component({
  standalone: true,
  selector: 'lms-table',
  templateUrl: './lms-table.component.html',
  styleUrls: ['./lms-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LmsTableComponent),
      multi: true,
    },
  ],
  imports: [CommonModule, NzTableModule],
})
export class LmsTableComponent implements OnChanges, ControlValueAccessor {
  @Input() total = 0
  @Input() loading = true
  @Input() lmses: Lms[] = []
  @Input() selectable = false
  @Input() filters: LmsFilters = {}
  @Output() filtersChange = new EventEmitter<LmsFilters>()
  @Output() openDetails = new EventEmitter<Lms>()

  protected checked = false
  protected disabled = false
  protected indeterminate = false
  protected selection = new Set<string>()

  protected columns: NzTableColumn<Lms>[] = [
    {
      key: 'name',
      name: 'Nom',
      sortOrder: null,
      sortFn: !this.canFilterOnServer ? (a: Lms, b: Lms) => a.name.localeCompare(b.name) : true,
    },
    {
      key: 'url',
      name: 'URL',
    },
    {
      key: 'createdAt',
      name: `Date d'ajout`,
      sortFn: !this.canFilterOnServer
        ? (a: Lms, b: Lms) => {
            return a.createdAt.valueOf() - b.createdAt.valueOf()
          }
        : true,
    },
  ]

  protected get canFilterOnServer(): boolean {
    return this.filtersChange.observed
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  // ControlValueAccessor methods

  onTouch: any = () => {
    //
  }

  onChange: any = () => {
    //
  }

  writeValue(value: Value): void {
    this.selection = new Set(value || [])
    this.changeDetectorRef.markForCheck()
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  ngOnChanges() {
    this.total = this.total || this.lmses.length
  }

  protected updateSelection(id: string, checked: boolean): void {
    if (checked) {
      this.selection.add(id)
    } else {
      this.selection.delete(id)
    }
  }

  protected refreshSelection(): void {
    this.checked = this.lmses.every(({ id }) => this.selection.has(id))
    this.indeterminate = this.lmses.some(({ id }) => this.selection.has(id)) && !this.checked

    const selection = Array.from(this.selection)
    this.onTouch(selection)
    this.onChange(selection)
    this.changeDetectorRef.markForCheck()
  }

  protected onItemChecked(id: string, checked: boolean): void {
    this.updateSelection(id, checked)
    this.refreshSelection()
  }

  protected onAllChecked(checked: boolean): void {
    this.lmses.forEach(({ id }) => this.updateSelection(id, checked))
    this.refreshSelection()
  }

  protected onChangeFilter(filters: LmsFilters): void {
    this.filtersChange.next({ ...this.filters, ...filters })
  }

  protected onQueryParamsChange(params: NzTableQueryParams): void {
    if (!this.canFilterOnServer) return

    const { pageSize, pageIndex, sort } = params
    const currentSort = sort.find((item) => item.value !== null)

    const order = (currentSort && currentSort.key) || 'name'
    const direction = (currentSort && currentSort.value) || 'ascend'

    this.onChangeFilter({
      order: {
        name: 'NAME' as const,
        createdAt: 'CREATED_AT' as const,
      }[order],
      direction: {
        ascend: 'ASC' as const,
        descend: 'DESC' as const,
      }[direction],
      limit: pageSize,
      offset: pageSize * (pageIndex - 1),
    })
  }
}
