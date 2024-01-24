/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  forwardRef,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

import { UserFilters, UserGroup } from '@platon/core/common'
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table'
import { NzTableColumn } from '../../../vendors/ng-zorro'
import { UserAvatarComponent } from '../user-avatar/user-avatar.component'

type Value = string[] | undefined

@Component({
  standalone: true,
  selector: 'user-group-table',
  templateUrl: './user-group-table.component.html',
  styleUrls: ['./user-group-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserGroupTableComponent),
      multi: true,
    },
  ],
  imports: [CommonModule, NzTableModule, UserAvatarComponent],
})
export class UserGroupTableComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() groups: UserGroup[] = []
  @Output() groupsChange = new EventEmitter<UserGroup[]>()

  @Input() total = 0
  @Input() loading = false
  @Input() selectable = false
  @Input() filters: UserFilters = {}
  @Output() filtersChange = new EventEmitter<UserFilters>()
  @Output() openDetails = new EventEmitter<UserGroup>()

  protected checked = false
  protected disabled = false
  protected indeterminate = false
  protected selection = new Set<string>()

  protected columns: NzTableColumn<UserGroup>[] = []

  protected get canFilterOnServer(): boolean {
    return this.filtersChange.observed
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.columns = [
      {
        key: 'name',
        name: 'Nom',
        sortOrder: null,
        sortFn: !this.canFilterOnServer ? (a: UserGroup, b: UserGroup) => a.name.localeCompare(b.name) : true,
      },
      {
        key: 'createdAt',
        name: `Date d'ajout`,
        sortFn: !this.canFilterOnServer
          ? (a: UserGroup, b: UserGroup) => {
              return a.createdAt.valueOf() - b.createdAt.valueOf()
            }
          : true,
      },
    ]
  }

  ngOnChanges() {
    this.total = this.total || this.groups.length
  }

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

  protected updateSelection(id: string, checked: boolean): void {
    if (checked) {
      this.selection.add(id)
    } else {
      this.selection.delete(id)
    }
  }

  protected refreshSelection(): void {
    this.checked = this.groups.every(({ id }) => this.selection.has(id))
    this.indeterminate = this.groups.some(({ id }) => this.selection.has(id)) && !this.checked

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
    this.groups.forEach(({ id }) => this.updateSelection(id, checked))
    this.refreshSelection()
  }

  protected onChangeFilter(filters: UserFilters): void {
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
