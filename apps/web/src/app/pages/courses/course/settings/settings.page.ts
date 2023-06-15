import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { CourseInformationsPage } from './informations/informations.page';
import { CourseDemoPage } from './demo/demo.page';

@Component({
  standalone: true,
  selector: 'app-course-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    NzTabsModule,

    CourseInformationsPage,
    CourseDemoPage,
  ],
})
export class CourseSettingsPage {}
