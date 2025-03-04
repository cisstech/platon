/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { firstValueFrom } from 'rxjs'

import { NzButtonModule } from 'ng-zorro-antd/button'

import { Course, CourseSection } from '@platon/feature/course/common'
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
  imports: [CommonModule, NzButtonModule],
})
export class CourseSectionSearchBarComponent implements ControlValueAccessor {
  protected dataSource: CourseSection[] = []

  @Input()
  set course(value: Course | undefined | null) {
    this.selection = []
    this.dataSource = []
    if (value) {
      firstValueFrom(this.courseService.listSections(value))
        .then((response) => {
          this.dataSource = response.resources
          this.onChangeSelection()
          this.changeDetectorRef.markForCheck()
        })
        .catch(console.error)
    } else {
      this.changeDetectorRef.markForCheck()
    }
  }

  selection: CourseSection[] = []

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

  private onChangeSelection(): void {
    this.onTouch(this.selection[0])
    this.onChange(this.selection[0])
    this.changeDetectorRef.markForCheck()
  }

  protected selectSection(section: CourseSection): void {
    this.selection = [section]
    this.onChangeSelection()
  }
}
