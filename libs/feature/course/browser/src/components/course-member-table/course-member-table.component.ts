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
  OnInit,
  Output,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { NzTableColumn, UserAvatarComponent, UserGroupDrawerComponent } from '@platon/core/browser'
import { CourseMember, CourseMemberFilters } from '@platon/feature/course/common'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table'

type Value = string[] | undefined

@Component({
  standalone: true,
  selector: 'course-member-table',
  templateUrl: './course-member-table.component.html',
  styleUrls: ['./course-member-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CourseMemberTableComponent),
      multi: true,
    },
  ],
  imports: [
    CommonModule,

    NzIconModule,
    NzTableModule,
    NzButtonModule,
    NzPopconfirmModule,

    UserAvatarComponent,
    UserGroupDrawerComponent,
  ],
})
export class CourseMemberTableComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() members: CourseMember[] = []
  @Input() editable = false
  @Input() selectable = false
  @Input() nonDeletables: string[] = []

  @Input() type: 'cours' | 'groupe' = 'cours'

  @Output() deleted = new EventEmitter<CourseMember>()

  @Input() total = 0
  @Input() loading = false

  @Input() filters: CourseMemberFilters = {}
  @Output() filtersChange = new EventEmitter<CourseMemberFilters>()

  protected checked = false
  protected disabled = false
  protected indeterminate = false
  protected selection = new Set<string>()

  protected columns: NzTableColumn<CourseMember>[] = []

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

  ngOnInit(): void {
    this.columns = [
      {
        key: 'name',
        name: 'Utilisateur/Groupe',
        sortOrder: 'ascend',
        sortFn: !this.canFilterOnServer
          ? // TODO: use the same sortFn as in the server (last_name, first_name, username)
            (a: CourseMember, b: CourseMember) => {
              const aName = a.user?.username || a.group?.name || ''
              const bName = b.user?.username || b.group?.name || ''
              return aName.localeCompare(bName)
            }
          : true,
      },
      {
        key: 'createdAt',
        name: `Date d'ajout`,
        sortFn: !this.canFilterOnServer
          ? (a: CourseMember, b: CourseMember) => {
              return a.createdAt.valueOf() - b.createdAt.valueOf()
            }
          : true,
      },
    ]
  }

  ngOnChanges() {
    this.total = this.total || this.members.length
  }

  protected updateSelection(id: string, checked: boolean): void {
    if (checked) {
      this.selection.add(id)
    } else {
      this.selection.delete(id)
    }
  }

  protected refreshSelection(): void {
    this.checked = this.members.every(({ id }) => this.selection.has(id))
    this.indeterminate = this.members.some(({ id }) => this.selection.has(id)) && !this.checked

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
    this.members.forEach(({ id }) => this.updateSelection(id, checked))
    this.refreshSelection()
  }

  protected onChangeFilter(filters: CourseMemberFilters): void {
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
