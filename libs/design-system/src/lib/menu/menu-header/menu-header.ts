import { ChangeDetectionStrategy, Component } from '@angular/core'

/** A block of text at the head of a menu, such as the name and address in the profile menu. */
@Component({
  selector: 'pl-menu-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-header.html',
  styleUrl: './menu-header.scss',
})
export class MenuHeader {}
