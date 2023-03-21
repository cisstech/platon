/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Lms } from '@platon/feature/lti/common';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { LmsDrawerComponent } from '../lms-drawer/lms-drawer.component';

type Value = string[] | undefined;

@Component({
  standalone: true,
  selector: 'lms-table',
  templateUrl: './lms-table.component.html',
  styleUrls: ['./lms-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LmsTableComponent),
      multi: true
    }
  ],
  imports: [
    CommonModule,

    NzTagModule,
    NzTableModule,
    LmsDrawerComponent,
  ]
})
export class LmsTableComponent implements OnChanges, ControlValueAccessor {
  @Input() lmses: Lms[] = [];
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
    this.checked = this.lmses.every(({ id }) => this.selection.has(id));
    this.indeterminate = this.lmses.some(({ id }) => this.selection.has(id)) && !this.checked;

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
    this.lmses
      .forEach(({ id }) => this.updateSelection(id, checked));
    this.refreshSelection();
  }
}
