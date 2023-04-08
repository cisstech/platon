/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { UserAvatarComponent } from '@platon/core/browser';
import { userDisplayName } from '@platon/core/common';
import { CourseMember } from '@platon/feature/course/common';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';

@Component({
  standalone: true,
  selector: 'course-member-select',
  templateUrl: './course-member-select.component.html',
  styleUrls: ['./course-member-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CourseMemberSelectComponent),
      multi: true
    }
  ],
  imports: [
    CommonModule,
    FormsModule,

    NzTreeSelectModule,
    UserAvatarComponent,
  ]
})
export class CourseMemberSelectComponent implements ControlValueAccessor {

  protected disabled = false
  protected nodes: NzTreeNodeOptions[] = [];
  protected selection: string[] = []

  @Input() placeholder?: string;

  @Input()
  set members(value: CourseMember[]) {
    this.nodes = value.map(member => {
      const title = member.user ? userDisplayName(member.user) : member.group?.name || '';
      return {
        key: member.id,
        value: {
          user: member.user,
          group: member.group,
        },
        title,
        isLeaf: !member.group,
        children: member.group ? member.group.users.map(user => {
          return {
            key: `${member.id}:${user.id}`,
            value: {
              user,
            },
            title: userDisplayName(user),
            isLeaf: true
          } as NzTreeNodeOptions
        }) : undefined
      } as NzTreeNodeOptions;
    });
  }

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

  writeValue(value: string[]): void {
    this.selection = value;
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

  protected onChangeSelection(selection: string[]): void {
    this.selection = selection;
    this.onTouch(selection);
    this.onChange(selection);
  }
}
