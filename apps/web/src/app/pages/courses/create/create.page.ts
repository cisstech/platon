import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { DialogModule, DialogService } from '@platon/core/browser';
import { Level, Topic } from '@platon/core/common';
import { CourseService } from '@platon/feature/course/browser';
import { UiStepDirective, UiStepperComponent } from '@platon/shared/ui';
import { firstValueFrom } from 'rxjs';


@Component({
  standalone: true,
  selector: 'app-course-create',
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
  ]
})
export class CourseCreatePage {
  protected loading = false;
  protected creating = false;

  protected infos = new FormGroup({
    name: new FormControl('', [Validators.required]),
    desc: new FormControl('', [Validators.required]),
  });


  constructor(
    private readonly router: Router,
    private readonly dialogService: DialogService,
    private readonly courseService: CourseService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  protected async create(): Promise<void> {
    try {

      const infos = this.infos.value;
      this.creating = true;

      const course = await firstValueFrom(
        this.courseService.create({
          name: infos.name as string,
          desc: infos.desc as string,
        }));

      this.router.navigate([
        '/courses', course.id, 'overview'
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

  protected trackById(_: number, value: Topic | Level): string {
    return value.id;
  }
}
