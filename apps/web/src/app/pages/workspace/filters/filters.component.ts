/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { OrderingDirections } from '@platon/core/common';
import { ResourcePipesModule } from '@platon/feature/resource/browser';
import { CircleTree, ResourceFilters, ResourceOrderings, ResourceStatus, ResourceTypes } from '@platon/feature/resource/common';
import { Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';


@Component({
  standalone: true,
  selector: 'app-workspace-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatChipsModule,
    MatInputModule,
    MatDividerModule,
    MatAutocompleteModule,

    MatRadioModule,
    MatCheckboxModule,
    MatFormFieldModule,

    ResourcePipesModule,
  ]
})
export class FiltersComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  readonly form = new FormGroup({
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

  @Input() circles: CircleTree[] = [];
  @Input() filters: ResourceFilters = {};
  @Output() filtersChange = new EventEmitter<ResourceFilters>();


  ngOnInit(): void {
    this.filters.types?.forEach(type => {
      this.form.get('types')?.patchValue({ [type]: true })
    });

    this.filters.status?.forEach(type => {
      this.form.get('status')?.patchValue({ [type]: true })
    });

    this.form.patchValue({
      period: this.filters.period,
      order: this.filters.order,
      direction: this.filters.direction,
      parent: this.filters.parent
    });

    this.subscriptions.push(
      this.form.valueChanges.subscribe(value => {
        this.filtersChange.emit(
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
          }
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  displayCircle(id: string): string {
    return this.circles.find(c => c.id === id)?.name || '';
  }
}
