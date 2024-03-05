/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { combineLatest, firstValueFrom, Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'

import { NgeUiListModule } from '@cisstech/nge/ui/list'
import { DEFAULT_SEARCH_BAR_LIMIT } from '@platon/core/common'
import { Lms, LmsFilters } from '@platon/feature/lti/common'
import { SearchBar, UiSearchBarComponent } from '@platon/shared/ui'
import { LTIService } from '../../api/lti.service'

@Component({
  standalone: true,
  selector: 'lms-search-bar',
  templateUrl: './lms-search-bar.component.html',
  styleUrls: ['./lms-search-bar.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LmsSearchBarComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzIconModule, NzButtonModule, NgeUiListModule, UiSearchBarComponent],
})
export class LmsSearchBarComponent implements OnChanges, ControlValueAccessor {
  private readonly ltiService = inject(LTIService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private totalCount = 0
  private isSearching = false

  @Input() multi = true
  @Input() excludes: string[] = []
  @Input() disabled = false
  @Input() autoSelect = false
  @Input() filters: LmsFilters = { limit: DEFAULT_SEARCH_BAR_LIMIT }

  readonly searchbar: SearchBar<Lms> = {
    placeholder: 'Essayez un nom...',
    filterer: {
      run: this.search.bind(this),
    },
    complete: (item) => item.name,
    onSelect: (item) => {
      if (this.autoSelect) return

      if (!this.multi) {
        this.selection = []
      }

      this.selection.push(item)
      this.onChangeSelection()
    },
  }

  selection: Lms[] = []

  get total(): number {
    return this.totalCount
  }

  get searching(): boolean {
    return this.isSearching
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filters && !changes.filters.firstChange) {
      firstValueFrom(this.search(this.searchbar.value || '')).catch(console.error)
    }
    this.searchbar.clearOnSelect = !this.autoSelect
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

  protected search(query: string): Observable<Lms[]> {
    const requests: Observable<Lms[]>[] = []
    this.isSearching = true
    this.changeDetectorRef.markForCheck()

    requests.push(
      this.ltiService
        .searchLms({
          ...this.filters,
          search: query,
          limit: this.filters?.limit ?? DEFAULT_SEARCH_BAR_LIMIT,
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

  protected remove(item: Lms): void {
    this.selection = this.selection.filter((e) => e.id !== item.id)
    this.onChangeSelection()
  }

  private isSelectable(item: Lms): boolean {
    const isSelected = this.selection.find((e) => e.id === item.id)
    const isExclued = this.excludes.find((id) => {
      return id === item.id
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
