import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';


import { NzBadgeModule } from 'ng-zorro-antd/badge';

import { NgeUiListModule } from '@cisstech/nge/ui/list';
import { Resource } from '@platon/feature/resource/common';


import { ResourcePipesModule } from '../../pipes';


@Component({
  standalone: true,
  selector: 'res-item',
  templateUrl: './resource-item.component.html',
  styleUrls: ['./resource-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    MatIconModule,
    NzBadgeModule,

    NgeUiListModule,

    ResourcePipesModule,
  ]
})
export class ResourceItemComponent  implements OnInit {
  @Input() item!: Resource;
  @Output() didTapTag = new EventEmitter<string>();

  readonly tags: string[] = []

  ngOnInit(): void {
    this.item.levels.concat(this.item.topics)
      .forEach(tag => this.tags.push(tag.name))
  }

}
