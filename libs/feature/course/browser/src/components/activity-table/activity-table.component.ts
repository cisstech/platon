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
import { RouterModule } from '@angular/router'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzTagModule } from 'ng-zorro-antd/tag'

import { Activity, CourseSection } from '@platon/feature/course/common'
import { antTagColorFromPercentage, UiModalDrawerComponent } from '@platon/shared/ui'

import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { CoursePipesModule } from '../../pipes'
import { CourseActivitySettingsComponent } from '../activity-settings/activity-settings.component'

type Value = string[] | undefined
type Model = {
  section?: CourseSection
  activity: Activity
  progressionColor: string
}

@Component({
  standalone: true,
  selector: 'course-activity-table',
  templateUrl: './activity-table.component.html',
  styleUrls: ['./activity-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CourseActivityTableComponent),
      multi: true,
    },
  ],
  imports: [
    CommonModule,
    RouterModule,

    NzIconModule,
    NzTagModule,
    NzTableModule,
    NzButtonModule,
    NzToolTipModule,
    NzPopconfirmModule,

    CoursePipesModule,

    UiModalDrawerComponent,
    CourseActivitySettingsComponent,
  ],
})
export class CourseActivityTableComponent implements OnChanges, ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected loading = true
  protected checked = false
  protected disabled = false
  protected indeterminate = false
  protected selection = new Set<string>()
  protected dataSource: Model[] = []
  protected settingsSelectedActivity?: Activity

  @Input() sections: CourseSection[] = []
  @Input() activities: Activity[] = []

  @Input() editable = false
  @Input() selectable = false

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
    if (changes['activities']) {
      this.loading = false
    }

    this.dataSource = this.activities.map((activity) => ({
      section: this.sections.find(({ id }) => id === activity.sectionId),
      activity,
      progressionColor: antTagColorFromPercentage(activity.progression),
    }))
  }

  protected updateSelection(id: string, checked: boolean): void {
    if (checked) {
      this.selection.add(id)
    } else {
      this.selection.delete(id)
    }
  }

  protected refreshSelection(): void {
    this.checked = this.activities.every(({ id }) => this.selection.has(id))
    this.indeterminate = this.activities.some(({ id }) => this.selection.has(id)) && !this.checked

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
    this.activities.forEach(({ id }) => this.updateSelection(id, checked))
    this.refreshSelection()
  }
}
