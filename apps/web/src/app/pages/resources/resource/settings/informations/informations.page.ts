import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'

import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSpinModule } from 'ng-zorro-antd/spin'

import { Level, Topic } from '@platon/core/common'
import { Subscription, firstValueFrom } from 'rxjs'
import { ResourcePresenter } from '../../resource.presenter'
import { TagService } from '@platon/core/browser'

@Component({
  standalone: true,
  selector: 'app-resource-informations',
  templateUrl: './informations.page.html',
  styleUrls: ['./informations.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,

    NzSpinModule,
    NzFormModule,
    NzButtonModule,
    NzSelectModule,
  ],
})
export class ResourceInformationsPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  private readonly presenter = inject(ResourcePresenter)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly tagService = inject(TagService)

  protected dataSource?: DataSource
  protected listOfTagOptions: string[] = []

  protected form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    desc: new FormControl('', [Validators.required]),
    topics: new FormControl([] as string[]),
    levels: new FormControl([] as string[]),
  })

  protected saving = false
  protected context = this.presenter.defaultContext()

  protected get canEdit(): boolean {
    return !!this.context.resource?.permissions?.write
  }

  protected get canSubmit(): boolean {
    return this.form.valid && this.canEdit
  }

  isUUID4 = (input: string) => {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(input)
  }

  protected async onNewLevels(levels: string[]): Promise<void> {
    for (const l of levels) {
      if (!this.isUUID4(l)) {
        const level = await firstValueFrom(this.tagService.createLevel({ name: l }))
        levels[levels.indexOf(l)] = level.id
        this.dataSource?.levels.push(level)
      }
    }
  }

  protected async onNewTopics(topics: string[]): Promise<void> {
    for (const t of topics) {
      if (!this.isUUID4(t)) {
        const topic = await firstValueFrom(this.tagService.createTopic({ name: t }))
        topics[topics.indexOf(t)] = topic.id
        this.dataSource?.topics.push(topic)
      }
    }
  }

  async ngOnInit(): Promise<void> {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        const { resource } = context
        if (resource) {
          if (!this.dataSource) {
            const [levels, topics] = await Promise.all([
              firstValueFrom(this.presenter.availableLevels()),
              firstValueFrom(this.presenter.availableTopics()),
            ])
            this.dataSource = { levels, topics }
          }
          this.form = new FormGroup({
            name: new FormControl(
              {
                value: resource.name,
                disabled: !this.canEdit,
              },
              [Validators.required]
            ),
            desc: new FormControl(
              {
                value: resource.desc || '',
                disabled: !this.canEdit,
              },
              [Validators.required]
            ),
            topics: new FormControl({
              value: resource.topics.map((e) => e.id),
              disabled: !this.canEdit,
            }),
            levels: new FormControl({
              value: resource.levels.map((e) => e.id),
              disabled: !this.canEdit,
            }),
          })
        }

        this.changeDetectorRef.markForCheck()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected async saveChanges(): Promise<void> {
    await this.onNewLevels(this.form.value.levels || [])
    await this.onNewTopics(this.form.value.topics || [])
    try {
      this.saving = true
      const { value } = this.form
      await this.presenter.update({
        name: value.name as string,
        desc: value.desc as string,
        topics: value.topics as string[],
        levels: value.levels as string[],
      })
    } finally {
      this.saving = false
      this.changeDetectorRef.markForCheck()
    }
  }

  protected trackByValue(_: number, item: unknown): unknown {
    return item
  }
}

interface DataSource {
  topics: Topic[]
  levels: Level[]
}
