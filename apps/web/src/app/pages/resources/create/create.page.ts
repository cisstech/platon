import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'

import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzSpinModule } from 'ng-zorro-antd/spin'

import { SelectionModel } from '@angular/cdk/collections'
import { AuthService, DialogModule, DialogService, TagService } from '@platon/core/browser'
import { Level, Topic, User } from '@platon/core/common'
import {
  CircleTreeComponent,
  ResourceItemComponent,
  ResourcePipesModule,
  ResourceSearchBarComponent,
  ResourceService,
} from '@platon/feature/resource/browser'
import {
  CircleTree,
  LATEST,
  Resource,
  ResourceTypes,
  branchFromCircleTree,
  circleAncestors,
  circleTreeFromCircle,
  flattenCircleTree,
} from '@platon/feature/resource/common'
import { UiStepDirective, UiStepperComponent } from '@platon/shared/ui'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { firstValueFrom } from 'rxjs'

type TemplateSource = {
  circle: CircleTree
  count: number
  templates: Resource[]
}

@Component({
  standalone: true,
  selector: 'app-resource-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,

    NzTagModule,
    NzSpinModule,
    NzIconModule,
    NzButtonModule,
    NzSelectModule,
    NzCollapseModule,
    NzSkeletonModule,
    NzPageHeaderModule,

    UiStepDirective,
    UiStepperComponent,
    DialogModule,

    CircleTreeComponent,
    ResourcePipesModule,
    ResourceItemComponent,
    ResourceSearchBarComponent,
  ],
})
export class ResourceCreatePage implements OnInit {
  protected type!: ResourceTypes
  protected parentId?: string
  protected parentName?: string
  protected template?: Resource

  protected loading = true
  protected creating = false
  protected editionMode?: 'scratch' | 'template'
  protected loadingTemplates = false

  protected tree!: CircleTree
  protected topics: Topic[] = []
  protected levels: Level[] = []
  protected templateSources: TemplateSource[] = []
  protected selectedTemplateSources = new SelectionModel<TemplateSource>(true, [])
  protected infos = new FormGroup({
    name: new FormControl('', [Validators.required]),
    code: new FormControl(''),
    desc: new FormControl('', [Validators.required]),
  })
  protected tags = new FormGroup({
    topics: new FormControl<string[]>([]),
    levels: new FormControl<string[]>([]),
  })

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly tagService: TagService,
    private readonly dialogService: DialogService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceService: ResourceService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.type = (this.activatedRoute.snapshot.queryParamMap.get('type') || ResourceTypes.CIRCLE) as ResourceTypes
    this.parentId = this.activatedRoute.snapshot.queryParamMap.get('parent') || undefined

    const user = (await this.authService.ready()) as User
    const [tree, circle, topics, levels] = await Promise.all([
      firstValueFrom(this.resourceService.tree()),
      firstValueFrom(this.resourceService.circle(user.username)),
      firstValueFrom(this.tagService.listTopics()),
      firstValueFrom(this.tagService.listLevels()),
    ])

    if (!this.resourceService.canUserCreateResource(user, this.type)) {
      this.router
        .navigateByUrl('/resources', {
          replaceUrl: true,
        })
        .catch(console.error)
      this.dialogService.error("Vous n'avez pas les droits pour cette action !")
      return
    }

    if (this.type === 'CIRCLE') {
      const codes = flattenCircleTree(tree)
        .map((c) => c.code)
        .filter((c) => !!c) as string[]

      this.infos.controls.code.setValidators(Validators.compose([Validators.required, this.codeValidator(codes)]))
      this.infos.updateValueAndValidity()
    }

    this.tree = tree

    if (this.type !== 'CIRCLE') {
      this.tree.children?.unshift(circleTreeFromCircle(circle))
    }

    this.topics = topics
    this.levels = levels

    this.loading = false
    this.changeDetectorRef.markForCheck()
  }

  protected onChangeParentId(id?: string): void {
    this.parentId = id
    this.parentName = id ? branchFromCircleTree(this.tree, id)?.name : undefined
  }

  protected async create(): Promise<void> {
    try {
      const infos = this.infos.value
      const tags = this.tags.value

      this.creating = true

      const resource = await firstValueFrom(
        this.resourceService.create({
          type: this.type,
          parentId: this.parentId as string,
          templateId: this.editionMode === 'template' ? this.template?.id : undefined,
          templateVersion: this.editionMode === 'template' ? LATEST : undefined,
          name: infos.name as string,
          desc: infos.desc as string,
          code: infos.code || undefined,
          levels: tags.levels as string[],
          topics: tags.topics as string[],
        })
      )

      this.router.navigate(['/resources', resource.id, 'overview'], { replaceUrl: true }).catch(console.error)
    } catch {
      this.dialogService.error('Une erreur est survenue lors de cette action, veuillez réessayer un peu plus tard !')
    } finally {
      this.creating = false
      this.changeDetectorRef.markForCheck()
    }
  }

  protected async preloadTemplates(): Promise<void> {
    if (this.loadingTemplates) return

    this.loadingTemplates = true
    this.template = undefined
    this.templateSources = []
    this.selectedTemplateSources.clear()

    this.changeDetectorRef.markForCheck()

    const ancestors = circleAncestors(this.tree, this.parentId as string, true)
    const response = await firstValueFrom(
      this.resourceService.search({
        types: ['EXERCISE'],
        configurable: true,
        parents: [...ancestors.map((a) => a.id)],
        expands: ['metadata', 'statistic'],
      })
    )

    this.templateSources = ancestors
      .map((circle) => {
        const templates = response.resources.filter((t) => t.parentId === circle.id)
        return {
          circle,
          count: templates.length,
          templates,
        }
      })
      .filter((s) => s.count > 0)

    const firstNonEmpty = this.templateSources.find((s) => s.count > 0)
    if (firstNonEmpty) {
      this.selectedTemplateSources.select(firstNonEmpty)
    }

    this.loadingTemplates = false

    this.changeDetectorRef.markForCheck()
  }

  private codeValidator(codes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = [...codes, 'relative'].includes(control.value)
      return forbidden ? { code: true } : null
    }
  }
}
