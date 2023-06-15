import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Subscription, firstValueFrom } from 'rxjs';
import { CoursePresenter } from '../../course.presenter';
import { CourseService } from '@platon/feature/course/browser';
import { UserRoles } from '@platon/core/common';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Clipboard } from '@angular/cdk/clipboard';
import { DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DialogService } from '@platon/core/browser';

@Component({
  standalone: true,
  selector: 'app-course-demo',
  templateUrl: './demo.page.html',
  styleUrls: ['./demo.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzSpinModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
  ],
})
export class CourseDemoPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  protected context = this.presenter.defaultContext();
  protected courseId = '';
  protected demoUri = '';
  protected hasDemo = false;
  protected saving = false;

  constructor(
    private readonly presenter: CoursePresenter,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly clipboard: Clipboard,
    private readonly dialogService: DialogService,
    @Inject(DOCUMENT) private document: any
  ) {}

  protected get canEdit(): boolean {
    const { user } = this.context;
    if (!user) return false;
    return user.role === UserRoles.teacher || user.role === UserRoles.admin;
  }

  async ngOnInit(): Promise<void> {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context;
        const { course, demo } = context;
        if (course) {
          this.courseId = course.id;
        }
        if (!!demo && demo.isPresent()) {
          this.hasDemo = true;
          this.demoUri =
            this.document.location.hostname + '/demo/' + demo.get().uri;
        } else {
          this.hasDemo = false;
          this.demoUri = '';
        }

        this.changeDetectorRef.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  async createDemo() {
    try {
      this.saving = true;
      await this.presenter.createDemo();
    } finally {
      this.saving = false;
      this.changeDetectorRef.markForCheck();
      this.clipboard.copy(this.demoUri);
    }
  }

  async deleteDemo() {
    try {
      this.saving = true;
      await this.presenter.deleteDemo();
    } finally {
      this.saving = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  copyUri(): void {
    this.clipboard.copy(this.demoUri);
    this.dialogService.info('URL copiée');
  }
}
