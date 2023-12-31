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
  SimpleChanges,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableModule,
  NzTableQueryParams,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table'
import { NzTagModule } from 'ng-zorro-antd/tag'

import { User, UserFilters, UserRoles } from '@platon/core/common'
import { UserAvatarComponent } from '../user-avatar/user-avatar.component'

type Value = string[] | undefined
type Column = {
  key: string
  name: string
  sortOrder?: NzTableSortOrder | null
  sortFn?: NzTableSortFn<User> | boolean | null
  listOfFilter?: NzTableFilterList | null
  filterFn?: NzTableFilterFn<User> | boolean | null
}

@Component({
  standalone: true,
  selector: 'user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserTableComponent),
      multi: true,
    },
  ],
  imports: [CommonModule, NzTagModule, NzTableModule, UserAvatarComponent],
})
export class UserTableComponent implements OnChanges, ControlValueAccessor {
  @Input() users: User[] = []
  @Input() total = 0
  @Input() selectable = false

  @Input() filters: UserFilters = {}
  @Output() filtersChange = new EventEmitter<UserFilters>()

  protected loading = true
  protected checked = false
  protected disabled = false
  protected indeterminate = false
  protected selection = new Set<string>()
  protected columns: Column[] = [
    {
      key: 'name',
      name: 'Utilisateur',
      sortOrder: null,
      sortFn: !this.canFilterOnServer ? (a: User, b: User) => a.username.localeCompare(b.username) : true,
    },
    {
      key: 'createdAt',
      name: `Date d'ajout`,
      sortFn: !this.canFilterOnServer
        ? (a: User, b: User) => {
            return a.createdAt.valueOf() - b.createdAt.valueOf()
          }
        : true,
    },
    {
      key: 'email',
      name: 'Email',
    },
    {
      key: 'role',
      name: 'Rôle',
      listOfFilter: [
        { text: 'Admin', value: 'admin' },
        { text: 'Enseignant', value: 'teacher' },
        { text: 'Élève', value: 'student' },
      ],
      filterFn: !this.canFilterOnServer
        ? (roles: UserRoles[], item: User) => {
            return roles.includes(item.role)
          }
        : true,
    },
    {
      key: 'status',
      name: 'Status',
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['users']) {
      this.loading = false
    }
    this.total = this.total || this.users.length
  }

  protected updateSelection(id: string, checked: boolean): void {
    if (checked) {
      this.selection.add(id)
    } else {
      this.selection.delete(id)
    }
  }

  protected refreshSelection(): void {
    this.checked = this.users.every(({ id }) => this.selection.has(id))
    this.indeterminate = this.users.some(({ id }) => this.selection.has(id)) && !this.checked

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
    this.users.forEach(({ id }) => this.updateSelection(id, checked))
    this.refreshSelection()
  }

  protected onChangeFilter(filters: UserFilters): void {
    this.filtersChange.next({ ...this.filters, ...filters })
  }

  protected onQueryParamsChange(params: NzTableQueryParams): void {
    if (!this.canFilterOnServer) return

    const { pageSize, pageIndex, sort, filter } = params
    const currentSort = sort.find((item) => item.value !== null)

    const order = (currentSort && currentSort.key) || 'name'
    const direction = (currentSort && currentSort.value) || 'ascend'

    const roles = filter.find((item) => item.key === 'role')?.value

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

      ...(roles ? { roles } : {}),
    })
  }
}
