import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { Avatar, AvatarPerson } from '../../avatar/avatar'
import { Icon } from '../../icon/icon'
import { IconName } from '../../icon/icon-names'
import { Cover } from '../cover'

/**
 * The person at the foot of the cover: avatar, name (the content) and, under it, the type of
 * account. Opens the profile menu.
 */
@Component({
  // A component on a native button: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[plCoverProfile]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, Icon],
  host: { class: 'pl-cover-profile' },
  templateUrl: './cover-profile.html',
  styleUrl: './cover-profile.scss',
})
export class CoverProfile {
  readonly person = input.required<AvatarPerson>()
  /** The type of account, such as « Compte enseignant ». */
  readonly detail = input<string>()

  private readonly cover = inject(Cover, { optional: true })
  /** In a panel, the profile opens a sheet rather than a menu above it. */
  protected readonly chevron = computed<IconName>(() =>
    this.cover?.layout() === 'panel' ? 'chevron_right' : 'expand_more'
  )
}
