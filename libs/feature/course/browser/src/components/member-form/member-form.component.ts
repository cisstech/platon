import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { UserSearchBarComponent } from '@platon/core/browser';
import { User, UserGroup, UserRoles } from '@platon/core/common';
import { CreateCourseMember } from '@platon/feature/course/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  standalone: true,
  selector: 'course-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatButtonModule,

    NzGridModule,
    NzFormModule,
    UserSearchBarComponent
  ]
})
export class CourseMemberFormComponent {
  readonly form = new FormGroup({
    'userOrGroup': new FormControl<User | UserGroup | undefined>(undefined, Validators.required),
  });

  @Input() roles: (UserRoles | keyof typeof UserRoles)[] = [];
  @Input() excludes: string[] = [];
  @Input() allowGroup = false;


  @Output() send = new EventEmitter<CreateCourseMember>();

  protected sendInvitation(): void {
    const value = this.form.value.userOrGroup as (User | UserGroup);
    this.send.emit({
      id: value.id,
      isGroup: !('username' in value)
    });
    this.form.patchValue({ userOrGroup: null });
  }
}
