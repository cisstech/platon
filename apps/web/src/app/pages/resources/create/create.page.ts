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
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzSpinModule } from 'ng-zorro-antd/spin'

import { DialogModule, DialogService, TagService } from '@platon/core/browser'
import { Level, Topic } from '@platon/core/common'
import { CircleTreeComponent, ResourcePipesModule, ResourceService } from '@platon/feature/resource/browser'
import { CircleTree, ResourceStatus, ResourceTypes, flattenCircleTree } from '@platon/feature/resource/common'
import { UiStepDirective, UiStepperComponent } from '@platon/shared/ui'
import { firstValueFrom } from 'rxjs'

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

    NzSpinModule,
    NzButtonModule,
    NzSelectModule,
    NzSkeletonModule,

    UiStepDirective,
    UiStepperComponent,
    DialogModule,

    CircleTreeComponent,
    ResourcePipesModule,
  ],
})
export class ResourceCreatePage implements OnInit {
  protected type!: ResourceTypes
  protected parent?: string
  protected loading = true
  protected creating = false
  protected tree!: CircleTree

  protected topics: Topic[] = []
  protected levels: Level[] = []

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
    private readonly tagService: TagService,
    private readonly dialogService: DialogService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceService: ResourceService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.type = (this.activatedRoute.snapshot.queryParamMap.get('type') || ResourceTypes.CIRCLE) as ResourceTypes

    const [tree, topics, levels] = await Promise.all([
      firstValueFrom(this.resourceService.tree()),
      firstValueFrom(this.tagService.listTopics()),
      firstValueFrom(this.tagService.listLevels()),
    ])

    if (this.type === 'CIRCLE' && tree) {
      const codes = flattenCircleTree(tree)
        .map((c) => c.code)
        .filter((c) => !!c) as string[]
      this.infos.controls.code.setValidators(Validators.compose([Validators.required, this.codeValidator(codes)]))
      this.infos.updateValueAndValidity()
    }

    this.tree = tree
    this.topics = topics
    this.levels = levels

    this.loading = false
    this.changeDetectorRef.markForCheck()
  }

  protected async create(): Promise<void> {
    try {
      const infos = this.infos.value
      const tags = this.tags.value

      this.creating = true

      const resource = await firstValueFrom(
        this.resourceService.create({
          type: this.type,
          parentId: this.parent as string,
          name: infos.name as string,
          desc: infos.desc as string,
          code: infos.code || undefined,
          levels: tags.levels as string[],
          topics: tags.topics as string[],
          status: ResourceStatus.DRAFT,
        })
      )

      this.router.navigate(['/resources', resource.id, 'overview'], {
        replaceUrl: true,
      })
    } catch {
      this.dialogService.error('Une erreur est survenue lors de cette action, veuillez réessayer un peu plus tard !')
    } finally {
      this.creating = false
      this.changeDetectorRef.markForCheck()
    }
  }

  private codeValidator(codes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = [...codes, 'relative'].includes(control.value)
      return forbidden ? { code: true } : null
    }
  }

  protected trackById(_: number, value: Topic | Level): string {
    return value.id
  }
}
