import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { FileVersions, Resource } from '@platon/feature/resource/common'

@Component({
  standalone: true,
  selector: 'app-resource-browse-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzIconModule,
    NzDropDownModule,
    NzSelectModule,
    NzButtonModule,
    NzToolTipModule,
  ],
})
export class ResourceBrowseHeaderComponent {
  @Input() version = 'latest'
  @Input() versions: FileVersions = { all: [] }
  @Input() resource!: Resource
  @Input() editable = false
  @Output() edit = new EventEmitter<void>()
  @Output() preview = new EventEmitter<void>()
  @Output() refresh = new EventEmitter<string>()
}
