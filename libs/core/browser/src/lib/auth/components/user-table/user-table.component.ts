/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table'

import { UpdateUser, User, UserFilters, UserRoles } from '@platon/core/common'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTableColumn } from '../../../vendors/ng-zorro'
import { UserAvatarComponent } from '../user-avatar/user-avatar.component'
import { AuthService } from '../../api/auth.service'

type Value = string[] | undefined

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
  imports: [
    CommonModule,
    NzTagModule,
    NzIconModule,
    NzDropDownModule,
    NzTableModule,
    NzPopconfirmModule,
    UserAvatarComponent,
  ],
})
export class UserTableComponent implements OnInit, OnChanges, ControlValueAccessor {
  private readonly authService = inject(AuthService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  @Input() users: User[] = []
  @Input() total = 0
  @Input() loading = false
  @Input() editable = false
  @Input() selectable = false
  @Input() filters: UserFilters = {}
  @Output() filtersChange = new EventEmitter<UserFilters>()
  @Output() update = new EventEmitter<[User, UpdateUser]>()

  protected checked = false
  protected disabled = false
  protected indeterminate = false
  protected currentUserId?: string
  protected selection = new Set<string>()
  protected columns: NzTableColumn<User>[] = []

  protected get canFilterOnServer(): boolean {
    return this.filtersChange.observed
  }

  ngOnInit(): void {
    this.authService
      .ready()
      .catch(console.error)
      .then((user) => {
        this.currentUserId = user?.id
        this.changeDetectorRef.markForCheck()
      })

    this.columns = [
      {
        key: 'name',
        name: 'Utilisateur',
        sortOrder: 'ascend',
        // TODO: use the same sortFn as in the server (last_name, first_name, username)
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
        filterMultiple: true,
        filterFn: !this.canFilterOnServer
          ? (roles: UserRoles[], item: User) => {
              return roles.includes(item.role)
            }
          : true,
      },
      {
        key: 'status',
        name: 'Status',
        listOfFilter: [
          { text: 'Active', value: 'active' },
          { text: 'Inactive', value: 'inactive' },
        ],
        filterMultiple: false,
        filterFn: !this.canFilterOnServer
          ? (status: string, item: User) => {
              return status === 'active' ? item.active : !item.active
            }
          : true,
      },
    ]
  }

  ngOnChanges() {
    this.total = this.total || this.users.length
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
    const status = filter.find((item) => item.key === 'status')?.value

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
      ...(status ? { active: status === 'active' } : { active: undefined }),
    })
  }
}
