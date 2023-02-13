import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UserAvatarComponent } from '@platon/core/browser';
import { ResourceInvitation } from '@platon/feature/resource/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  standalone: true,
  selector: 'res-invitation-table',
  templateUrl: './invitation-table.component.html',
  styleUrls: ['./invitation-table.component.scss'],
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
export class ResourceInvitationTableComponent implements OnChanges {
  @Input() total = 0;
  @Input() editable = false;
  @Input() invitations: ResourceInvitation[] = [];

  @Output() deleted = new EventEmitter<ResourceInvitation>();
  @Output() changedParams = new EventEmitter<NzTableQueryParams>();

  protected pageSize = 10;
  protected pageIndex = 1;
  protected loading = true;


  ngOnChanges(changes: SimpleChanges) {
    if (changes['invitations']) {
      this.loading = false;
    }
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.loading = true;
    this.changedParams.emit(params);
  }
}
