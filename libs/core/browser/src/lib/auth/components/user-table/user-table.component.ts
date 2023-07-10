/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTableModule } from 'ng-zorro-antd/table'

import { User } from '@platon/core/common'
import { UserAvatarComponent } from '../user-avatar/user-avatar.component'

type Value = string[] | undefined

@Component({
  standalone: true,
  selector: 'user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserTableComponent),
      multi: true,
    },
  ],
  imports: [CommonModule, NzTagModule, NzTableModule, UserAvatarComponent],
})
export class UserTableComponent implements OnChanges, ControlValueAccessor {
  @Input() users: User[] = []
  @Input() selectable = false

  protected loading = true
  protected checked = false
  protected disabled = false
  protected indeterminate = false
  protected selection = new Set<string>()

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['members']) {
      this.loading = false
    }
  }

  protected updateSelection(id: string, checked: boolean): void {
    if (checked) {
      this.selection.add(id)
    } else {
      this.selection.delete(id)
    }
  }

  protected refreshSelection(): void {
    this.checked = this.users.every(({ id }) => this.selection.has(id))
    this.indeterminate = this.users.some(({ id }) => this.selection.has(id)) && !this.checked

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
    this.users.forEach(({ id }) => this.updateSelection(id, checked))
    this.refreshSelection()
  }
}
