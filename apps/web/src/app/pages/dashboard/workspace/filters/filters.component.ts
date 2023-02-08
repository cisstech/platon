import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

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

    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatExpansionModule,

    MatRadioModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
  ]
})
export class FiltersComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  readonly form = new FormGroup({
    date: new FormControl(0),
    order: new FormControl('name'),
    status: new FormControl('all'),
    circles: new FormControl(false),
    exercises: new FormControl(false),
    activities: new FormControl(false),
    visibility: new FormControl('all'),
  });

  constructor(
    private readonly activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.form.valueChanges.subscribe(value => {
        console.log(value);
      })
    );

    this.subscriptions.push(
      this.activatedRoute.queryParams.subscribe((e) => {
        //this.filter.search = e.q ?? this.filter.search;

        //const types = e.types || '';
      /*   this.form.patchValue({
          date: Number.parseInt(e.date, 10) || this.filter.updatedAt || 0,
          order: e.order || this.filter.orderBy || 'name',
          status: e.status ?? 'all',
          visibility: e.visibility ?? 'all',
          models: types.includes('model'),
          exercises: types.includes('exercise'),
          activities: types.includes('activity'),
        }); */
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
