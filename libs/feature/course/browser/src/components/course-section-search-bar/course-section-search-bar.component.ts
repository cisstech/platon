/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { firstValueFrom, Observable, of } from 'rxjs'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'

import { NgeUiListModule } from '@cisstech/nge/ui/list'
import { Course, CourseSection } from '@platon/feature/course/common'
import { SearchBar, UiSearchBarComponent } from '@platon/shared/ui'
import { CourseService } from '../../api/course.service'

@Component({
  standalone: true,
  selector: 'course-section-search-bar',
  templateUrl: './course-section-search-bar.component.html',
  styleUrls: ['./course-section-search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CourseSectionSearchBarComponent),
      multi: true,
    },
  ],
  imports: [CommonModule, NzIconModule, NzButtonModule, NgeUiListModule, UiSearchBarComponent],
})
export class CourseSectionSearchBarComponent implements ControlValueAccessor {
  private dataSource: CourseSection[] = []

  @Input() multi = false
  @Input() disabled = false
  @Input() excludes: string[] = []

  @Input()
  set course(value: Course | undefined | null) {
    this.selection = []
    this.dataSource = []
    if (value) {
      firstValueFrom(this.courseService.listSections(value)).then((response) => {
        this.dataSource = response.resources
        this.onChangeSelection()
        this.changeDetectorRef.markForCheck()
      })
    } else {
      this.changeDetectorRef.markForCheck()
    }
  }

  readonly searchbar: SearchBar<CourseSection> = {
    placeholder: 'Essayez un nom de section...',
    filterer: {
      run: this.search.bind(this),
    },
    complete: (item) => item.name,
    onSelect: (item) => {
      this.searchbar.value = ''

      if (!this.multi) {
        this.selection = []
      }

      this.selection.push(item)
      this.onChangeSelection()
    },
  }

  selection: CourseSection[] = []

  constructor(
    private readonly courseService: CourseService,
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

  protected search(query: string): Observable<CourseSection[]> {
    return of(
      this.dataSource
        .filter((section) => {
          return (
            this.isSelectable(section) &&
            section.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
          )
        })
        .slice(0, 5)
    )
  }

  protected remove(item: CourseSection): void {
    this.selection = this.selection.filter((e) => e.id !== item.id)
    this.onChangeSelection()
  }

  private isSelectable(item: CourseSection): boolean {
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
