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
import { NzModalService } from 'ng-zorro-antd/modal'

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
  providers: [NzModalService],
})
export class ResourceInformationsPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  private readonly presenter = inject(ResourcePresenter)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly tagService = inject(TagService)

  constructor(private modal: NzModalService) {}

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

  private confirmAddTopic(sujet: string, name: string, originalName: string): Promise<'cancel' | 'force' | 'similar'> {
    return new Promise((resolve) => {
      const modalRef = this.modal.create({
        nzTitle: `${sujet} similaire trouvé`,
        nzContent: `Le ${sujet} "${name}" est similaire à un autre intitulé "${originalName}". Que voulez-vous faire ?`,
        nzClosable: false,
        nzCancelText: null,
        nzOkText: null,
        nzFooter: [
          {
            label: "Prendre l'intitulé similaire",
            type: 'default',
            onClick: () => {
              modalRef.destroy()
              resolve('similar')
            },
          },
          {
            label: "Forcer l'ajout",
            type: 'primary',
            danger: true,
            onClick: () => {
              modalRef.destroy()
              resolve('force')
            },
          },
          {
            label: 'Annuler',
            type: 'default',
            onClick: () => {
              modalRef.destroy()
              resolve('cancel')
            },
          },
        ],
      })
    })
  }

  protected async onNewLevels(levels: string[]): Promise<void> {
    for (const l of levels) {
      if (!this.isUUID4(l)) {
        try {
          const level = await firstValueFrom(this.tagService.createLevel({ name: l }))
          if (level.existing) {
            // If level already exists, ask user what to do
            const action = await this.confirmAddTopic('Niveau', l, level.name)

            switch (action) {
              case 'force': {
                const forcedLevel = await firstValueFrom(this.tagService.createLevel({ name: l, force: true }))
                levels[levels.indexOf(l)] = forcedLevel.id
                this.dataSource?.levels.push(forcedLevel)
                break
              }

              case 'similar':
                levels[levels.indexOf(l)] = level.id
                this.dataSource?.levels.push(level)
                break

              case 'cancel':
                break
            }
          } else {
            levels[levels.indexOf(l)] = level.id
            this.dataSource?.levels.push(level)
          }
        } catch (error) {
          console.error('Erreur lors de la création du niveau:', error)
        }
      }
    }
  }

  protected async onNewTopics(topics: string[]): Promise<void> {
    for (const t of topics) {
      if (!this.isUUID4(t)) {
        try {
          const topic = await firstValueFrom(this.tagService.createTopic({ name: t }))

          if (topic.existing) {
            // If topic already exists, ask user what to do
            const action = await this.confirmAddTopic('Topic', t, topic.name)

            switch (action) {
              case 'force': {
                const forcedTopic = await firstValueFrom(this.tagService.createTopic({ name: t, force: true }))
                topics[topics.indexOf(t)] = forcedTopic.id
                this.dataSource?.topics.push(forcedTopic)
                break
              }

              case 'similar':
                topics[topics.indexOf(t)] = topic.id
                this.dataSource?.topics.push(topic)
                break

              case 'cancel':
                break
            }
          } else {
            topics[topics.indexOf(t)] = topic.id
            this.dataSource?.topics.push(topic)
          }
        } catch (error) {
          console.error('Erreur lors de la création du topic:', error)
        }
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
