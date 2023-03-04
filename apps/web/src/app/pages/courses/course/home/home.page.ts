/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { CourseSection } from '@platon/feature/course/common';
import { CoursePresenter } from '../course.presenter';


@Component({
  standalone: true,
  selector: 'app-course-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    NzIconModule,
    NzEmptyModule,
    NzSpaceModule,
    NzButtonModule,
    NzPopoverModule,
    NzCollapseModule,
    NzTypographyModule,
  ]
})
export class CourseHomePage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];
  protected context = this.presenter.defaultContext();

  protected sections: CourseSection[] = [];

  constructor(
    private readonly presenter: CoursePresenter,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async context => {
        this.context = context;
        await this.refresh();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  protected async addSection(after?: CourseSection): Promise<void> {
    await this.presenter.addSection({
      name: 'Modifiez le titre de votre section',
      order: after ? after.order + 1 : 0
    });
    await this.refresh();
  }

  protected async renameSection(section: CourseSection, newName: string): Promise<void> {
    await this.presenter.updateSection(section, { name: newName });
    this.sections = this.sections.map(item => {
      if (item.id === section.id) {
        return { ...item, name: newName };
      }
      return item;
    })
    this.changeDetectorRef.markForCheck();
  }

  protected async moveUpSection(section: CourseSection): Promise<void> {
    await this.presenter.updateSection(section, {
      order: section.order - 1
    });
    await this.refresh();
  }

  protected async moveDownSection(section: CourseSection): Promise<void> {
    await this.presenter.updateSection(section, {
      order: section.order + 1
    });
    await this.refresh();
  }

  protected async deleteSection(section: CourseSection): Promise<void> {
    await this.presenter.deleteSection(section);
    await this.refresh();
  }

  protected trackSection(_: number, section: CourseSection): string {
    return section.id;
  }

  private async refresh(): Promise<void> {
    const { course } = this.context;
    if (course) {
      const [sections] = await Promise.all([
        this.presenter.listSections(course)
      ]);

      this.sections = sections;
    }

    this.changeDetectorRef.markForCheck();
  }
}
