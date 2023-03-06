/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UserAvatarComponent } from '@platon/core/browser';
import { CourseMember } from '@platon/feature/course/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';

type Value = string[] | undefined;

@Component({
  standalone: true,
  selector: 'course-member-table',
  templateUrl: './member-table.component.html',
  styleUrls: ['./member-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CourseMemberTableComponent),
      multi: true
    }
  ],
  imports: [
    CommonModule,

    NzIconModule,
    NzTableModule,
    NzButtonModule,
    NzPopconfirmModule,

    UserAvatarComponent,
  ]
})
export class CourseMemberTableComponent implements OnChanges, ControlValueAccessor {
  @Input() members: CourseMember[] = [];
  @Input() editable = false;
  @Input() selectable = false;
  @Input() nonDeletables: string[] = [];

  @Output() deleted = new EventEmitter<CourseMember>();

  protected loading = true;
  protected checked = false;
  protected disabled = false;
  protected indeterminate = false;
  protected selection = new Set<string>();


  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  // ControlValueAccessor methods

  onTouch: any = () => {
    //
  }
  onChange: any = () => {
    //
  }

  writeValue(value: Value): void {
    this.selection = new Set(value || []);
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['members']) {
      this.loading = false;
    }
  }

  protected updateSelection(id: string, checked: boolean): void {
    if (checked) {
      this.selection.add(id);
    } else {
      this.selection.delete(id);
    }
  }

  protected refreshSelection(): void {
    this.checked = this.members.every(({ id }) => this.selection.has(id));
    this.indeterminate = this.members.some(({ id }) => this.selection.has(id)) && !this.checked;

    const selection = Array.from(this.selection);
    this.onTouch(selection);
    this.onChange(selection);
    this.changeDetectorRef.markForCheck();
  }

  protected onItemChecked(id: string, checked: boolean): void {
    this.updateSelection(id, checked);
    this.refreshSelection();
  }

  protected onAllChecked(checked: boolean): void {
    this.members
      .forEach(({ id }) => this.updateSelection(id, checked));
    this.refreshSelection();
  }
}
