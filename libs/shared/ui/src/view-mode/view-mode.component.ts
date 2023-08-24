import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NzSegmentedModule } from 'ng-zorro-antd/segmented'
import { ViewModes, viewModeIcons, viewModes } from './view-mode'

@Component({
  standalone: true,
  selector: 'ui-view-mode',
  templateUrl: './view-mode.component.html',
  styleUrls: ['./view-mode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NzSegmentedModule],
})
export class UiViewModeComponent implements OnInit {
  protected options = viewModes.map((mode) => ({
    label: '',
    value: mode,
    icon: viewModeIcons[mode],
  }))

  protected selectionIndex = 0

  @Input() storageKey = 'view-mode'
  @Input() defaultMode: ViewModes = 'cards'

  @Input()
  set modes(value: ViewModes[]) {
    this.options = value.map((mode) => ({
      label: '',
      value: mode,
      icon: viewModeIcons[mode],
    }))
  }

  get mode(): ViewModes {
    return viewModes[this.selectionIndex]
  }

  ngOnInit(): void {
    const mode = localStorage.getItem(this.storageKey)
    if (mode && viewModes.includes(mode as ViewModes)) {
      this.selectionIndex = viewModes.indexOf(mode as ViewModes)
    } else {
      this.selectionIndex = viewModes.indexOf(this.defaultMode) || 0
    }
  }

  protected onChangeMode(index: number): void {
    this.selectionIndex = index
    localStorage.setItem(this.storageKey, viewModes[index])
  }
}
