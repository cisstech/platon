import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';

import { User } from '@platon/core/common';
import { AuthService, UserAvatarComponent } from '@platon/core/browser';
import { NotificationDrawerComponent } from '@platon/feature/notification/browser';

@Component({
  standalone: true,
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatButtonModule,
    UserAvatarComponent,
    NotificationDrawerComponent,
  ]

})
export class ToolbarComponent implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>();

  protected user?: User | undefined;

  constructor(
    private readonly authService: AuthService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = await this.authService.ready();
    this.changeDetectorRef.markForCheck();
  }


  signOut(): void {
    this.authService.signOut();
  }
}
