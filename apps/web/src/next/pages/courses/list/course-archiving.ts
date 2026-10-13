import { LiveAnnouncer } from '@angular/cdk/a11y'
import { inject, Signal } from '@angular/core'
import { DialogService } from '@platon/core/browser/shared'
import { whenRendered } from '@platon/design-system'
import { CourseCardView } from '../courses.vm'
import { CoursesStore } from '../data/courses-store'

/** Where archiving moves the focus: a course of the list by its place, or its menu. */
export interface ArchivingFocus {
  course(index: number): void
  actions(index: number): void
}

/**
 * Archiving a course for oneself, or bringing it back. The course leaves the list at once, and the
 * focus goes to the one that takes its place. If the server refuses, the course comes back, the focus
 * on its menu, and a message says so. Call it in an injection context: it returns what archives the
 * course of a card (`archived` true) or brings it back.
 */
export const courseArchiving = (cards: Signal<CourseCardView[]>, focus: ArchivingFocus) => {
  const store = inject(CoursesStore)
  const messages = inject(DialogService)
  const announcer = inject(LiveAnnouncer)
  const later = whenRendered()

  return async (card: CourseCardView, archived: boolean): Promise<void> => {
    const course = (archived ? store.current() : store.archived()).find(({ id }) => id === card.id)
    if (!course) return

    const index = cards().findIndex(({ id }) => id === card.id)
    const moved = store.archive(course, archived)
    later(() => focus.course(index))

    if (!(await moved)) {
      messages.error(
        archived
          ? "Le cours n'a pas pu être archivé. Réessayez dans un instant."
          : "Le cours n'a pas pu revenir dans vos cours actuels. Réessayez dans un instant."
      )
      later(() => focus.actions(index))
      return
    }

    const said = archived
      ? `${card.heading} est rangé dans vos archivés.`
      : `${card.heading} est revenu dans vos cours actuels.`
    announcer.announce(said, 'polite').catch(console.error)
  }
}
