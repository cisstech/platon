
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';

import { NzDrawerModule } from 'ng-zorro-antd/drawer';

import { OrderingDirections } from '@platon/core/common';
import { CourseFilters, CourseOrderings } from '@platon/feature/course/common';
import { Subscription } from 'rxjs';
import { CoursePipesModule } from '../../pipes';


@Component({

  standalone: true,
  selector: 'course-filters',
  templateUrl: './course-filters.component.html',
  styleUrls: ['./course-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatRadioModule,
    MatButtonModule,
    MatDividerModule,
    MatCheckboxModule,
    MatFormFieldModule,

    NzDrawerModule,

    CoursePipesModule,
  ]
})
export class CourseFiltersComponent implements OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  protected form = this.createForm();
  protected visible = false;

  @Input() filters: CourseFilters = {};
  @Output() triggered = new EventEmitter<CourseFilters>();

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  open(): void {
    this.form = this.createForm();

    this.form.patchValue({
      period: this.filters.period,
      order: this.filters.order,
      direction: this.filters.direction,
    });

    this.visible = true;
    this.changeDetectorRef.markForCheck();


    this.subscriptions.push(
      this.form.valueChanges.subscribe(value => {
        this.filters = {
          ...this.filters,
          direction: value.direction as any,
          order: value.order as any,
          period: value.period as any,
        };
      })
    );
  }

  protected close(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions.splice(0, this.subscriptions.length);

    this.visible = false;
    this.changeDetectorRef.markForCheck();
  }

  private createForm() {
    return new FormGroup({
      order: new FormControl(CourseOrderings.NAME),
      direction: new FormControl(OrderingDirections.ASC),
      period: new FormControl(0),
    });
  }
}
