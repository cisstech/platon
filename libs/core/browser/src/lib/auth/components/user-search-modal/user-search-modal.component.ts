import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { User, UserRoles } from '@platon/core/common';
import { UserSearchBarComponent } from '../user-search-bar/user-search-bar.component';

@Component({
  standalone: true,
  selector: 'user-search-modal',
  templateUrl: './user-search-modal.component.html',
  styleUrls: ['./user-search-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,

    NzModalModule,
    NzButtonModule,
    UserSearchBarComponent,
  ]
})
export class UserSearchModalComponent {
  isVisible = false;

  @Input() title = '';
  @Input() okTitle = 'OK';
  @Input() noTitle = 'Annuler';
  @Input() roles?: UserRoles[];
  @Input() multi = true;
  @Input() excludes: string[] = [];

  @Output() didSubmit = new EventEmitter<User[]>();

  selection: User[] = [];

  get ready() {
    const n = this.selection.length;
    return !this.multi ? n === 1 : n > 0;
  }

  constructor(
    private readonly changeDetector: ChangeDetectorRef
  ) { }

  open(): void {
    this.isVisible = true;
    this.changeDetector.markForCheck();
  }

  close(): void {
    this.isVisible = false;
    this.changeDetector.markForCheck();
  }

  submit(): void {
    this.close();
    this.didSubmit.emit(this.selection);
  }
}
