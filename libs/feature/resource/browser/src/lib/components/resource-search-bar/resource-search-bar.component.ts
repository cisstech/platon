/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'

import { NgeUiListModule } from '@cisstech/nge/ui/list'
import { Resource, ResourceFilters } from '@platon/feature/resource/common'
import { SearchBar, UiSearchBarComponent } from '@platon/shared/ui'
import { ResourceService } from '../../api/resource.service'
import { ResourceItemComponent } from '../resource-item/resource-item.component'

@Component({
  standalone: true,
  selector: 'resource-search-bar',
  templateUrl: './resource-search-bar.component.html',
  styleUrls: ['./resource-search-bar.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ResourceSearchBarComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzIconModule, NzButtonModule, NgeUiListModule, UiSearchBarComponent, ResourceItemComponent],
})
export class ResourceSearchBarComponent implements ControlValueAccessor {
  @Input() multi = false
  @Input() filters?: ResourceFilters
  @Input() disabled = false
  @Input() excludes: string[] = []

  @Input() modalMode = false
  @Input() simpleLayout = false

  readonly searchbar: SearchBar<Resource> = {
    placeholder: 'Essayez un nom, un topic, un niveau...',
    clearOnSelect: true,
    filterer: {
      run: this.search.bind(this),
    },
    complete: (item) => item.name,
    onSelect: (item) => {
      if (!this.multi) {
        this.selection = []
      }

      this.selection = [...this.selection, item]
      this.onChangeSelection()
    },
  }

  selection: Resource[] = []

  constructor(
    private readonly resourceService: ResourceService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

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

  protected search(query: string): Observable<Resource[]> {
    return this.resourceService
      .search({
        ...(this.filters || {}),
        search: query,
        expands: ['metadata', 'statistic'],
      })
      .pipe(
        map((page) => {
          return page.resources.filter(this.isSelectable.bind(this)).slice(0, 5)
        })
      )
  }

  protected remove(item: Resource): void {
    this.selection = this.selection.filter((e) => e.id !== item.id)
    this.onChangeSelection()
  }

  private isSelectable(item: Resource): boolean {
    const isSelected = this.selection.find((e) => e.id === item.id)
    const isExclued = this.excludes.find((courseId) => {
      return courseId === item.id
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
