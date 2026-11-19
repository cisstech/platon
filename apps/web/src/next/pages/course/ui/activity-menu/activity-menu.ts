import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core'
import { Button, Icon, Menu, MenuItem, MenuSeparator, MenuTrigger } from '@platon/design-system'

/** What the menu of an activity does, for its teacher. */
export type ActivityAction = 'settings' | 'test' | 'resource'

/**
 * The menu of an activity for its teacher, under a button that names it: settle it and test it, then
 * open the resource it was made from, when it still exists.
 */
@Component({
  selector: 'app-activity-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon, Menu, MenuItem, MenuSeparator, MenuTrigger],
  templateUrl: './activity-menu.html',
})
export class ActivityMenu {
  /** The title of the activity, in the name of the button. */
  readonly activity = input.required<string>()
  readonly resource = input(false, { transform: booleanAttribute })
  readonly chosen = output<ActivityAction>()
}
