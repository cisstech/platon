import { LiveAnnouncer } from '@angular/cdk/a11y'
import { ChangeDetectionStrategy, Component, effect, inject, input, output, untracked } from '@angular/core'
import { Button } from '@platon/design-system'

/** The next page of a list: none asked, on its way, or failed. */
export type MoreState = 'idle' | 'loading' | 'error'

/**
 * The button that adds the next page of a list: busy while it comes, so that it keeps the focus, and
 * its failure said under it and announced.
 */
@Component({
  selector: 'app-show-more',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  templateUrl: './show-more.html',
  styleUrl: './show-more.scss',
})
export class ShowMore {
  readonly state = input.required<MoreState>()
  /** « Afficher plus de cours ». */
  readonly label = input.required<string>()
  /** « Les cours suivants n'ont pas pu être chargés. » */
  readonly failure = input.required<string>()
  readonly asked = output<void>()

  constructor() {
    const announcer = inject(LiveAnnouncer)
    effect(() => {
      if (this.state() === 'error') announcer.announce(untracked(this.failure), 'polite').catch(console.error)
    })
  }
}
