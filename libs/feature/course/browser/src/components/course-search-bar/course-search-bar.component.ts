/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'

import { NgeUiListModule } from '@cisstech/nge/ui/list'
import { Course, CourseFilters } from '@platon/feature/course/common'
import { SearchBar, UiSearchBarComponent } from '@platon/shared/ui'
import { CourseService } from '../../api/course.service'
import { CourseItemComponent } from '../course-item/course-item.component'

@Component({
  standalone: true,
  selector: 'course-search-bar',
  templateUrl: './course-search-bar.component.html',
  styleUrls: ['./course-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CourseSearchBarComponent),
      multi: true,
    },
  ],
  imports: [CommonModule, NzIconModule, NzButtonModule, NgeUiListModule, UiSearchBarComponent, CourseItemComponent],
})
export class CourseSearchBarComponent implements ControlValueAccessor {
  @Input() multi = false
  @Input() filters?: CourseFilters
  @Input() disabled = false
  @Input() excludes: string[] = []

  readonly searchbar: SearchBar<Course> = {
    placeholder: 'Essayez un nom de cours...',
    clearOnSelect: true,
    filterer: {
      run: this.search.bind(this),
    },
    complete: (item) => item.name,
    onSelect: (item) => {
      if (!this.multi) {
        this.selection = []
      }

      this.selection.push(item)
      this.onChangeSelection()
    },
  }

  selection: Course[] = []

  constructor(private readonly courseService: CourseService, private readonly changeDetectorRef: ChangeDetectorRef) {}

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

  protected search(query: string): Observable<Course[]> {
    return this.courseService
      .search({
        ...(this.filters || {}),
        search: query,
      })
      .pipe(
        map((page) => {
          return page.resources.filter(this.isSelectable.bind(this)).slice(0, 5)
        })
      )
  }

  protected remove(item: Course): void {
    this.selection = this.selection.filter((e) => e.id !== item.id)
    this.onChangeSelection()
  }

  private isSelectable(item: Course): boolean {
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
