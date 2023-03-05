import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UserAvatarComponent } from '@platon/core/browser';
import { ResourceMember } from '@platon/feature/resource/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';


@Component({
  standalone: true,
  selector: 'res-member-table',
  templateUrl: './member-table.component.html',
  styleUrls: ['./member-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    NzIconModule,
    NzTableModule,
    NzButtonModule,
    NzPopconfirmModule,

    UserAvatarComponent,
  ]
})
export class ResourceMemberTableComponent implements OnChanges {
  @Input() members: ResourceMember[] = [];
  @Input() editable = false;

  @Output() deleted = new EventEmitter<ResourceMember>();

  protected loading = true;


  ngOnChanges(changes: SimpleChanges) {
    if (changes['members']) {
      this.loading = false;
    }
  }
}
