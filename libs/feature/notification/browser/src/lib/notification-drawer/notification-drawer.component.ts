import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';

import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';

import { of } from 'rxjs';


@Component({
  standalone: true,
  selector: 'notif-drawer',
  templateUrl: './notification-drawer.component.html',
  styleUrls: ['./notification-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,

    NzEmptyModule,
    NzDrawerModule,
  ]
})
export class NotificationDrawerComponent {
  protected visible = false;

  count = of(0);

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  open(): void {
    this.visible = true;
    this.changeDetectorRef.markForCheck();
  }
}
