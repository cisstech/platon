import { Directive } from '@angular/core'

/**
 * Marks what a row of `pl-activity-row` does besides opening, such as « Planifier » or the button of
 * its menu: the row then opens from its title, over the whole row, and these stay apart.
 */
@Directive({ selector: '[plActivityRowActions]' })
export class ActivityRowActions {}
