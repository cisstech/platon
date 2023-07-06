import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { UserRoles } from '@platon/core/common';
import { Subscription } from 'rxjs';
import { CoursePresenter } from '../../course.presenter';

@Component({
  standalone: true,
  selector: 'app-course-informations',
  templateUrl: './informations.page.html',
  styleUrls: ['./informations.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,

    NzFormModule,
    NzSpinModule,
    NzButtonModule,
    NzSelectModule,
  ],
})
export class CourseInformationsPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  protected form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    desc: new FormControl('', [Validators.required]),
  });

  protected saving = false;
  protected context = this.presenter.defaultContext();

  protected get canEdit(): boolean {
    const { user } = this.context;
    if (!user) return false;
    return user.role === UserRoles.admin;
  }

  protected get canSubmit(): boolean {
    const { user } = this.context;
    if (!user) return false;
    return this.form.valid && this.canEdit;
  }

  constructor(
    private readonly presenter: CoursePresenter,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context;
        const { course } = context;
        if (course) {
          this.form = new FormGroup({
            name: new FormControl(
              { value: course.name, disabled: !this.canEdit },
              [Validators.required]
            ),
            desc: new FormControl(
              { value: course.desc || '', disabled: !this.canEdit },
              [Validators.required]
            ),
          });
        }

        this.changeDetectorRef.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected async saveChanges(): Promise<void> {
    try {
      this.saving = true;
      const { value } = this.form;
      await this.presenter.update({
        name: value.name as string,
        desc: value.desc as string,
      });
    } finally {
      this.saving = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  protected trackByValue(_: number, item: unknown): unknown {
    return item;
  }
}
