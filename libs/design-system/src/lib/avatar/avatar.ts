import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'

export interface AvatarPerson {
  firstName?: string | null
  lastName?: string | null
  username?: string | null
}

/** Initials of the first and last name, else the first two letters of the username. */
export const initialsOf = (person: AvatarPerson): string => {
  const first = person.firstName?.trim()
  const last = person.lastName?.trim()
  const initials = first || last ? `${first?.[0] ?? ''}${last?.[0] ?? ''}` : person.username?.trim().slice(0, 2) ?? ''
  return initials.toLocaleUpperCase('fr') || '?'
}

/**
 * A person's initials on an ink disc. Decorative next to the person's name; give it a `label` when
 * it stands alone.
 */
@Component({
  selector: 'pl-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
  },
  template: `{{ initials() }}`,
  styles: `
    :host {
      display: inline-grid;
      flex: none;
      place-items: center;
      inline-size: 28px;
      block-size: 28px;
      border-radius: var(--pl-radius-pill);
      background: var(--pl-plum-100);
      color: var(--pl-plum-800);
      font: var(--pl-font-caption);
    }
  `,
})
export class Avatar {
  readonly person = input.required<AvatarPerson>()
  readonly label = input<string>()

  protected readonly initials = computed(() => initialsOf(this.person()))
}
