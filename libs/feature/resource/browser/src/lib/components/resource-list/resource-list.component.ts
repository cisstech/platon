import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { NzEmptyModule } from 'ng-zorro-antd/empty';

import { NgeUiListModule } from '@cisstech/nge/ui/list';
import { Resource } from '@platon/feature/resource/common';
import { ResourceItemComponent } from '../resource-item/resource-item.component';

@Component({
  standalone: true,
  selector: 'resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzEmptyModule,
    NgeUiListModule,
    ResourceItemComponent,
  ]
})
export class ResourceListComponent {
  @Input() items: Resource[] = [];
  @Input() simple = false;

  @Output() didTapTag = new EventEmitter<string>();
}
