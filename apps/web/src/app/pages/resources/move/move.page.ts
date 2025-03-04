import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'

import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzSpinModule } from 'ng-zorro-antd/spin'

import { AuthService, DialogModule, DialogService } from '@platon/core/browser'
import { User } from '@platon/core/common'
import {
  CircleTreeComponent,
  ResourceItemComponent,
  ResourcePipesModule,
  ResourceSearchBarComponent,
  ResourceService,
} from '@platon/feature/resource/browser'
import { CircleTree, Resource, ResourceTypes, branchFromCircleTree } from '@platon/feature/resource/common'
import { UiStepDirective, UiStepperComponent } from '@platon/shared/ui'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { firstValueFrom } from 'rxjs'
import { SelectionModel } from '@angular/cdk/collections'

type TemplateSource = {
  circle: CircleTree
  count: number
  templates: Resource[]
}

@Component({
  standalone: true,
  selector: 'app-resource-move',
  templateUrl: './move.page.html',
  styleUrls: ['./move.page.scss'],
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
export class ResourceMovePage implements OnInit {
  protected type!: ResourceTypes
  protected resourceId!: string
  protected parentId?: string
  protected parentName?: string
  protected sourceParentId?: string
  protected sourceParentName?: string
  protected template?: Resource

  protected loading = true
  protected moving = false

  protected templateSources: TemplateSource[] = []
  protected selectedTemplateSources = new SelectionModel<TemplateSource>(true, [])

  protected tree!: CircleTree
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly dialogService: DialogService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceService: ResourceService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.type = (this.activatedRoute.snapshot.queryParamMap.get('type') || ResourceTypes.CIRCLE) as ResourceTypes
    this.resourceId = this.activatedRoute.snapshot.queryParamMap.get('id') as string
    this.parentId = this.activatedRoute.snapshot.queryParamMap.get('parent') || undefined

    const user = (await this.authService.ready()) as User
    const [tree, circle] = await Promise.all([
      firstValueFrom(this.resourceService.tree()),
      firstValueFrom(this.resourceService.circle(user.username)),
    ])

    if (user.role !== 'admin' && circle.id !== this.parentId) {
      this.router
        .navigateByUrl('/resources', {
          replaceUrl: true,
        })
        .catch(console.error)
      this.dialogService.error("Vous n'avez pas les droits pour cette action !")
      return
    }

    this.tree = tree

    this.sourceParentId = this.parentId
    this.parentId = undefined
    this.sourceParentName = branchFromCircleTree(this.tree, this.sourceParentId!)?.name

    this.loading = false
    this.changeDetectorRef.markForCheck()
  }

  protected onChangeParentId(id?: string): void {
    this.parentId = id
    this.parentName = id ? branchFromCircleTree(this.tree, id)?.name : undefined
  }

  protected async move(): Promise<void> {
    if (!this.parentId) {
      return
    }
    try {
      this.moving = true
      const resource = await firstValueFrom(this.resourceService.move(this.resourceId, this.parentId as string))
      this.router.navigate(['/resources', resource.id, 'overview'], { replaceUrl: true }).catch(console.error)
    } catch {
      this.dialogService.error('Une erreur est survenue lors de cette action, veuillez réessayer un peu plus tard !')
    } finally {
      this.moving = false
      this.changeDetectorRef.markForCheck()
    }
  }
}
