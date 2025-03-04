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

import { Level, OrderingDirections, Topic, User } from '@platon/core/common'
import {
  CircleTree,
  ResourceFilters,
  ResourceOrderings,
  ResourceStatus,
  ResourceTypes,
} from '@platon/feature/resource/common'
import { Subscription, distinctUntilChanged } from 'rxjs'
import { ResourcePipesModule } from '../../pipes'
import { MatIconModule } from '@angular/material/icon'
import { UserAvatarComponent } from '@platon/core/browser'

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

    MatIconModule,

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
    UserAvatarComponent,
  ],
})
export class ResourceFiltersComponent implements OnDestroy {
  private readonly subscriptions: Subscription[] = []

  protected form = this.createForm()
  protected visible = false

  @Input() topics: Topic[] = []
  @Input() levels: Level[] = []
  @Input() disableTypesField?: boolean = false
  @Input() owners: User[] = []

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
      order: `${this.filters.order ?? ResourceOrderings.RELEVANCE}-${
        this.filters.direction ?? OrderingDirections.DESC
      }`,
      parents: this.filters.parents,
      configurable: this.filters.configurable,
      types: Object.values(ResourceTypes).reduce((controls, type) => {
        controls[type] = this.filters.types?.includes(type) || false
        return controls
      }, {} as Record<ResourceTypes, boolean>),
      status: Object.values(ResourceStatus).reduce((controls, status) => {
        controls[status] = this.filters.status?.includes(status) || false
        return controls
      }, {} as Record<ResourceStatus, boolean>),
      owners: this.filters.owners,
      topics: this.filters.topics,
      antiTopics: this.filters.antiTopics,
      levels: this.filters.levels,
    })

    this.visible = true
    this.changeDetectorRef.markForCheck()

    this.subscriptions.push(
      this.form.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
        const { types, status } = value
        const order = value.order?.split('-') as [ResourceOrderings, OrderingDirections]
        this.filters = {
          ...this.filters,
          order: order?.[0] as ResourceOrderings,
          direction: order?.[1] as OrderingDirections,
          period: value.period as number,
          configurable: value.configurable as boolean,
          types: types ? (Object.keys(types).filter((e) => types[e as ResourceTypes]) as ResourceTypes[]) : undefined,
          status: status
            ? (Object.keys(status).filter((e) => status[e as ResourceStatus]) as ResourceStatus[])
            : undefined,
          parents: value.parents as string[],
          owners: value.owners as string[],
          topics: value.topics as string[],
          antiTopics: value.antiTopics as string[],
          levels: value.levels as string[],
        }
        if (!value.types?.EXERCISE) {
          this.form.patchValue(
            {
              configurable: null,
            },
            { emitEvent: false }
          )
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

  private createForm() {
    return new FormGroup({
      parents: new FormControl([] as string[]),
      order: new FormControl(`${ResourceOrderings.RELEVANCE}-${OrderingDirections.DESC}`),
      period: new FormControl(0),
      configurable: new FormControl(false),
      types: new FormGroup(
        Object.values(ResourceTypes).reduce((controls, type) => {
          controls[type] = new FormControl(false)
          return controls
        }, {} as Record<ResourceTypes, FormControl<boolean | null>>)
      ),
      owners: new FormControl([] as string[]),
      topics: new FormControl([] as string[]),
      antiTopics: new FormControl([] as string[]),
      levels: new FormControl([] as string[]),
      status: new FormGroup(
        Object.values(ResourceStatus).reduce((controls, status) => {
          controls[status] = new FormControl(false)
          return controls
        }, {} as Record<ResourceStatus, FormControl<boolean | null>>)
      ),
    })
  }
}
