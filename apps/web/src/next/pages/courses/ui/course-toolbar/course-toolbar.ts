import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output, viewChild } from '@angular/core'
import {
  Button,
  Field,
  FieldInput,
  Icon,
  Menu,
  MenuItem,
  MenuTrigger,
  Segmented,
  SegmentedOption,
} from '@platon/design-system'
import { CourseOrderings } from '@platon/feature/course/common'
import { CourseListFilters, CourseTab, ORDERS, PERIODS } from '../../courses.vm'

/**
 * The bar of the list of courses: the search on the name, the tabs with how many each holds
 * (« Toute la plateforme » for an administrator), the order and the period of the last update.
 * `compact` keeps the search and the tabs, on a narrow screen, and the period while it limits the list.
 */
@Component({
  selector: 'app-course-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Field, FieldInput, Icon, Menu, MenuItem, MenuTrigger, Segmented],
  host: { '[attr.data-compact]': "compact() ? '' : null" },
  templateUrl: './course-toolbar.html',
  styleUrl: './course-toolbar.scss',
})
export class CourseToolbar {
  readonly filters = input.required<CourseListFilters>()
  readonly current = input.required<number>()
  readonly archived = input.required<number>()
  /** Offers « Toute la plateforme »: for an administrator. */
  readonly platform = input(false, { transform: booleanAttribute })
  readonly compact = input(false, { transform: booleanAttribute })
  readonly searched = output<string>()
  readonly chosen = output<Partial<Omit<CourseListFilters, 'search'>>>()

  protected readonly orders = ORDERS
  protected readonly periods = PERIODS
  protected readonly tabs = computed<SegmentedOption<CourseTab>[]>(() => [
    { value: 'current', label: 'Actuels', count: this.current() },
    { value: 'archived', label: 'Archivés', count: this.archived() },
    ...(this.platform() ? [{ value: 'platform' as const, label: 'Toute la plateforme' }] : []),
  ])
  protected readonly orderLabel = computed(() => ORDERS.find(({ value }) => value === this.filters().order)?.label)
  protected readonly periodLabel = computed(() => PERIODS.find(({ value }) => value === this.filters().period)?.label)

  private readonly searchField = viewChild.required(FieldInput)
  private readonly tabsGroup = viewChild.required(Segmented)

  focusSearch(): void {
    this.searchField().element.focus()
  }

  /** Focuses the tab shown. */
  focusTabs(): void {
    this.tabsGroup().focus()
  }

  protected search(event: Event): void {
    this.searched.emit((event.target as HTMLInputElement).value)
  }

  protected chooseOrder(value: string): void {
    this.chosen.emit({ order: value as CourseOrderings })
  }

  protected choosePeriod(value: string): void {
    this.chosen.emit({ period: Number(value) })
  }
}
