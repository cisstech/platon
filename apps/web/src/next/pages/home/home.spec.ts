import { BreakpointObserver } from '@angular/cdk/layout'
import { computed, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { isTeacherRole, UserRoles } from '@platon/core/common'
import { of } from 'rxjs'
import { Connectivity } from '../../core/connectivity/connectivity'
import { Session } from '../../core/session/session'
import { Home } from './home'
import { ShellStore } from '../../shell/data/shell-store'
import { StudentHomeStore } from './data/student-home-store'
import { TeacherHomeStore } from './data/teacher-home-store'

describe('Home', () => {
  const render = (role: UserRoles) => {
    const storeFake = () => ({
      status: signal('loading'),
      data: signal(undefined),
      dismissed: signal(new Set()),
      attempt: signal(0),
      load: jest.fn(),
      stop: jest.fn(),
    })
    const student = storeFake()
    const teacher = storeFake()
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: Session,
          useValue: { isTeacher: computed(() => isTeacherRole(role)), user: signal({ username: 'ines', role }) },
        },
        { provide: StudentHomeStore, useValue: student },
        { provide: TeacherHomeStore, useValue: teacher },
        { provide: ShellStore, useValue: { quietCreate: signal(false) } },
        { provide: Connectivity, useValue: { online: signal(true) } },
        { provide: BreakpointObserver, useValue: { observe: () => of({ matches: false }), isMatched: () => false } },
      ],
    })
    const fixture = TestBed.createComponent(Home)
    fixture.detectChanges()
    return { page: fixture.nativeElement as HTMLElement, student, teacher }
  }

  it.each([UserRoles.student, UserRoles.demo])(
    'gives a %s account the home of a student, which loads its data',
    (role) => {
      const { page, student, teacher } = render(role)

      expect(page.querySelector('app-student-home')).not.toBeNull()
      expect(student.load).toHaveBeenCalled()
      expect(teacher.load).not.toHaveBeenCalled()
    }
  )

  it.each([UserRoles.teacher, UserRoles.admin])(
    'gives a %s account the home of a teacher, which loads its data',
    (role) => {
      const { page, student, teacher } = render(role)

      expect(page.querySelector('app-teacher-home')).not.toBeNull()
      expect(teacher.load).toHaveBeenCalled()
      expect(student.load).not.toHaveBeenCalled()
    }
  )
})
