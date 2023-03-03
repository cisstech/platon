
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';

import { NzDrawerModule } from 'ng-zorro-antd/drawer';

import { OrderingDirections } from '@platon/core/common';
import { CircleTree, ResourceFilters, ResourceOrderings, ResourceStatus, ResourceTypes } from '@platon/feature/resource/common';
import { Subscription } from 'rxjs';
import { ResourcePipesModule } from '../../pipes';


@Component({
  standalone: true,
  selector: 'res-filters',
  templateUrl: './resource-filters.component.html',
  styleUrls: ['./resource-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatChipsModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatDividerModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatAutocompleteModule,

    NzDrawerModule,

    ResourcePipesModule,
  ]
})
export class ResourceFiltersComponent implements OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  protected form = this.createForm();
  protected visible = false;

  @Input() circles: CircleTree[] = [];
  @Input() filters: ResourceFilters = {};
  @Output() triggered = new EventEmitter<ResourceFilters>();


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
      parent: this.filters.parent
    });

    this.filters.types?.forEach(type => {
      this.form.get('types')?.patchValue({ [type]: true })
    });

    this.filters.status?.forEach(type => {
      this.form.get('status')?.patchValue({ [type]: true })
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
          types: Object.keys(value.types)
            .filter(e => value.types[e]) as any,
          status: Object.keys(value.status)
            .filter(e => value.status[e]) as any,
          parent: value.parent as any
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

  protected displayCircle(id: string): string {
    return this.circles.find(c => c.id === id)?.name || '';
  }

  private createForm() {
    return new FormGroup({
      parent: new FormControl(''),
      order: new FormControl(ResourceOrderings.NAME),
      direction: new FormControl(OrderingDirections.ASC),
      period: new FormControl(0),
      types: new FormGroup(
        Object.keys(ResourceTypes).reduce((controls: any, type) => {
          controls[type] = new FormControl(false)
          return controls
        }, {})
      ),
      status: new FormGroup(
        Object.keys(ResourceStatus).reduce((controls: any, status) => {
          controls[status] = new FormControl(false)
          return controls
        }, {})
      )
    });
  }
}
