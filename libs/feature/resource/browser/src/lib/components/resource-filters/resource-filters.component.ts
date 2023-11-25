import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'

import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatChipsModule } from '@angular/material/chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatRadioModule } from '@angular/material/radio'

import { NzDrawerModule } from 'ng-zorro-antd/drawer'
import { NzSelectModule } from 'ng-zorro-antd/select'

import { OrderingDirections } from '@platon/core/common'
import {
  CircleTree,
  ResourceFilters,
  ResourceOrderings,
  ResourceStatus,
  ResourceTypes,
} from '@platon/feature/resource/common'
import { Subscription } from 'rxjs'
import { ResourcePipesModule } from '../../pipes'

@Component({
  standalone: true,
  selector: 'resource-filters',
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
    NzSelectModule,

    ResourcePipesModule,
  ],
})
export class ResourceFiltersComponent implements OnDestroy {
  private readonly subscriptions: Subscription[] = []

  protected form = this.createForm()
  protected visible = false

  @Input() circles: CircleTree[] = []
  @Input() filters: ResourceFilters = {}
  @Output() triggered = new EventEmitter<ResourceFilters>()

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  open(): void {
    this.form = this.createForm()

    this.form.patchValue({
      period: this.filters.period,
      order: this.filters.order,
      direction: this.filters.direction,
      parents: this.filters.parents,
      types: Object.values(ResourceTypes).reduce(
        (controls, type) => {
          controls[type] = this.filters.types?.includes(type) || false
          return controls
        },
        {} as Record<ResourceTypes, boolean>
      ),
      status: Object.values(ResourceStatus).reduce(
        (controls, status) => {
          controls[status] = this.filters.status?.includes(status) || false
          return controls
        },
        {} as Record<ResourceStatus, boolean>
      ),
    })

    this.visible = true
    this.changeDetectorRef.markForCheck()

    this.subscriptions.push(
      this.form.valueChanges.subscribe((value) => {
        const { types, status } = value
        this.filters = {
          ...this.filters,
          direction: value.direction as OrderingDirections,
          order: value.order as ResourceOrderings,
          period: value.period as number,
          types: types ? (Object.keys(types).filter((e) => types[e as ResourceTypes]) as ResourceTypes[]) : undefined,
          status: status
            ? (Object.keys(status).filter((e) => status[e as ResourceStatus]) as ResourceStatus[])
            : undefined,
          parents: value.parents as string[],
        }
      })
    )
  }

  protected close(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
    this.subscriptions.splice(0, this.subscriptions.length)

    this.visible = false
    this.changeDetectorRef.markForCheck()
  }

  protected displayCircle(id: string): string {
    return this.circles.find((c) => c.id === id)?.name || ''
  }

  private createForm() {
    return new FormGroup({
      parents: new FormControl([] as string[]),
      order: new FormControl(ResourceOrderings.NAME),
      direction: new FormControl(OrderingDirections.ASC),
      period: new FormControl(0),
      types: new FormGroup(
        Object.values(ResourceTypes).reduce(
          (controls, type) => {
            controls[type] = new FormControl(false)
            return controls
          },
          {} as Record<ResourceTypes, FormControl<boolean | null>>
        )
      ),
      status: new FormGroup(
        Object.values(ResourceStatus).reduce(
          (controls, status) => {
            controls[status] = new FormControl(false)
            return controls
          },
          {} as Record<ResourceStatus, FormControl<boolean | null>>
        )
      ),
    })
  }
}
