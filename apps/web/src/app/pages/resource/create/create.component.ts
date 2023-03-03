import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';

import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

import { Level, Topic } from '@platon/core/common';
import { DialogModule, DialogService } from '@platon/core/browser';
import { CircleTreeComponent, ResourcePipesModule, ResourceService } from '@platon/feature/resource/browser';
import { circleFromTree, CircleTree, flattenCircleTree, ResourceStatus, ResourceTypes, ResourceVisibilities } from '@platon/feature/resource/common';
import { UiStepDirective, UiStepperComponent } from '@platon/shared/ui';
import { firstValueFrom } from 'rxjs';


@Component({
  standalone: true,
  selector: 'app-resource-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
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
  ]
})
export class ResourceCreateComponent implements OnInit {
  protected type!: ResourceTypes;
  protected parent?: string;
  protected loading = true;
  protected creating = false;
  protected tree!: CircleTree;

  protected topics: Topic[] = [];
  protected levels: Level[] = [];

  protected infos = new FormGroup({
    name: new FormControl('', [Validators.required]),
    code: new FormControl(''),
    desc: new FormControl('', [Validators.required]),
    opened: new FormControl(false),
    isModel: new FormControl(false),
  });

  protected tags = new FormGroup({
    topics: new FormControl<string[]>([]),
    levels: new FormControl<string[]>([]),
  });


  constructor(
    private readonly router: Router,
    private readonly dialogService: DialogService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceService: ResourceService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }


  async ngOnInit(): Promise<void> {
    this.type = (
      this.activatedRoute.snapshot.queryParamMap.get('type') || ResourceTypes.CIRCLE
    ) as ResourceTypes;

    const [tree, topics, levels] = await Promise.all([
      firstValueFrom(this.resourceService.tree()),
      firstValueFrom(this.resourceService.topics()),
      firstValueFrom(this.resourceService.levels()),
    ]);

    if (this.type === 'CIRCLE' && tree) {
      const codes = flattenCircleTree(tree).map(c => c.code).filter(c => !!c) as string[];
      this.infos.controls.code.setValidators(Validators.compose([Validators.required, this.codeValidator(codes)]));
      this.infos.updateValueAndValidity();
    }

    this.tree = tree;
    this.topics = topics;
    this.levels = levels;

    this.loading = false;
    this.changeDetectorRef.markForCheck();
  }

  protected async create(): Promise<void> {
    try {

      const infos = this.infos.value;
      const tags = this.tags.value;
      const parent = circleFromTree(this.tree, this.parent as string) as CircleTree;

      this.creating = true;

      const resource = await firstValueFrom(
        this.resourceService.create({
          type: this.type,
          parentId: this.parent,
          name: infos.name as string,
          desc: infos.desc as string,
          code: infos.code || undefined,
          levels: tags.levels as string[],
          topics: tags.topics as string[],
          status: ResourceStatus.DRAFT,
          isModel: !!infos.isModel,
          visibility: infos.opened ? ResourceVisibilities.PUBLIC : parent.visibility,
        }));

      this.router.navigate([
        '/resource', resource.id, 'overview'
      ], {
        replaceUrl: true
      });
    } catch {
      this.dialogService.error('Une erreur est survenue lors de cette action, veuillez réessayer un peu plus tard !');
    } finally {
      this.creating = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  private codeValidator(codes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = codes.includes(control.value);
      return forbidden ? { code: true } : null;
    };
  }

  protected trackById(_: number, value: Topic | Level): string {
    return value.id;
  }
}
