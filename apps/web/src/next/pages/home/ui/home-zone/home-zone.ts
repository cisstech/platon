import { booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, input, viewChild } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Count } from '@platon/design-system'

/**
 * A zone of a home: its heading, the number of what it lists or a link to all of it, then its content
 * on a card, or bare with `plain` when the content is made of cards. Its heading takes the focus when
 * what held it goes away.
 */
@Component({
  selector: 'app-home-zone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Count, RouterLink],
  host: {
    role: 'region',
    '[attr.aria-labelledby]': 'headingId()',
    '[attr.data-plain]': "plain() ? '' : null",
  },
  templateUrl: './home-zone.html',
  styleUrl: './home-zone.scss',
})
export class HomeZone {
  readonly heading = input.required<string>()
  /** The id of the heading, which names the zone and the lists inside it. */
  readonly headingId = input.required<string>()
  readonly count = input(0)
  /** The page that lists all of it, and the words of its link: « Tous ». */
  readonly moreLink = input<string>()
  readonly moreLabel = input<string>()
  readonly plain = input(false, { transform: booleanAttribute })

  private readonly title = viewChild.required<ElementRef<HTMLElement>>('title')

  focus(): void {
    this.title().nativeElement.focus()
  }
}
