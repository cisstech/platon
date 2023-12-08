/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'

import { NgeUiListModule } from '@cisstech/nge/ui/list'
import { Cas, CasFilters } from '@platon/feature-cas-common'
import { SearchBar, UiSearchBarComponent } from '@platon/shared/ui'
import { CasService } from '../../api/cas.service'

@Component({
  standalone: true,
  selector: 'cas-search-bar',
  templateUrl: './cas-search-bar.component.html',
  styleUrls: ['./cas-search-bar.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CasSearchBarComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzIconModule, NzButtonModule, NgeUiListModule, UiSearchBarComponent],
})
export class CasSearchBarComponent implements ControlValueAccessor {
  @Input() multi = true
  @Input() excludes: string[] = []
  @Input() disabled = false
  @Input() autoSelect = false

  @Input() filters: CasFilters = {
    limit: 5,
  }

  readonly searchbar: SearchBar<Cas> = {
    placeholder: 'Essayez un nom...',
    filterer: {
      run: this.search.bind(this),
    },
    complete: (item) => item.name,
    onSelect: (item) => {
      if (this.autoSelect) return

      this.searchbar.value = ''
      if (!this.multi) {
        this.selection = []
      }

      this.selection.push(item)
      this.onChangeSelection()
    },
  }

  selection: Cas[] = []

  constructor(private readonly casService: CasService, private readonly changeDetectorRef: ChangeDetectorRef) {}

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

  protected search(query: string): Observable<Cas[]> {
    const requests: Observable<Cas[]>[] = []

    requests.push(
      this.casService
        .searchCas({
          ...this.filters,
          search: query,
        })
        .pipe(
          map((page) => {
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
        return flat.slice(0, 5)
      })
    )
  }

  protected remove(item: Cas): void {
    this.selection = this.selection.filter((e) => e.id !== item.id)
    this.onChangeSelection()
  }

  private isSelectable(item: Cas): boolean {
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
