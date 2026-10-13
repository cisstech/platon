import { Dialog as CdkDialog } from '@angular/cdk/dialog'
import { DOCUMENT } from '@angular/common'
import { ElementRef, inject, Signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { whenRendered } from '@platon/design-system'
import { Course } from '@platon/feature/course/common'
import { Session } from '../../core/session/session'
import { CoursesStore } from './data/courses-store'
import {
  COURSE_CREATE_HEADING_ID,
  CourseCreateData,
  CourseCreateDialog,
} from './ui/course-create-dialog/course-create-dialog'

/**
 * Creating a course, in a dialog over the list: from « Créer un cours » (`opener`), or from the address
 * `?create=true`, where « Créer » of the cover comes as `/courses/create`. The new course opens in the
 * place of that address, so that Back does not open the dialog again; closing the dialog leaves the
 * address. Call it in an injection context: it returns what opens the dialog.
 */
export const courseCreation = (opener: Signal<ElementRef<HTMLElement> | undefined>): (() => void) => {
  const store = inject(CoursesStore)
  const teaches = inject(Session).isTeacher
  const dialog = inject(CdkDialog)
  const router = inject(Router)
  const route = inject(ActivatedRoute)
  const document = inject(DOCUMENT)
  const later = whenRendered()
  let creating = false

  const fromAddress = () => route.snapshot.queryParamMap.get('create') === 'true'

  const leaveAddress = () => {
    if (!fromAddress()) return
    router
      .navigate([], {
        relativeTo: route,
        queryParams: { create: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      })
      .catch(console.error)
  }

  const open = (): void => {
    if (creating) return
    if (!teaches()) return leaveAddress()

    creating = true
    const replaceUrl = fromAddress()
    const focused = document.activeElement
    const dialogRef = dialog.open<Course, CourseCreateData>(CourseCreateDialog, {
      data: { create: (name, desc) => store.create(name, desc) },
      ariaLabelledBy: COURSE_CREATE_HEADING_ID,
      backdropClass: 'pl-scrim',
      // Opened from the address, nothing held the focus: it goes to « Créer un cours » on closing.
      restoreFocus: focused && focused !== document.body ? true : opener()?.nativeElement ?? true,
    })

    dialogRef.closed.subscribe((course) => {
      creating = false
      if (course) router.navigate(['/courses', course.id], { replaceUrl }).catch(console.error)
      else leaveAddress()
    })
  }

  route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
    if (params.get('create') === 'true') later(open)
  })

  return open
}
