import { ChangeDetectionStrategy, Component } from '@angular/core'

/** A line between two groups of entries. */
@Component({
  selector: 'pl-menu-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator' },
  templateUrl: './menu-separator.html',
  styleUrl: './menu-separator.scss',
})
export class MenuSeparator {}
