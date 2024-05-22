/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, forwardRef } from '@angular/core'
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms'

import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select'

import { UserAvatarComponent } from '@platon/core/browser'
import { CourseGroup } from '@platon/feature/course/common'
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree'

@Component({
  standalone: true,
  selector: 'course-group-select',
  templateUrl: './course-group-select.component.html',
  styleUrls: ['./course-group-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CourseGroupSelectComponent),
      multi: true,
    },
  ],
  imports: [CommonModule, FormsModule, NzTreeSelectModule, UserAvatarComponent],
})
export class CourseGroupSelectComponent implements ControlValueAccessor {
  protected disabled = false
  protected nodes: NzTreeNodeOptions[] = []
  protected selection: string[] = []

  @Input() placeholder?: string

  @Input()
  set groups(value: CourseGroup[]) {
    this.nodes = value.map((group) => {
      const title = group.name
      return {
        key: group.id,
        value: group,
        title,
        isLeaf: true,
      } as NzTreeNodeOptions
    })
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  // ControlValueAccessor methods

  onTouch: any = () => {
    //
  }

  onChange: any = () => {
    //
  }

  writeValue(value: string[]): void {
    this.selection = value
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

  protected onChangeSelection(selection: string[]): void {
    this.selection = selection
    this.onTouch(selection)
    this.onChange(selection)
  }
}
