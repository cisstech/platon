/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { UserGroup } from '@platon/core/common';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { UserGroupDrawerComponent } from '../user-group-drawer/user-group-drawer.component';

type Value = string[] | undefined;

@Component({
  standalone: true,
  selector: 'user-group-table',
  templateUrl: './user-group-table.component.html',
  styleUrls: ['./user-group-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserGroupTableComponent),
      multi: true
    }
  ],
  imports: [
    CommonModule,

    NzTagModule,
    NzTableModule,

    UserAvatarComponent,
    UserGroupDrawerComponent,
  ]
})
export class UserGroupTableComponent implements OnChanges, ControlValueAccessor {
  @Input() groups: UserGroup[] = [];
  @Output() groupsChange = new EventEmitter<UserGroup[]>();

  @Input() selectable = false;

  protected loading = true;
  protected checked = false;
  protected disabled = false;
  protected indeterminate = false;
  protected selection = new Set<string>();


  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

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
    this.checked = this.groups.every(({ id }) => this.selection.has(id));
    this.indeterminate = this.groups.some(({ id }) => this.selection.has(id)) && !this.checked;

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
    this.groups
      .forEach(({ id }) => this.updateSelection(id, checked));
    this.refreshSelection();
  }

  protected onChangedGroup(group: UserGroup): void {
    this.groups = this.groups.map(g => g.id === group.id ? group : g);
    this.groupsChange.emit(this.groups);
    this.changeDetectorRef.markForCheck();
  }
}
