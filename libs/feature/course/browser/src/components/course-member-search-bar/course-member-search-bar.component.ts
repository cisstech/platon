/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { combineLatest, firstValueFrom, Observable, Subscription } from 'rxjs'
import { map, tap } from 'rxjs/operators'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'

import { NgeUiListModule } from '@cisstech/nge/ui/list'
import { UserAvatarComponent } from '@platon/core/browser'
import { DEFAULT_SEARCH_BAR_LIMIT } from '@platon/core/common'
import { CourseMember, CourseMemberFilters } from '@platon/feature/course/common'
import { SearchBar, UiSearchBarComponent } from '@platon/shared/ui'
import { CourseService } from '../../api/course.service'

@Component({
  standalone: true,
  selector: 'course-member-search-bar',
  templateUrl: './course-member-search-bar.component.html',
  styleUrls: ['./course-member-search-bar.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CourseMemberSearchBarComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzIconModule, NzButtonModule, NgeUiListModule, UserAvatarComponent, UiSearchBarComponent],
})
export class CourseMemberSearchBarComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  private readonly courseService = inject(CourseService)
  private readonly subscriptions: Subscription[] = []
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  private totalCount = 0
  private isSearching = true

  protected selection: CourseMember[] = []
  protected readonly searchbar: SearchBar<CourseMember> = {
    placeholder: 'Rechercher un utilisateur ou un groupe par son nom, son email...',
    filterer: {
      run: this.search.bind(this),
    },
    complete: (item) => (item.user ? item.user.username : item.group?.name ?? ''),
    onSearch: (query) => {
      firstValueFrom(this.search(query)).catch(console.error)
    },
    onSelect: (item) => {
      if (this.autoSelect) return

      if (!this.multi) {
        this.selection = []
      }

      this.selection.push(item)
      this.onChangeSelection()
    },
  }

  /**
   * Placeholder of the search bar.
   */
  @Input() placeholder?: string

  /**
   * If true, the search bar will allow to select multiple members (default: true)
   */
  @Input({ transform: booleanAttribute }) multi = true

  /**
   * List of user id's or groups id's to exclude from the search results.
   */
  @Input() excludes: string[] = []

  /**
   * If true, the search bar will be disabled. (default: false)
   */
  @Input({ transform: booleanAttribute }) disabled = false

  /**
   * It true, the search result will will be automatically selected and not displayed in a list of results with a remove button.
   * (default: false)
   */
  @Input({ transform: booleanAttribute }) autoSelect = false

  /**
   * Custom filters to apply to the search.
   */
  @Input() filters: CourseMemberFilters = { limit: DEFAULT_SEARCH_BAR_LIMIT }

  @Input({ required: true }) courseId!: string

  /**
   * Total number members the current search.
   */
  get total(): number {
    return this.totalCount
  }

  /**
   * Gets a value indicating whether the search is in progress.
   */
  get searching(): boolean {
    return this.isSearching
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.courseService.onAddedMember.subscribe((member) => {
        if (member.courseId === this.courseId) {
          firstValueFrom(this.search(this.searchbar.value || '')).catch(console.error)
        }
      }),

      this.courseService.onDeletedMember.subscribe((member) => {
        if (member.courseId === this.courseId) {
          this.remove(member)
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filters && !changes.filters.firstChange) {
      firstValueFrom(this.search(this.searchbar.value || '')).catch(console.error)
    }

    this.searchbar.clearOnSelect = !this.autoSelect
    this.searchbar.placeholder = this.placeholder ?? 'Rechercher un utilisateur ou un groupe par son nom, son email...'
  }

  // ControlValueAccessor methods

  onTouch: any = () => {
    //
  }

  onChange: any = () => {
    //
  }

  writeValue(value: any): void {
    this.selection = Array.isArray(value) ? value : value ? [value] : []
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

  protected search(query: string): Observable<CourseMember[]> {
    const requests: Observable<CourseMember[]>[] = []
    this.isSearching = true
    this.changeDetectorRef.markForCheck()

    requests.push(
      this.courseService
        .searchMembers(this.courseId, {
          ...this.filters,
          search: query,
          limit: this.filters.limit ?? DEFAULT_SEARCH_BAR_LIMIT,
        })
        .pipe(
          map((page) => {
            this.totalCount = page.total
            if (this.autoSelect) {
              return page.resources
            }
            return page.resources.filter(this.isSelectable.bind(this))
          })
        )
    )

    return combineLatest(requests).pipe(
      map((res) => {
        const flat = res.flat()
        if (this.autoSelect) {
          this.selection = flat
          this.onChangeSelection()
        }
        return flat.slice(0, DEFAULT_SEARCH_BAR_LIMIT)
      }),
      tap(() => {
        this.isSearching = false
        this.changeDetectorRef.markForCheck()
      })
    )
  }

  protected remove(item: CourseMember): void {
    this.selection = this.selection.filter((e) => e.id !== item.id)
    this.onChangeSelection()
  }

  private isSelectable(item: CourseMember): boolean {
    const isSelected = this.selection.find((e) => e.id === item.id)
    const isExclued = this.excludes.find((userOrGroup) => {
      if (item.user) {
        return userOrGroup === item.user.username || userOrGroup === item.user.id
      }
      return userOrGroup === item.group?.id
    })
    return !isSelected && !isExclued
  }

  private onChangeSelection(): void {
    if (this.multi) {
      this.onTouch(this.selection)
      this.onChange(this.selection)
    } else {
      this.onTouch(this.selection[0])
      this.onChange(this.selection[0])
    }
    this.changeDetectorRef.markForCheck()
  }
}
