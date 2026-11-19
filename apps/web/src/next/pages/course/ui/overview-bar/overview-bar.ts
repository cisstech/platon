import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { Field, FieldInput, Segmented, SegmentedOption } from '@platon/design-system'
import { STATE_FILTERS, StateFilter } from '../../course.vm'

/** The bar of the overview: the search on the activities and the sections, and the state filter. */
@Component({
  selector: 'app-overview-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Field, FieldInput, Segmented],
  templateUrl: './overview-bar.html',
  styleUrl: './overview-bar.scss',
})
export class OverviewBar {
  readonly search = input.required<string>()
  readonly state = input.required<StateFilter>()
  readonly searched = output<string>()
  readonly chosen = output<StateFilter>()

  protected readonly states: SegmentedOption<StateFilter>[] = [...STATE_FILTERS]

  protected type(event: Event): void {
    this.searched.emit((event.target as HTMLInputElement).value)
  }

  protected choose(state?: StateFilter): void {
    if (state) this.chosen.emit(state)
  }
}
